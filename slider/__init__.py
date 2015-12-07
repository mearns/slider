#! /usr/bin/env python
# vim: set fileencoding=utf-8: set encoding=utf-8:

import markdown
import re

class PresentationGenerator(object):

    _slide_sep_re = re.compile(r'^---*(?P<args>\s*$|\s.*$)(?P<markdown>.*?(?=^--|\Z))', re.MULTILINE | re.DOTALL)

    def __init__(self):
        pass

    def markdown_to_html(self, istream, ostream):
        md = markdown.Markdown(
            output_format='xhtml5',
            safe_mode=False,
            extensions = [
                'extra', 
                'codehilite',
                'meta',
            ]
        )

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
        
        for i, mobj in enumerate(self._slide_sep_re.finditer(istream.read()), 1):
            args = mobj.group('args')
            classNames = args.split()
            markdown_content = mobj.group('markdown')
            text = md.convert(markdown_content)
            ostream.write("<section class='slide %s' id='slide-%d'>\n" % (' '.join(classNames), i,))
            ostream.write(md.convert(text))
            ostream.write("\n</section><!-- end #slide-%d -->\n\n" % (i,))
            
        ostream.write("""
        </article>
    </body>
</html>
""")

        
            


