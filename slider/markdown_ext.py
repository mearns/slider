#! /usr/bin/env python
# vim: set fileencoding=utf-8: set encoding=utf-8:

import yaml
import collections
import types
import re
from markdown.blockprocessors import BlockProcessor
from markdown.extensions import Extension

class MetaDict(collections.Mapping):
    def __init__(self):
        self._data = {}
        self._loaded = False

    def is_loaded(self):
        return self._loaded

    def reset(self):
        self._data = {}
        self._loaded = False

    def load(self, d):
        self._loaded = True
        self._data = {}
        self._data.update(d)

    def dict(self):
        return dict(self._data)

    def __getitem__(self, key):
        return self._data[key]

    def __len__(self):
        return len(self._data)

    def __iter__(self):
        return iter(self._data)

class YamlMetaProcessor(BlockProcessor):

    _meta_data_detect_re = re.compile(r'^[0-9a-zA-Z\._-]+\s*:')

    def __init__(self, parser):
        BlockProcessor.__init__(self, parser)

        md = parser.markdown
        if not hasattr(md, 'Meta'):
            setattr(md, 'Meta', MetaDict())

    def test(self, parent, block):
        if not self.parser.markdown.Meta.is_loaded():
            self.parser.markdown.Meta.load({})
            return self._meta_data_detect_re.match(block) is not None
        return False

    def run(self, parent, blocks):
        self.parser.markdown.Meta.load(yaml.load(blocks.pop(0)))


class SliderExtension(Extension):
    def extendMarkdown(self, md, md_globals):
        md.parser.blockprocessors.add('yamlMeta', YamlMetaProcessor(md.parser), '_begin')


if __name__ == '__main__':
    pass


