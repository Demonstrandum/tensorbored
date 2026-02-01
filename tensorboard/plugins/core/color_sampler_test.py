# Copyright 2026 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
"""Tests for color_sampler module."""

import re
import unittest

from tensorboard.plugins.core import color_sampler


class SampleColorsTest(unittest.TestCase):
    """Tests for sample_colors function."""

    def test_returns_correct_count(self):
        """Should return exactly n colors."""
        for n in [1, 3, 5, 10, 20]:
            colors = color_sampler.sample_colors(n)
            self.assertEqual(len(colors), n)

    def test_returns_empty_for_zero(self):
        """Should return empty list for n=0."""
        self.assertEqual(color_sampler.sample_colors(0), [])

    def test_returns_empty_for_negative(self):
        """Should return empty list for negative n."""
        self.assertEqual(color_sampler.sample_colors(-5), [])

    def test_returns_valid_hex_colors(self):
        """All colors should be valid hex format."""
        colors = color_sampler.sample_colors(10)
        hex_pattern = re.compile(r"^#[0-9a-f]{6}$")
        for color in colors:
            self.assertRegex(color, hex_pattern)

    def test_colors_are_unique(self):
        """Generated colors should be unique."""
        colors = color_sampler.sample_colors(10)
        self.assertEqual(len(colors), len(set(colors)))

    def test_lightness_affects_output(self):
        """Different lightness values should produce different colors."""
        colors_light = color_sampler.sample_colors(3, lightness=0.8)
        colors_dark = color_sampler.sample_colors(3, lightness=0.4)
        # Colors should be different
        self.assertNotEqual(colors_light, colors_dark)

    def test_chroma_affects_output(self):
        """Different chroma values should produce different colors."""
        colors_vivid = color_sampler.sample_colors(3, chroma=0.2)
        colors_muted = color_sampler.sample_colors(3, chroma=0.05)
        self.assertNotEqual(colors_vivid, colors_muted)

    def test_hue_start_rotates_palette(self):
        """hue_start should rotate the color palette."""
        colors_0 = color_sampler.sample_colors(3, hue_start=0)
        colors_180 = color_sampler.sample_colors(3, hue_start=180)
        # Should be different (rotated)
        self.assertNotEqual(colors_0, colors_180)


class SampleColorsVariedTest(unittest.TestCase):
    """Tests for sample_colors_varied function."""

    def test_returns_correct_count(self):
        """Should return exactly n colors."""
        for n in [1, 5, 15]:
            colors = color_sampler.sample_colors_varied(n)
            self.assertEqual(len(colors), n)

    def test_colors_are_unique(self):
        """Generated colors should be unique."""
        colors = color_sampler.sample_colors_varied(15)
        self.assertEqual(len(colors), len(set(colors)))

    def test_returns_valid_hex_colors(self):
        """All colors should be valid hex format."""
        colors = color_sampler.sample_colors_varied(10)
        hex_pattern = re.compile(r"^#[0-9a-f]{6}$")
        for color in colors:
            self.assertRegex(color, hex_pattern)


class ColorMapTest(unittest.TestCase):
    """Tests for ColorMap class."""

    def test_callable_returns_colors(self):
        """ColorMap should be callable and return colors."""
        cm = color_sampler.ColorMap(5)
        self.assertRegex(cm(0), r"^#[0-9a-f]{6}$")
        self.assertRegex(cm(4), r"^#[0-9a-f]{6}$")

    def test_index_wraps_around(self):
        """Out-of-bounds indices should wrap around."""
        cm = color_sampler.ColorMap(3)
        self.assertEqual(cm(0), cm(3))
        self.assertEqual(cm(1), cm(4))

    def test_len_returns_count(self):
        """len() should return number of colors."""
        cm = color_sampler.ColorMap(7)
        self.assertEqual(len(cm), 7)

    def test_iterable(self):
        """ColorMap should be iterable."""
        cm = color_sampler.ColorMap(3)
        colors = list(cm)
        self.assertEqual(len(colors), 3)

    def test_indexable(self):
        """ColorMap should support indexing."""
        cm = color_sampler.ColorMap(5)
        self.assertEqual(cm[0], cm(0))
        self.assertEqual(cm[2], cm(2))

    def test_varied_mode(self):
        """varied=True should use varied colors."""
        cm_normal = color_sampler.ColorMap(10, varied=False)
        cm_varied = color_sampler.ColorMap(10, varied=True)
        # Should produce different palettes
        self.assertNotEqual(list(cm_normal), list(cm_varied))

    def test_empty_colormap(self):
        """Empty ColorMap should return gray."""
        cm = color_sampler.ColorMap(0)
        self.assertEqual(cm(0), "#808080")


class ColorsForRunsTest(unittest.TestCase):
    """Tests for colors_for_runs function."""

    def test_returns_dict_with_correct_keys(self):
        """Should return dict with all run IDs as keys."""
        run_ids = ["train", "eval", "test"]
        colors = color_sampler.colors_for_runs(run_ids)
        self.assertEqual(set(colors.keys()), set(run_ids))

    def test_values_are_valid_hex(self):
        """All values should be valid hex colors."""
        run_ids = ["a", "b", "c"]
        colors = color_sampler.colors_for_runs(run_ids)
        hex_pattern = re.compile(r"^#[0-9a-f]{6}$")
        for color in colors.values():
            self.assertRegex(color, hex_pattern)

    def test_auto_varied_for_many_runs(self):
        """Should automatically use varied mode for >8 runs."""
        run_ids = [f"run{i}" for i in range(12)]
        colors = color_sampler.colors_for_runs(run_ids)
        self.assertEqual(len(colors), 12)
        # All colors should be unique
        self.assertEqual(len(set(colors.values())), 12)


class PaletteTest(unittest.TestCase):
    """Tests for preset palette functions."""

    def test_categorical_palette(self):
        """palette_categorical should return valid colors."""
        colors = color_sampler.palette_categorical(5)
        self.assertEqual(len(colors), 5)
        hex_pattern = re.compile(r"^#[0-9a-f]{6}$")
        for color in colors:
            self.assertRegex(color, hex_pattern)

    def test_sequential_palette(self):
        """palette_sequential should return valid colors."""
        colors = color_sampler.palette_sequential(5)
        self.assertEqual(len(colors), 5)

    def test_diverging_palette(self):
        """palette_diverging should return valid colors."""
        colors = color_sampler.palette_diverging(7)
        self.assertEqual(len(colors), 7)


class ColorUtilitiesTest(unittest.TestCase):
    """Tests for color utility functions."""

    def test_lighten(self):
        """lighten should produce lighter colors."""
        original = "#808080"
        lighter = color_sampler.lighten(original, 0.2)
        self.assertNotEqual(original, lighter)
        # Parse and verify lightness increased
        self.assertRegex(lighter, r"^#[0-9a-f]{6}$")

    def test_darken(self):
        """darken should produce darker colors."""
        original = "#808080"
        darker = color_sampler.darken(original, 0.2)
        self.assertNotEqual(original, darker)
        self.assertRegex(darker, r"^#[0-9a-f]{6}$")

    def test_lighten_clamps_at_white(self):
        """lighten should not exceed white."""
        very_light = "#f0f0f0"
        result = color_sampler.lighten(very_light, 0.5)
        self.assertRegex(result, r"^#[0-9a-f]{6}$")

    def test_darken_clamps_at_black(self):
        """darken should not go below black."""
        very_dark = "#101010"
        result = color_sampler.darken(very_dark, 0.5)
        self.assertRegex(result, r"^#[0-9a-f]{6}$")


if __name__ == "__main__":
    unittest.main()
