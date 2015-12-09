#! /usr/bin/env python
# vim: set fileencoding=utf-8: set encoding=utf-8:

import markdown
import re
import jinja2
import types
import collections
import os.path
from .markdown_ext import SliderExtension

class Author(object):
    def __init__(self, value):
        if isinstance(value, types.StringTypes):
            self.data = dict(name=value)
        elif isinstance(value, collections.Mapping):
            self.data = dict()
            self.data.update(value)
        else:
            raise TypeError('Author should be instantiated with a string or mapping: %r' % (value,))

    def get(self, key, default=None):
        return self.data.get(key, default)

    def __str__(self):
        return self.get('name') or self.get('twitter') or self.get('email')

    def __repr__(self):
        return '%s(%r)' % (type(self).__name__, self.data)

class HelpfulDict(collections.Mapping):
    def __init__(self, data):
        self._data = dict(data)

    def __getitem__(self, key):
        return self._data[key]

    def __len__(self):
        return len(self._data)

    def __iter__(self):
        return iter(self._data)

    def get_as_list(self, *keys):
        results = []
        for key in keys:
            val = self._data.get(key, None)
            if val is None:
                val = []
            elif isinstance(val, (types.StringTypes, collections.Mapping)):
                val = [val]
            elif isinstance(val, collections.Sequence):
                val = list(val)
            else:
                val = [val]
            results += val

        return results



class Slide(object):
    def __init__(self, md, generator, slide_number, slide_count, markdown, *args, **kwargs):
        self._slide_number = slide_number
        self._slide_count = slide_count
        self._classes = args

        if kwargs:
            if len(kwargs) == 1:
                raise TypeError("Unexpected argument '%s'." % (kwargs.keys()[0],))
            else:
                raise TypeError("Unexpected arguments: %s" % ', '.join("'%s'" % k for k in kwargs.keys()))

        #Parse the markdown
        md.Meta.reset()
        rendered_content = md.convert(markdown)
        meta = HelpfulDict(md.Meta)

        #Load the template and render the slide.
        titles = meta.get_as_list('title')
        self._html = generator.get_default_slide_template().render(dict(
                meta = meta,
                content = rendered_content,
                slide_number = self._slide_number,
                slide_count = self._slide_count,
                deck_meta = generator.get_deck_meta(),
                titles = titles,
                title = titles[0] if titles else None,
                authors = meta.get_as_list('author') or generator.get_authors()
        ))
            

    @property
    def html(self):
        return self._html

    @property
    def slide_number(self):
        return self._slide_number

    @property
    def slide_count(self):
        return self._slide_count

    @property
    def classes(self):
        return self._classes


class PresentationGenerator(object):

    _slide_sep_re = re.compile(r'^---*(?P<args>\s*$|\s.*?$)(?P<markdown>.*?(?=^--|\Z))', re.MULTILINE | re.DOTALL)

    def __init__(self):
        self._meta = HelpfulDict({})
        self._search_path = ['res']
        self._stylesheets = ['core.css']
        self._javascripts = ['jquery-2.1.4.min.js', 'slider.js']
        self._embed_all = False
        self._embed_stylesheets = False
        self._embed_javascripts = False

    def get_template(self, template_name):
        """
        Load a jinja template object with the given name.
        """
        env = jinja2.Environment(loader = jinja2.FileSystemLoader([os.path.join(p, 'templates') for p in self._search_path]))
        return env.get_template(template_name)

    def find_resource(self, res_type, name):
        for path in self._search_path:
            fullpath = os.path.join(path, res_type, name)
            if os.path.exists(fullpath):
                return fullpath
        return None
        

    def get_stylesheet(self, name):
        """
        Find the path to a named stylesheet by searching the search_path.
        """
        return self.find_resource('style', name)

    def get_javascript(self, name):
        return self.find_resource('script', name)

    def get_linked_stylesheets(self):
        """
        Get an array of paths or URLs to stylesheets that should be linked from the presentation.
        """
        if self._embed_all or self._embed_stylesheets:
            return []
        else:
            return [self.get_stylesheet(s) for s in self._stylesheets]
        
    def get_css(self):
        """
        Get CSS that should be embedded directly in the presentation, as a string. Or None.
        """
        if self._embed_all or self._embed_stylesheets:
            css = []
            for stylesheet in self._stylesheets:
                path = self.get_stylesheet(stylesheet)
                if path is not None:
                    with open(path, 'rb') as ifile:
                        css.append((stylesheet, ifile.read()))

            return '\n\n'.join('/* %s */\n%s' % (path, content) for (path, content) in css)
        else:
            return None
                
    def get_linked_javascripts(self):
        if self._embed_all or self._embed_javascripts:
            return []
        else:
            return [self.get_javascript(s) for s in self._javascripts]

    def get_embedded_javascripts(self):
        scripts = []
        if self._embed_all or self._embed_javascripts:
            for script in self._javascripts:
                path = self.get_javascript(script)
                if path is not None:
                    with open(path, 'rb') as ifile:
                        scripts.append('// --- %s ---\n%s' % (script, ifile.read()))
        return scripts
    

    def get_deck_template(self):
        return self.get_template('deck.html')

    def get_default_slide_template(self):
        return self.get_template('slide.html')

    def set_deck_meta(self, meta):
        meta = HelpfulDict(meta)
        self._meta = meta

        #Parse the authors
        self._authors = [Author(a) for a in meta.get_as_list('author')]

        #And the presentation titles
        self._titles = meta.get_as_list('title')
        self._title = self._titles[0] if self._titles else None

    def get_authors(self):
        return self._authors

    def get_deck_meta(self):
        return self._meta
        
    def get_markdown_processor(self):
        #The markdown transcriber
        return markdown.Markdown(
            output_format='xhtml5',
            safe_mode=False,
            extensions = [
                'extra', 
                'codehilite',
                SliderExtension(),
            ]
        )

    def markdown_to_html(self, istream, ostream):
        md = self.get_markdown_processor()

        #Split the input into slides.
        source_data = istream.read()
        mobjs = tuple(self._slide_sep_re.finditer(source_data))

        #Everything before the first slide is the deck configuration and meta-data.
        if mobjs:
            deck_setup = source_data[:mobjs[0].start()]
        else:
            #If there were no slides, I guess the whole thing is the setup.
            deck_setup = source_data

        #Parse the deck_setup to get the data.
        deck_text = md.convert(deck_setup)
        if deck_text.strip():
            raise ValueError("Oops, looks like you tried to put some content in the header. The first slide comes _after_ the first '--'.")
        self.set_deck_meta(md.Meta.dict())

        #Write the file header.
        template_name = 'slide.html'

        #Generator for all of the Slide obejcts
        slide_count = len(mobjs)
        slides = (Slide(
            md, self, i, slide_count, mobj.group('markdown').lstrip(), *(mobj.group('args').split())
        ) for i, mobj in enumerate(mobjs, 1))
        
        #Write out the deck file.
        ostream.write(self.get_deck_template().render(dict(
            title = self._title,
            titles = self._titles,
            authors = self._authors,
            linked_stylsheets = self.get_linked_stylesheets(),
            page_css = self.get_css(),
            deck_meta = self._meta,
            slides = slides,
            linked_javascripts = self.get_linked_javascripts(),
            embedded_javascripts = self.get_embedded_javascripts(),
        )))
        
            


