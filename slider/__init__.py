#! /usr/bin/env python
# vim: set fileencoding=utf-8: set encoding=utf-8:

import yaml
import markdown
import re
import jinja2
import types
import collections
from markdown.blockprocessors import BlockProcessor
from markdown.extensions import Extension

class Author(object):
    def __init__(self, value):
        if isinstance(value, types.StringTypes):
            self.data = dict(name=value)
        elif isinstance(value, collections.Mapping):
            self.data = dict()
            self.data.update(value)
        else:
            raise TypeError('Author should be instantiated with a string or mapping.')

    def __str__(self):
        return self.get('name') or self.get('twitter') or self.get('email')

    def __repr__(self):
        return '%s(%r)' % (type(self).__name__, self.data)


class YamlMetaProcessor(BlockProcessor):
    def __init__(self, parser):
        BlockProcessor.__init__(self, parser)

        md = parser.markdown
        if not hasattr(md, 'Meta'):
            setattr(md, 'Meta', dict())

    def test(self, parent, block):
        print parent
        return (not self.parser.markdown.Meta) and re.match(r'^[0-9a-zA-Z\._-]+:', block) is not None

    def run(self, parent, blocks):
        self.parser.markdown.Meta = yaml.load(blocks.pop(0))


class SliderExtension(Extension):
    def extendMarkdown(self, md, md_globals):
        md.parser.blockprocessors.add('yamlMeta', YamlMetaProcessor(md.parser), '_begin')

class PresentationGenerator(object):

    _slide_sep_re = re.compile(r'^---*(?P<args>\s*$|\s.*?$)(?P<markdown>.*?(?=^--|\Z))', re.MULTILINE | re.DOTALL)

    def __init__(self):
        self._template_env = jinja2.Environment(loader = jinja2.FileSystemLoader(['./templates']))

    def get_template(self, template_name):
        return self._template_env.get_template(template_name)

    def markdown_to_html(self, istream, ostream):
        #The markdown transcriber
        md = markdown.Markdown(
            output_format='xhtml5',
            safe_mode=False,
            extensions = [
                'extra', 
                'codehilite',
                SliderExtension(),
            ]
        )

        #Write the file header.
        ostream.write("""
<!DOCTYPE html >
<html>
    <head>
        <meta charset='utf-8' />

        <title>TODO: Untitled</title>

        <link rel='stylesheet' type='text/css' href='style.css' />

        <style type='text/css'>
        /* <![CDATA[ */
        /* TODO: Read CSS from file, put here. */
        /* ]]> */
        </style>
    </head>
    <body>
        <article class="deck">

""")
        template_name = 'slide.html'
        source_data = istream.read()
        mobjs = tuple(self._slide_sep_re.finditer(source_data))
        slide_count = len(mobjs)

        if mobjs:
            deck_content = source_data[:mobjs[0].start()]
        else:
            deck_content = source_data
        source_data = None

        print 'Parsing deck_content:'
        print '----------------------'
        print deck_content
        print '----------------------'
        md.convert(deck_content)
        print 'Parsed.'
        deck_meta = md.Meta
        deck_authors = [Author(a) for a in deck_meta.get('author', [])]
        print deck_meta.get('author')
        
        #Generate and write out each slide.
        for i, mobj in enumerate(mobjs, 1):
            args = mobj.group('args')
            classNames = args.split()
            markdown_content = mobj.group('markdown').strip()

            #Parse the slide
            md.Meta = {}
            text = md.convert(markdown_content)
            meta = dict()
            meta.update(md.Meta)

            ostream.write("<section class='slide %s' id='slide-%d'>\n" % (' '.join(classNames), i,))

            ostream.write(self.get_template(template_name).render(dict(
                html = text,
                markdown = markdown_content,
                title = meta.get('title', [None])[0],
                titles = meta.get('title', []),
                subtitle = meta.get('subtitle', [None])[0],
                subtitles = meta.get('subtitle', []),
                slide_number = i,
                slide_count = slide_count,
                meta = meta,
                deck_meta = deck_meta,
                authors = [Author(a) for a in meta.get('author', [])] or deck_authors
            )))
            ostream.write("\n</section><!-- end #slide-%d -->\n\n" % (i,))
            
        #Write the file tail.
        ostream.write("""
        </article>
    </body>
</html>
""")

        
            


