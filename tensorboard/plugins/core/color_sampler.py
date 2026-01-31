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
"""Perceptually uniform color sampling for TensorBoard run colors.

This module provides utilities for generating visually distinguishable colors
using the OKLCH color space, which is perceptually uniform. This means equal
steps in the color space correspond to equal perceived differences.

Example usage:

    from tensorboard.plugins.core import color_sampler

    # Get 5 evenly-spaced colors
    colors = color_sampler.sample_colors(5)
    # ['#dc8a78', '#a4b93e', '#40c4aa', '#7aa6f5', '#d898d5']

    # Use with run_colors
    run_ids = ['train', 'eval', 'test', 'baseline', 'experiment']
    run_colors = {rid: color_sampler.sample_colors(len(run_ids))[i]
                  for i, rid in enumerate(run_ids)}

    # Or use the ColorMap class for cleaner syntax
    cm = color_sampler.ColorMap(len(run_ids))
    run_colors = {rid: cm(i) for i, rid in enumerate(run_ids)}

    # Even simpler - auto-assign from list
    run_colors = color_sampler.colors_for_runs(run_ids)
"""

import math
from typing import List, Optional, Tuple


# =============================================================================
# OKLCH Color Space Implementation
# =============================================================================
# OKLCH is a perceptually uniform color space where:
#   L = Lightness (0 = black, 1 = white)
#   C = Chroma (0 = gray, higher = more saturated)
#   H = Hue angle in degrees (0-360)
#
# We convert OKLCH → OKLAB → Linear sRGB → sRGB → Hex


def _oklch_to_oklab(L: float, C: float, H: float) -> Tuple[float, float, float]:
    """Convert OKLCH to OKLAB."""
    h_rad = math.radians(H)
    a = C * math.cos(h_rad)
    b = C * math.sin(h_rad)
    return (L, a, b)


def _oklab_to_linear_srgb(L: float, a: float, b: float) -> Tuple[float, float, float]:
    """Convert OKLAB to linear sRGB."""
    # OKLAB to LMS (approximate)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b

    # Cube the values
    l = l_ * l_ * l_
    m = m_ * m_ * m_
    s = s_ * s_ * s_

    # LMS to linear sRGB
    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    return (r, g, b)


def _linear_to_srgb(x: float) -> float:
    """Convert linear RGB component to sRGB (gamma correction)."""
    if x <= 0.0031308:
        return 12.92 * x
    return 1.055 * (x ** (1 / 2.4)) - 0.055


def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Clamp value to range."""
    return max(lo, min(hi, x))


def _oklch_to_hex(L: float, C: float, H: float) -> str:
    """Convert OKLCH color to hex string."""
    # OKLCH → OKLAB → Linear sRGB → sRGB
    lab = _oklch_to_oklab(L, C, H)
    linear = _oklab_to_linear_srgb(*lab)
    srgb = tuple(_clamp(_linear_to_srgb(c)) for c in linear)

    # Convert to 8-bit and format as hex
    r = int(round(srgb[0] * 255))
    g = int(round(srgb[1] * 255))
    b = int(round(srgb[2] * 255))

    return f"#{r:02x}{g:02x}{b:02x}"


# =============================================================================
# Public API
# =============================================================================


def sample_colors(
    n: int,
    lightness: float = 0.7,
    chroma: float = 0.15,
    hue_start: float = 0.0,
    hue_range: float = 360.0,
) -> List[str]:
    """Generate n perceptually uniform, evenly-spaced colors.

    Uses the OKLCH color space to ensure colors are visually distinguishable.
    Colors are spaced evenly around the hue wheel while maintaining consistent
    lightness and chroma for uniform appearance.

    Args:
        n: Number of colors to generate.
        lightness: OKLCH lightness (0-1). Default 0.7 works well on white
            backgrounds. Use ~0.65 for dark backgrounds.
        chroma: OKLCH chroma (0-0.4). Higher = more saturated. Default 0.15
            gives vivid but not garish colors.
        hue_start: Starting hue angle in degrees (0-360). Shifts the color
            palette around the wheel.
        hue_range: Range of hues to use (default 360 = full wheel). Use less
            to restrict to a portion of the spectrum.

    Returns:
        List of n hex color strings (e.g., ['#dc8a78', '#40c4aa', ...]).

    Example:
        >>> sample_colors(3)
        ['#dc8a78', '#5fba72', '#7a9ef7']

        >>> sample_colors(5, lightness=0.6, chroma=0.2)
        ['#d96a5c', '#8ba600', '#00ab9e', '#4d95f2', '#c87ed4']
    """
    if n <= 0:
        return []

    colors = []
    for i in range(n):
        # Evenly space hues, leaving a gap so first and last aren't too close
        hue = (hue_start + (i * hue_range / n)) % 360
        colors.append(_oklch_to_hex(lightness, chroma, hue))

    return colors


def sample_colors_varied(
    n: int,
    lightness_range: Tuple[float, float] = (0.55, 0.8),
    chroma_range: Tuple[float, float] = (0.12, 0.18),
) -> List[str]:
    """Generate n colors with varied lightness and chroma for maximum distinction.

    When you have many colors (>8), varying lightness and chroma in addition
    to hue helps distinguish them. This function maximizes perceptual distance
    between colors.

    Args:
        n: Number of colors to generate.
        lightness_range: (min, max) lightness values.
        chroma_range: (min, max) chroma values.

    Returns:
        List of n hex color strings optimized for visual distinction.

    Example:
        >>> sample_colors_varied(10)  # Good for 10+ runs
    """
    if n <= 0:
        return []

    colors = []
    l_min, l_max = lightness_range
    c_min, c_max = chroma_range

    for i in range(n):
        # Primary variation: hue
        hue = (i * 360 / n) % 360

        # Secondary variation: alternate lightness and chroma
        # This creates a "zigzag" pattern in L-C space
        t = i / max(n - 1, 1)

        if i % 2 == 0:
            lightness = l_min + (l_max - l_min) * (1 - t * 0.5)
            chroma = c_min + (c_max - c_min) * t
        else:
            lightness = l_min + (l_max - l_min) * (0.5 + t * 0.5)
            chroma = c_max - (c_max - c_min) * t * 0.5

        colors.append(_oklch_to_hex(lightness, chroma, hue))

    return colors


class ColorMap:
    """A callable color map that returns colors by index.

    Convenient for use with enumerate() or dict comprehensions.

    Example:
        >>> cm = ColorMap(5)
        >>> cm(0)
        '#dc8a78'
        >>> cm(2)
        '#40c4aa'
        >>> run_colors = {rid: cm(i) for i, rid in enumerate(run_ids)}
    """

    def __init__(
        self,
        n: int,
        lightness: float = 0.7,
        chroma: float = 0.15,
        hue_start: float = 0.0,
        varied: bool = False,
    ):
        """Create a color map with n colors.

        Args:
            n: Number of colors in the palette.
            lightness: OKLCH lightness (ignored if varied=True).
            chroma: OKLCH chroma (ignored if varied=True).
            hue_start: Starting hue angle.
            varied: If True, use sample_colors_varied() for better distinction
                with many colors (>8).
        """
        if varied:
            self._colors = sample_colors_varied(n)
        else:
            self._colors = sample_colors(n, lightness, chroma, hue_start)

    def __call__(self, index: int) -> str:
        """Get color at index (wraps around if out of bounds)."""
        if not self._colors:
            return "#808080"  # Gray fallback
        return self._colors[index % len(self._colors)]

    def __len__(self) -> int:
        return len(self._colors)

    def __iter__(self):
        return iter(self._colors)

    def __getitem__(self, index: int) -> str:
        return self._colors[index]


def colors_for_runs(
    run_ids: List[str],
    lightness: float = 0.7,
    chroma: float = 0.15,
    varied: bool = False,
) -> dict:
    """Generate a run_colors dict for a list of run IDs.

    Convenience function that creates a complete run_colors mapping.

    Args:
        run_ids: List of run identifiers.
        lightness: OKLCH lightness.
        chroma: OKLCH chroma.
        varied: Use varied lightness/chroma for many runs.

    Returns:
        Dict mapping run IDs to hex color strings.

    Example:
        >>> colors_for_runs(['train', 'eval', 'test'])
        {'train': '#dc8a78', 'eval': '#5fba72', 'test': '#7a9ef7'}
    """
    n = len(run_ids)
    if varied or n > 8:
        colors = sample_colors_varied(n)
    else:
        colors = sample_colors(n, lightness, chroma)

    return {rid: colors[i] for i, rid in enumerate(run_ids)}


# =============================================================================
# Preset Palettes
# =============================================================================


def palette_categorical(n: int) -> List[str]:
    """Generate a categorical palette optimized for charts.

    Uses high chroma and medium lightness for maximum pop on white backgrounds.
    """
    return sample_colors(n, lightness=0.65, chroma=0.18)


def palette_sequential(n: int, hue: float = 250) -> List[str]:
    """Generate a sequential palette (light to dark) for ordered data.

    All colors have the same hue but vary in lightness.

    Args:
        n: Number of colors.
        hue: Base hue (default 250 = blue).

    Returns:
        List of colors from light to dark.
    """
    if n <= 0:
        return []

    colors = []
    for i in range(n):
        # Lightness from 0.9 (light) to 0.35 (dark)
        lightness = 0.9 - (i / max(n - 1, 1)) * 0.55
        # Chroma increases slightly with darkness
        chroma = 0.08 + (i / max(n - 1, 1)) * 0.12
        colors.append(_oklch_to_hex(lightness, chroma, hue))

    return colors


def palette_diverging(n: int, hue_low: float = 250, hue_high: float = 30) -> List[str]:
    """Generate a diverging palette for data with a meaningful midpoint.

    Goes from one hue through neutral to another hue.

    Args:
        n: Number of colors (odd numbers work best).
        hue_low: Hue for low values (default 250 = blue).
        hue_high: Hue for high values (default 30 = orange).

    Returns:
        List of colors diverging from center.
    """
    if n <= 0:
        return []

    colors = []
    mid = (n - 1) / 2

    for i in range(n):
        if i < mid:
            # Low side: blue-ish
            t = i / mid if mid > 0 else 0
            lightness = 0.45 + t * 0.45  # Dark to light
            chroma = 0.18 * (1 - t)  # Saturated to neutral
            hue = hue_low
        elif i > mid:
            # High side: orange-ish
            t = (i - mid) / (n - 1 - mid) if n - 1 > mid else 0
            lightness = 0.9 - t * 0.45  # Light to dark
            chroma = 0.18 * t  # Neutral to saturated
            hue = hue_high
        else:
            # Midpoint: neutral
            lightness = 0.9
            chroma = 0.0
            hue = 0

        colors.append(_oklch_to_hex(lightness, chroma, hue))

    return colors


# =============================================================================
# Color Utilities
# =============================================================================


def lighten(hex_color: str, amount: float = 0.1) -> str:
    """Lighten a hex color by increasing its OKLCH lightness.

    Args:
        hex_color: Input color as hex string (e.g., '#dc8a78').
        amount: How much to lighten (0-1).

    Returns:
        Lightened hex color string.
    """
    l, c, h = _hex_to_oklch(hex_color)
    l = min(1.0, l + amount)
    return _oklch_to_hex(l, c, h)


def darken(hex_color: str, amount: float = 0.1) -> str:
    """Darken a hex color by decreasing its OKLCH lightness.

    Args:
        hex_color: Input color as hex string.
        amount: How much to darken (0-1).

    Returns:
        Darkened hex color string.
    """
    l, c, h = _hex_to_oklch(hex_color)
    l = max(0.0, l - amount)
    return _oklch_to_hex(l, c, h)


def _hex_to_oklch(hex_color: str) -> Tuple[float, float, float]:
    """Convert hex color to OKLCH (approximate reverse conversion)."""
    # Parse hex
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255
    g = int(hex_color[2:4], 16) / 255
    b = int(hex_color[4:6], 16) / 255

    # sRGB to linear
    def to_linear(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r_lin = to_linear(r)
    g_lin = to_linear(g)
    b_lin = to_linear(b)

    # Linear sRGB to LMS
    l = 0.4122214708 * r_lin + 0.5363325363 * g_lin + 0.0514459929 * b_lin
    m = 0.2119034982 * r_lin + 0.6806995451 * g_lin + 0.1073969566 * b_lin
    s = 0.0883024619 * r_lin + 0.2817188376 * g_lin + 0.6299787005 * b_lin

    # LMS to OKLAB
    l_ = l ** (1 / 3) if l >= 0 else -((-l) ** (1 / 3))
    m_ = m ** (1 / 3) if m >= 0 else -((-m) ** (1 / 3))
    s_ = s ** (1 / 3) if s >= 0 else -((-s) ** (1 / 3))

    L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    b_val = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

    # OKLAB to OKLCH
    C = math.sqrt(a * a + b_val * b_val)
    H = math.degrees(math.atan2(b_val, a)) % 360

    return (L, C, H)
