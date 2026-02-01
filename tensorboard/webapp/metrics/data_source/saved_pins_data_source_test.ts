/* Copyright 2024 The TensorFlow Authors. All Rights Reserved.

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
import {TestBed} from '@angular/core/testing';
import {SavedPinsDataSource} from './saved_pins_data_source';
import {CardUniqueInfo} from '../internal_types';

const SAVED_SCALAR_PINS_KEY = 'tb-saved-scalar-pins';
const SAVED_PINS_KEY = 'tb-saved-pins';

describe('SavedPinsDataSource Test', () => {
  let mockStorage: Record<string, string>;
  let dataSource: SavedPinsDataSource;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [SavedPinsDataSource],
    });

    dataSource = TestBed.inject(SavedPinsDataSource);

    mockStorage = {};
    spyOn(window.localStorage, 'setItem').and.callFake(
      (key: string, value: string) => {
        // Allow both old and new keys
        if (key !== SAVED_SCALAR_PINS_KEY && key !== SAVED_PINS_KEY) {
          throw new Error('incorrect key used: ' + key);
        }
        mockStorage[key] = value;
      }
    );

    spyOn(window.localStorage, 'getItem').and.callFake((key: string) => {
      // Allow both old and new keys
      if (key !== SAVED_SCALAR_PINS_KEY && key !== SAVED_PINS_KEY) {
        throw new Error('incorrect key used: ' + key);
      }
      return mockStorage[key];
    });
  });

  describe('getSavedScalarPins', () => {
    it('gets the saved scalar pins', () => {
      window.localStorage.setItem(
        SAVED_SCALAR_PINS_KEY,
        JSON.stringify(['new_tag'])
      );

      const result = dataSource.getSavedScalarPins();

      expect(result).toEqual(['new_tag']);
    });

    it('returns empty list if there is no saved pins', () => {
      const result = dataSource.getSavedScalarPins();

      expect(result).toEqual([]);
    });
  });

  describe('saveScalarPin', () => {
    it('stores the provided tag in the local storage', () => {
      dataSource.saveScalarPin('tag1');

      expect(dataSource.getSavedScalarPins()).toEqual(['tag1']);
    });

    it('adds the provided tag to the existing list', () => {
      window.localStorage.setItem(
        SAVED_SCALAR_PINS_KEY,
        JSON.stringify(['tag1'])
      );

      dataSource.saveScalarPin('tag2');

      expect(dataSource.getSavedScalarPins()).toEqual(['tag1', 'tag2']);
    });

    it('does not add the provided tag if it already exists', () => {
      window.localStorage.setItem(
        SAVED_SCALAR_PINS_KEY,
        JSON.stringify(['tag1', 'tag2'])
      );

      dataSource.saveScalarPin('tag2');

      expect(dataSource.getSavedScalarPins()).toEqual(['tag1', 'tag2']);
    });
  });

  describe('saveScalarPins', () => {
    it('stores the provided tags in the local storage', () => {
      dataSource.saveScalarPins(['tag1', 'tag2']);

      expect(dataSource.getSavedScalarPins()).toEqual(['tag1', 'tag2']);
    });

    it('adds the provided tags to the existing list', () => {
      window.localStorage.setItem(
        SAVED_SCALAR_PINS_KEY,
        JSON.stringify(['tag1'])
      );

      dataSource.saveScalarPins(['tag2']);

      expect(dataSource.getSavedScalarPins()).toEqual(['tag1', 'tag2']);
    });

    it('does not add the tag if it already exists', () => {
      window.localStorage.setItem(
        SAVED_SCALAR_PINS_KEY,
        JSON.stringify(['tag1', 'tag2'])
      );

      dataSource.saveScalarPins(['tag2', 'tag3']);

      expect(dataSource.getSavedScalarPins()).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });

  describe('removeScalarPin', () => {
    it('removes the given tag if it exists', () => {
      dataSource.saveScalarPin('tag3');

      dataSource.removeScalarPin('tag3');

      expect(dataSource.getSavedScalarPins().length).toEqual(0);
    });

    it('does not remove anything if the given tag does not exist', () => {
      dataSource.saveScalarPin('tag1');

      dataSource.removeScalarPin('tag3');

      expect(dataSource.getSavedScalarPins()).toEqual(['tag1']);
    });
  });

  describe('removeAllScalarPins', () => {
    it('removes all existing pins', () => {
      dataSource.saveScalarPin('tag3');
      dataSource.saveScalarPin('tag4');

      dataSource.removeAllScalarPins();

      expect(dataSource.getSavedScalarPins().length).toEqual(0);
    });
  });

  // ============================================================================
  // Tests for new CardUniqueInfo-based methods
  // ============================================================================

  describe('getSavedPins', () => {
    it('returns empty array when no pins saved', () => {
      const result = dataSource.getSavedPins();
      expect(result).toEqual([]);
    });

    it('returns saved pins', () => {
      const pin: CardUniqueInfo = {plugin: 'scalars', tag: 'loss'};
      mockStorage[SAVED_PINS_KEY] = JSON.stringify([pin]);

      const result = dataSource.getSavedPins();
      expect(result).toEqual([pin]);
    });

    it('handles invalid JSON gracefully', () => {
      mockStorage[SAVED_PINS_KEY] = 'not valid json';

      const result = dataSource.getSavedPins();
      expect(result).toEqual([]);
    });
  });

  describe('savePin', () => {
    it('saves a scalar pin', () => {
      const pin: CardUniqueInfo = {plugin: 'scalars', tag: 'loss'};

      dataSource.savePin(pin);

      expect(dataSource.getSavedPins()).toEqual([pin]);
    });

    it('saves a histogram pin', () => {
      const pin: CardUniqueInfo = {
        plugin: 'histograms',
        tag: 'weights',
        runId: 'run1',
      };

      dataSource.savePin(pin);

      expect(dataSource.getSavedPins()).toEqual([pin]);
    });

    it('saves an image pin with sample', () => {
      const pin: CardUniqueInfo = {
        plugin: 'images',
        tag: 'generated',
        runId: 'run1',
        sample: 3,
      };

      dataSource.savePin(pin);

      expect(dataSource.getSavedPins()).toEqual([pin]);
    });

    it('does not duplicate pins', () => {
      const pin: CardUniqueInfo = {plugin: 'scalars', tag: 'loss'};

      dataSource.savePin(pin);
      dataSource.savePin(pin);

      expect(dataSource.getSavedPins()).toEqual([pin]);
    });

    it('distinguishes pins by all fields', () => {
      const pin1: CardUniqueInfo = {plugin: 'scalars', tag: 'loss'};
      const pin2: CardUniqueInfo = {plugin: 'scalars', tag: 'accuracy'};
      const pin3: CardUniqueInfo = {
        plugin: 'histograms',
        tag: 'loss',
        runId: 'run1',
      };

      dataSource.savePin(pin1);
      dataSource.savePin(pin2);
      dataSource.savePin(pin3);

      expect(dataSource.getSavedPins()).toEqual([pin1, pin2, pin3]);
    });
  });

  describe('savePins', () => {
    it('saves multiple pins at once', () => {
      const pins: CardUniqueInfo[] = [
        {plugin: 'scalars', tag: 'loss'},
        {plugin: 'scalars', tag: 'accuracy'},
      ];

      dataSource.savePins(pins);

      expect(dataSource.getSavedPins()).toEqual(pins);
    });

    it('merges with existing pins without duplicates', () => {
      const existing: CardUniqueInfo = {plugin: 'scalars', tag: 'loss'};
      mockStorage[SAVED_PINS_KEY] = JSON.stringify([existing]);

      const newPins: CardUniqueInfo[] = [
        {plugin: 'scalars', tag: 'loss'}, // duplicate
        {plugin: 'scalars', tag: 'accuracy'}, // new
      ];

      dataSource.savePins(newPins);

      expect(dataSource.getSavedPins()).toEqual([
        {plugin: 'scalars', tag: 'loss'},
        {plugin: 'scalars', tag: 'accuracy'},
      ]);
    });
  });

  describe('removePin', () => {
    it('removes a specific pin', () => {
      const pins: CardUniqueInfo[] = [
        {plugin: 'scalars', tag: 'loss'},
        {plugin: 'scalars', tag: 'accuracy'},
      ];
      mockStorage[SAVED_PINS_KEY] = JSON.stringify(pins);

      dataSource.removePin({plugin: 'scalars', tag: 'loss'});

      expect(dataSource.getSavedPins()).toEqual([
        {plugin: 'scalars', tag: 'accuracy'},
      ]);
    });

    it('handles removing non-existent pin gracefully', () => {
      const pins: CardUniqueInfo[] = [{plugin: 'scalars', tag: 'loss'}];
      mockStorage[SAVED_PINS_KEY] = JSON.stringify(pins);

      dataSource.removePin({plugin: 'scalars', tag: 'nonexistent'});

      expect(dataSource.getSavedPins()).toEqual([
        {plugin: 'scalars', tag: 'loss'},
      ]);
    });
  });

  describe('setSavedPins', () => {
    it('replaces all pins', () => {
      const oldPins: CardUniqueInfo[] = [{plugin: 'scalars', tag: 'old'}];
      mockStorage[SAVED_PINS_KEY] = JSON.stringify(oldPins);

      const newPins: CardUniqueInfo[] = [
        {plugin: 'scalars', tag: 'new1'},
        {plugin: 'scalars', tag: 'new2'},
      ];

      dataSource.setSavedPins(newPins);

      expect(dataSource.getSavedPins()).toEqual(newPins);
    });
  });

  describe('removeAllPins', () => {
    it('removes all pins', () => {
      const pins: CardUniqueInfo[] = [
        {plugin: 'scalars', tag: 'loss'},
        {plugin: 'histograms', tag: 'weights', runId: 'run1'},
      ];
      mockStorage[SAVED_PINS_KEY] = JSON.stringify(pins);

      dataSource.removeAllPins();

      expect(dataSource.getSavedPins()).toEqual([]);
    });
  });

  describe('migrateLegacyPins', () => {
    it('migrates scalar pins to new format', () => {
      mockStorage[SAVED_SCALAR_PINS_KEY] = JSON.stringify(['loss', 'accuracy']);

      dataSource.migrateLegacyPins();

      expect(dataSource.getSavedPins()).toEqual([
        {plugin: 'scalars', tag: 'loss'},
        {plugin: 'scalars', tag: 'accuracy'},
      ]);
      expect(dataSource.getSavedScalarPins()).toEqual([]);
    });

    it('merges with existing new-format pins', () => {
      mockStorage[SAVED_SCALAR_PINS_KEY] = JSON.stringify(['loss']);
      mockStorage[SAVED_PINS_KEY] = JSON.stringify([
        {plugin: 'scalars', tag: 'accuracy'},
      ]);

      dataSource.migrateLegacyPins();

      expect(dataSource.getSavedPins()).toEqual([
        {plugin: 'scalars', tag: 'accuracy'},
        {plugin: 'scalars', tag: 'loss'},
      ]);
    });

    it('does not duplicate when migrating', () => {
      mockStorage[SAVED_SCALAR_PINS_KEY] = JSON.stringify(['loss']);
      mockStorage[SAVED_PINS_KEY] = JSON.stringify([
        {plugin: 'scalars', tag: 'loss'},
      ]);

      dataSource.migrateLegacyPins();

      expect(dataSource.getSavedPins()).toEqual([
        {plugin: 'scalars', tag: 'loss'},
      ]);
    });

    it('handles empty legacy storage gracefully', () => {
      dataSource.migrateLegacyPins();
      expect(dataSource.getSavedPins()).toEqual([]);
    });
  });
});
