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
import {DeepReadonly} from '../util/types';
import {CardGroup, CardGroupNode, CardIdWithMetadata} from './types';

export function groupCardIdWithMetdata(
  cards: DeepReadonly<CardIdWithMetadata[]>
): CardGroup[] {
  const tagPrefix = new Map<string, CardGroup>();

  const sortedCards = cards.slice().sort((cardA, cardB) => {
    return compareTagNames(cardA.tag, cardB.tag);
  });

  for (const card of sortedCards) {
    const groupName = getTagGroupName(card.tag);

    if (!tagPrefix.has(groupName)) {
      tagPrefix.set(groupName, {groupName, items: []});
    }

    tagPrefix.get(groupName)!.items.push(makeMutableCard(card));
  }

  return [...tagPrefix.values()];
}

function getTagGroupName(tag: string): string {
  return tag.split('/', 1)[0];
}

/**
 * Returns the path segments that define a card's position in the group tree.
 * For "train/loss/pixels" → ["train", "loss"] (all but the last segment).
 * For single-segment tags like "learning_rate" → ["learning_rate"].
 */
function getGroupPath(tag: string): string[] {
  const segments = tag.split('/');
  if (segments.length <= 1) {
    return segments;
  }
  return segments.slice(0, -1);
}

function makeMutableCard(
  card: DeepReadonly<CardIdWithMetadata>
): CardIdWithMetadata {
  const mutableCard: CardIdWithMetadata = {
    plugin: card.plugin,
    tag: card.tag,
    runId: card.runId,
    cardId: card.cardId,
  };
  if (card.tags !== undefined) {
    mutableCard.tags = [...card.tags];
  }
  if (card.title !== undefined) {
    mutableCard.title = card.title;
  }
  if (card.sample !== undefined) {
    mutableCard.sample = card.sample;
  }
  if (card.numSample !== undefined) {
    mutableCard.numSample = card.numSample;
  }
  return mutableCard;
}

function computeTotalCards(node: CardGroupNode): number {
  let total = node.items.length;
  for (const child of node.children) {
    total += computeTotalCards(child);
  }
  node.totalCards = total;
  return total;
}

export function buildCardGroupTree(
  cards: DeepReadonly<CardIdWithMetadata[]>
): CardGroupNode[] {
  const sortedCards = cards.slice().sort((cardA, cardB) => {
    return compareTagNames(cardA.tag, cardB.tag);
  });

  const rootChildren: CardGroupNode[] = [];

  for (const card of sortedCards) {
    const path = getGroupPath(card.tag);

    let siblings = rootChildren;
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      const fullPath = path.slice(0, i + 1).join('/');

      let node = siblings.find((c) => c.groupPath === fullPath);
      if (!node) {
        node = {
          segmentName: segment,
          groupPath: fullPath,
          items: [],
          children: [],
          totalCards: 0,
        };
        siblings.push(node);
      }

      if (i === path.length - 1) {
        node.items.push(makeMutableCard(card));
      }
      siblings = node.children;
    }
  }

  for (const child of rootChildren) {
    computeTotalCards(child);
  }

  return rootChildren;
}

/**
 * Collects all groupPath values from a tree of CardGroupNodes (for
 * initializing expansion state).
 */
export function collectGroupPaths(nodes: CardGroupNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    paths.push(node.groupPath);
    paths.push(...collectGroupPaths(node.children));
  }
  return paths;
}

let htmlToTextScratch: HTMLDivElement | null = null;

export function htmlToText(html: string): string {
  if (!html) {
    return '';
  }
  if (typeof document === 'undefined') {
    return html;
  }
  if (!htmlToTextScratch) {
    htmlToTextScratch = document.createElement('div');
  }
  htmlToTextScratch.innerHTML = html;
  return htmlToTextScratch.textContent || '';
}

export function buildTagTooltip(tag: string, description: string): string {
  if (!description) {
    return tag;
  }
  return `${tag}\n${description}`;
}

// TODO(b/154055328): combine this with the OSS ts_library compat version.
// Adopted from tensorboard/components/vz_sorting/sorting.js
// Delta:
// - better typing
// - human readable variable names
// - removed componentization by "_".

/**
 * Compares tag names asciinumerically broken into components.
 *
 * Unlike the standard asciibetical comparator, this function knows that 'a10b'
 * > 'a2b'. Fixed point and engineering notation are supported. This function
 * also splits the input by slash to perform array comparison. Therefore it
 * knows that 'a/a' < 'a+/a' even though '+' < '/' in the ASCII table.
 */
export function compareTagNames(tagA: string, tagB: string) {
  let aIndex = 0;
  let bIndex = 0;

  while (true) {
    if (aIndex === tagA.length) {
      return bIndex === tagB.length ? 0 : -1;
    }
    if (bIndex === tagB.length) {
      return 1;
    }

    if (isDigit(tagA[aIndex]) && isDigit(tagB[bIndex])) {
      const aNumberStart = aIndex;
      const bNumberStart = bIndex;
      aIndex = consumeNumber(tagA, aIndex + 1);
      bIndex = consumeNumber(tagB, bIndex + 1);
      const an = Number(tagA.slice(aNumberStart, aIndex));
      const bn = Number(tagB.slice(bNumberStart, bIndex));
      if (an < bn) {
        return -1;
      }
      if (an > bn) {
        return 1;
      }
      continue;
    }

    if (isBreak(tagA[aIndex])) {
      if (!isBreak(tagB[bIndex])) {
        return -1;
      }
    } else if (isBreak(tagB[bIndex])) {
      return 1;
    } else if (tagA[aIndex] < tagB[bIndex]) {
      return -1;
    } else if (tagA[aIndex] > tagB[bIndex]) {
      return 1;
    }

    aIndex++;
    bIndex++;
  }
}

/**
 * Returns endIndex of a number sequence in string starting from startIndex.
 *
 * The method can handle scientific notation, real and natural numbers, and
 * numbers with exponents. Do note that it does not treat decimals that start
 * with "." as a real number.
 */
function consumeNumber(s: string, startIndex: number): number {
  enum State {
    NATURAL,
    REAL,
    EXPONENT_SIGN,
    EXPONENT,
  }

  let state = State.NATURAL;
  let i = startIndex;
  for (; i < s.length; i++) {
    if (state === State.NATURAL) {
      if (s[i] === '.') {
        state = State.REAL;
      } else if (s[i] === 'e' || s[i] === 'E') {
        state = State.EXPONENT_SIGN;
      } else if (!isDigit(s[i])) {
        break;
      }
    } else if (state === State.REAL) {
      if (s[i] === 'e' || s[i] === 'E') {
        state = State.EXPONENT_SIGN;
      } else if (!isDigit(s[i])) {
        break;
      }
    } else if (state === State.EXPONENT_SIGN) {
      if (isDigit(s[i]) || s[i] === '+' || s[i] === '-') {
        state = State.EXPONENT;
      } else {
        break;
      }
    } else if (state === State.EXPONENT) {
      if (!isDigit(s[i])) {
        break;
      }
    }
  }
  return i;
}

function isDigit(character: string): boolean {
  return '0' <= character && character <= '9';
}

function isBreak(character: string): boolean {
  return character === '/' || isDigit(character);
}
