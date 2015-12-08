#! /usr/bin/env python
# vim: set fileencoding=utf-8: set encoding=utf-8:

from slider import PresentationGenerator

if __name__ == '__main__':
    
    import codecs
    import sys

    with open('test.html', 'w') as ofile:
        PresentationGenerator().markdown_to_html(codecs.open("test.md", mode='r', encoding='utf-8'), ofile)


