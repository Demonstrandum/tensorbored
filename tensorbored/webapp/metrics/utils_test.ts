/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/
import {PluginType} from './data_source';
import {
  buildCardGroupTree,
  buildTagTooltip,
  collectGroupPaths,
  compareTagNames,
  groupCardIdWithMetdata,
  htmlToText,
} from './utils';
import {CardIdWithMetadata, CardGroupNode} from './views/metrics_view_types';

function buildCardIdWithMetadata(
  override: Partial<CardIdWithMetadata>
): CardIdWithMetadata {
  return {
    cardId: 'foo',
    plugin: PluginType.SCALARS,
    tag: 'tag',
    runId: null,
    ...override,
  };
}

describe('metrics utils', () => {
  describe('groupCardIdWithMetdata', () => {
    it('groups card ids with metadata by tag prefix', () => {
      const cards = [
        buildCardIdWithMetadata({cardId: 'foo', tag: 'a/b/c'}),
        buildCardIdWithMetadata({cardId: 'bar', tag: 'a/b/c/d'}),
        buildCardIdWithMetadata({cardId: 'baz', tag: 'b'}),
        buildCardIdWithMetadata({cardId: 'qaz', tag: 'c/c/d'}),
      ];

      const groups = groupCardIdWithMetdata(cards);

      expect(groups).toEqual([
        {
          groupName: 'a',
          items: [
            buildCardIdWithMetadata({cardId: 'foo', tag: 'a/b/c'}),
            buildCardIdWithMetadata({cardId: 'bar', tag: 'a/b/c/d'}),
          ],
        },
        {
          groupName: 'b',
          items: [buildCardIdWithMetadata({cardId: 'baz', tag: 'b'})],
        },
        {
          groupName: 'c',
          items: [buildCardIdWithMetadata({cardId: 'qaz', tag: 'c/c/d'})],
        },
      ]);
    });

    it('sorts the groups by tag name', () => {
      const cards = [
        buildCardIdWithMetadata({cardId: 'baz', tag: 'b'}),
        buildCardIdWithMetadata({cardId: 'bar', tag: 'a/b/c/d'}),
        buildCardIdWithMetadata({cardId: 'foo', tag: 'a/b/c'}),
        buildCardIdWithMetadata({cardId: 'qaz', tag: 'c/c/d'}),
      ];

      const groups = groupCardIdWithMetdata(cards);

      expect(groups).toEqual([
        {
          groupName: 'a',
          items: [
            buildCardIdWithMetadata({cardId: 'foo', tag: 'a/b/c'}),
            buildCardIdWithMetadata({cardId: 'bar', tag: 'a/b/c/d'}),
          ],
        },
        {
          groupName: 'b',
          items: [buildCardIdWithMetadata({cardId: 'baz', tag: 'b'})],
        },
        {
          groupName: 'c',
          items: [buildCardIdWithMetadata({cardId: 'qaz', tag: 'c/c/d'})],
        },
      ]);
    });

    it('handles weird tag names', () => {
      // Traditional TensorBoard handles it like below which is less than ideal.
      // TODO(stephanwlee, psybuzz): find the better UX for this.
      const cards = [
        buildCardIdWithMetadata({cardId: 'baz', tag: '/'}),
        buildCardIdWithMetadata({cardId: 'foo', tag: '/a/'}),
      ];

      const groups = groupCardIdWithMetdata(cards);

      expect(groups).toEqual([
        {
          groupName: '',
          items: [
            buildCardIdWithMetadata({cardId: 'baz', tag: '/'}),
            buildCardIdWithMetadata({cardId: 'foo', tag: '/a/'}),
          ],
        },
      ]);
    });
  });

  describe('buildCardGroupTree', () => {
    it('builds flat groups for single-segment tags', () => {
      const cards = [
        buildCardIdWithMetadata({cardId: 'a', tag: 'loss'}),
        buildCardIdWithMetadata({cardId: 'b', tag: 'accuracy'}),
      ];

      const tree = buildCardGroupTree(cards);

      expect(tree).toEqual([
        {
          segmentName: 'accuracy',
          groupPath: 'accuracy',
          items: [buildCardIdWithMetadata({cardId: 'b', tag: 'accuracy'})],
          children: [],
          totalCards: 1,
        },
        {
          segmentName: 'loss',
          groupPath: 'loss',
          items: [buildCardIdWithMetadata({cardId: 'a', tag: 'loss'})],
          children: [],
          totalCards: 1,
        },
      ]);
    });

    it('groups by first slash segment', () => {
      const cards = [
        buildCardIdWithMetadata({cardId: 'a', tag: 'train/loss'}),
        buildCardIdWithMetadata({cardId: 'b', tag: 'train/accuracy'}),
        buildCardIdWithMetadata({cardId: 'c', tag: 'eval/loss'}),
      ];

      const tree = buildCardGroupTree(cards);

      expect(tree.length).toBe(2);
      expect(tree[0].segmentName).toBe('eval');
      expect(tree[0].items.length).toBe(1);
      expect(tree[0].items[0].tag).toBe('eval/loss');
      expect(tree[1].segmentName).toBe('train');
      expect(tree[1].items.length).toBe(2);
    });

    it('creates nested groups for multi-slash tags', () => {
      const cards = [
        buildCardIdWithMetadata({cardId: 'a', tag: 'train/loss/pixels'}),
        buildCardIdWithMetadata({cardId: 'b', tag: 'train/loss/text'}),
        buildCardIdWithMetadata({cardId: 'c', tag: 'train/accuracy'}),
      ];

      const tree = buildCardGroupTree(cards);

      expect(tree.length).toBe(1);
      const trainNode = tree[0];
      expect(trainNode.segmentName).toBe('train');
      expect(trainNode.groupPath).toBe('train');
      expect(trainNode.items.length).toBe(1);
      expect(trainNode.items[0].tag).toBe('train/accuracy');
      expect(trainNode.children.length).toBe(1);

      const lossNode = trainNode.children[0];
      expect(lossNode.segmentName).toBe('loss');
      expect(lossNode.groupPath).toBe('train/loss');
      expect(lossNode.items.length).toBe(2);
      expect(lossNode.items[0].tag).toBe('train/loss/pixels');
      expect(lossNode.items[1].tag).toBe('train/loss/text');
      expect(lossNode.children.length).toBe(0);
    });

    it('computes totalCards across the subtree', () => {
      const cards = [
        buildCardIdWithMetadata({cardId: 'a', tag: 'train/loss/pixels'}),
        buildCardIdWithMetadata({cardId: 'b', tag: 'train/loss/text'}),
        buildCardIdWithMetadata({cardId: 'c', tag: 'train/accuracy'}),
        buildCardIdWithMetadata({cardId: 'd', tag: 'eval/loss'}),
      ];

      const tree = buildCardGroupTree(cards);

      const evalNode = tree[0];
      expect(evalNode.segmentName).toBe('eval');
      expect(evalNode.totalCards).toBe(1);

      const trainNode = tree[1];
      expect(trainNode.totalCards).toBe(3);
      expect(trainNode.children[0].totalCards).toBe(2);
    });

    it('handles deeply nested tags', () => {
      const cards = [
        buildCardIdWithMetadata({cardId: 'a', tag: 'a/b/c/d/metric'}),
      ];

      const tree = buildCardGroupTree(cards);

      expect(tree.length).toBe(1);
      expect(tree[0].segmentName).toBe('a');
      expect(tree[0].children.length).toBe(1);
      expect(tree[0].children[0].segmentName).toBe('b');
      expect(tree[0].children[0].children.length).toBe(1);
      expect(tree[0].children[0].children[0].segmentName).toBe('c');
      expect(tree[0].children[0].children[0].children.length).toBe(1);
      expect(tree[0].children[0].children[0].children[0].segmentName).toBe('d');
      expect(tree[0].children[0].children[0].children[0].items[0].tag).toBe(
        'a/b/c/d/metric'
      );
    });

    it('mixes leaves and nested children at the same level', () => {
      const cards = [
        buildCardIdWithMetadata({cardId: 'a', tag: 'train/loss'}),
        buildCardIdWithMetadata({cardId: 'b', tag: 'train/loss/pixels'}),
      ];

      const tree = buildCardGroupTree(cards);

      const trainNode = tree[0];
      expect(trainNode.items.length).toBe(1);
      expect(trainNode.items[0].tag).toBe('train/loss');
      expect(trainNode.children.length).toBe(1);
      expect(trainNode.children[0].segmentName).toBe('loss');
      expect(trainNode.children[0].items[0].tag).toBe('train/loss/pixels');
    });
  });

  describe('collectGroupPaths', () => {
    it('collects all paths from a tree', () => {
      const nodes: CardGroupNode[] = [
        {
          segmentName: 'train',
          groupPath: 'train',
          items: [],
          children: [
            {
              segmentName: 'loss',
              groupPath: 'train/loss',
              items: [],
              children: [],
              totalCards: 2,
            },
          ],
          totalCards: 3,
        },
        {
          segmentName: 'eval',
          groupPath: 'eval',
          items: [],
          children: [],
          totalCards: 1,
        },
      ];

      const paths = collectGroupPaths(nodes);
      expect(paths).toEqual(['train', 'train/loss', 'eval']);
    });
  });

  describe('#compareTagNames', () => {
    function sortTagNames(tags: string[]): string[] {
      return tags.sort(compareTagNames);
    }

    it('sorts asciibetical when no number or separators are present', () => {
      expect(sortTagNames(['a', 'b'])).toEqual(['a', 'b']);
      expect(sortTagNames(['a', 'B'])).toEqual(['B', 'a']);
    });

    it('sorts integer portions', () => {
      expect(sortTagNames(['03', '1'])).toEqual(['1', '03']);
      expect(sortTagNames(['a03', 'a1'])).toEqual(['a1', 'a03']);
      expect(sortTagNames(['a03', 'b1'])).toEqual(['a03', 'b1']);
      expect(sortTagNames(['x0a03', 'x0a1'])).toEqual(['x0a1', 'x0a03']);
      expect(sortTagNames(['a/b/03', 'a/b/1'])).toEqual(['a/b/1', 'a/b/03']);
    });

    it('sorts fixed point numbers', () => {
      expect(sortTagNames(['a0.1', 'a0.01'])).toEqual(['a0.01', 'a0.1']);
    });

    it('sorts engineering notation', () => {
      expect(sortTagNames(['a1e9', 'a9e8'])).toEqual(['a9e8', 'a1e9']);
      expect(sortTagNames(['a1e+9', 'a9e+8'])).toEqual(['a9e+8', 'a1e+9']);
      expect(sortTagNames(['a1e+5', 'a9e-6'])).toEqual(['a9e-6', 'a1e+5']);
      expect(sortTagNames(['a1.0e9', 'a9.0e8'])).toEqual(['a9.0e8', 'a1.0e9']);
      expect(sortTagNames(['a1.0e+9', 'a9.0e+8'])).toEqual([
        'a9.0e+8',
        'a1.0e+9',
      ]);
    });

    it('sorts fragments componentized by slash', () => {
      expect(sortTagNames(['a+/a', 'a/a', 'ab/c', 'ab/a'])).toEqual([
        'a/a',
        'a+/a',
        'ab/a',
        'ab/c',
      ]);
    });

    it('sorts fragments componentized by number boundaries', () => {
      expect(sortTagNames(['a+0a', 'a0a', 'ab0a'])).toEqual([
        'a0a',
        'a+0a',
        'ab0a',
      ]);
    });

    it('sorts to make empty string comes the first', () => {
      expect(sortTagNames(['a', '//', '/', ''])).toEqual(['', '/', '//', 'a']);
    });

    it('parses decimal correctly', () => {
      expect(sortTagNames(['0.2', '0.03'])).toEqual(['0.03', '0.2']);
      expect(sortTagNames(['0..2', '0..03'])).toEqual(['0..2', '0..03']);
      expect(sortTagNames(['.2', '.03'])).toEqual(['.2', '.03']);
    });
  });

  describe('#htmlToText', () => {
    it('strips HTML markup from descriptions', () => {
      expect(htmlToText('<p>Hello <strong>world</strong>.</p>')).toBe(
        'Hello world.'
      );
    });
  });

  describe('#buildTagTooltip', () => {
    it('returns tag alone when description is empty', () => {
      expect(buildTagTooltip('train/loss', '')).toBe('train/loss');
    });

    it('combines tag and description when provided', () => {
      expect(buildTagTooltip('train/loss', 'The training loss.')).toBe(
        'train/loss\nThe training loss.'
      );
    });
  });
});
