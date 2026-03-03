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
"""Utility for writing TensorBoard default profiles from Python.

This module provides a simple API for training scripts to set default
TensorBoard dashboard configurations.  When users load TensorBoard,
the default profile will be automatically applied.

Create a profile, tweak it, and write it to disk::

    from tensorbored.plugins.core import profile_writer

    p = profile_writer.create_profile(
        "Training Dashboard",
        pinned_cards=[profile_writer.pin_scalar("train/loss")],
        run_colors={"train": "#2196F3", "eval": "#4CAF50"},
        smoothing=0.8,
    )
    p.tag_filter = "loss|accuracy"
    p.y_axis_scale = "log10"
    p.write("./logs")

Profiles can be merged with ``|``::

    base = profile_writer.create_profile(
        "Base", smoothing=0.8, run_colors={"train": "#ff0000"},
    )
    extra = profile_writer.create_profile(
        "Extra", y_axis_scale="log10",
        pinned_cards=[profile_writer.pin_scalar("eval/loss")],
    )
    combined = base | extra
    combined.write(logdir)

The one-shot helper ``set_default_profile`` creates and writes in
a single call::

    profile_writer.set_default_profile(
        logdir,
        pinned_cards=[profile_writer.pin_scalar("train/loss")],
        run_colors={"train": "#ff0000"},
    )
"""

from __future__ import annotations

import json
import os
import time
from typing import Literal, TypedDict

# ---------------------------------------------------------------------------
# Profile format version
# ---------------------------------------------------------------------------
PROFILE_VERSION = 1


# ---------------------------------------------------------------------------
# Axis scale types
# ---------------------------------------------------------------------------
AxisScale = Literal["linear", "log10", "symlog10"]
VALID_AXIS_SCALES: tuple[AxisScale, ...] = (
    "linear",
    "log10",
    "symlog10",
)


class TagAxisScale(TypedDict, total=False):
    """Per-axis scale override for a single tag.

    Both keys are optional; omitted axes keep the global default.
    """

    y: AxisScale
    x: AxisScale


# ---------------------------------------------------------------------------
# Typed structures for profile JSON fields
# ---------------------------------------------------------------------------
class _PinnedCardRequired(TypedDict):
    plugin: str
    tag: str


class PinnedCard(_PinnedCardRequired, total=False):
    """A card to pin at the top of the dashboard."""

    runId: str
    sample: int


class RunColorEntry(TypedDict):
    """Maps a single run to a hex colour."""

    runId: str
    color: str


class GroupColorEntry(TypedDict):
    """Maps a group key to a colour-palette index."""

    groupKey: str
    colorId: int


class SuperimposedCardEntry(TypedDict):
    """A card that overlays multiple scalar tags on one chart."""

    id: str
    title: str
    tags: list[str]
    runId: str | None


RunSelectionType = Literal["RUN_ID", "RUN_NAME"]


class RunSelectionEntry(TypedDict):
    """Declares whether a single run is visible."""

    type: RunSelectionType
    value: str
    selected: bool


GroupByKey = Literal["RUN", "EXPERIMENT", "REGEX", "REGEX_BY_EXP"]


class _GroupByRequired(TypedDict):
    key: GroupByKey


class GroupByConfig(_GroupByRequired, total=False):
    """Run-grouping configuration."""

    regexString: str


class _ProfileDataRequired(TypedDict):
    version: int
    name: str
    lastModifiedTimestamp: int
    pinnedCards: list[PinnedCard]
    runColors: list[RunColorEntry]
    groupColors: list[GroupColorEntry]
    superimposedCards: list[SuperimposedCardEntry]
    tagFilter: str
    runFilter: str
    smoothing: float


class ProfileData(_ProfileDataRequired, total=False):
    """The ``data`` payload inside a serialised profile."""

    runSelection: list[RunSelectionEntry]
    metricDescriptions: dict[str, str]
    groupBy: GroupByConfig | None
    yAxisScale: AxisScale
    xAxisScale: AxisScale
    tagAxisScales: dict[str, TagAxisScale]
    symlogLinearThreshold: float
    tagSymlogLinearThresholds: dict[str, float]
    expandedTagGroups: dict[str, bool]


class SerializedProfile(TypedDict):
    """Top-level wrapper written to ``default_profile.json``."""

    version: int
    data: ProfileData


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _merge_regex(a: str, b: str) -> str:
    """Combine two regex filter strings with alternation."""
    if not a:
        return b
    if not b:
        return a
    return f"({a})|({b})"


# ---------------------------------------------------------------------------
# Profile wrapper
# ---------------------------------------------------------------------------
class Profile:
    """High-level wrapper for a TensorBored dashboard profile.

    Provides Pythonic attribute access (snake_case properties) over
    the camelCase ``ProfileData`` dictionary that the frontend and
    JSON serialisation format expect.

    Prefer :func:`create_profile` to construct new instances (it
    bridges the ``group_colors`` and ``symlog_linear_threshold``
    type differences from the legacy API).  Direct construction
    works too::

        p = Profile("My Dashboard", run_colors={"train": "#ff0000"})
        p.pin_scalar("train/loss")
        p.write("./logs")

    Profiles support merging via ``update()`` and ``|``::

        combined = base | overlay   # new profile
        base |= overlay             # in-place
        base.update(overlay)        # same as |=

    Loading an existing profile::

        p = Profile.load("./logs")
        p.smoothing = 0.95
        p.write("./logs")
    """

    __slots__ = (
        "_name",
        "_pinned_cards",
        "_run_colors",
        "_group_colors",
        "_superimposed_cards",
        "_run_selection",
        "_metric_descriptions",
        "_tag_filter",
        "_run_filter",
        "_smoothing",
        "_symlog_linear_threshold",
        "_group_by",
        "_y_axis_scale",
        "_x_axis_scale",
        "_tag_axis_scales",
        "_tag_symlog_linear_thresholds",
        "_expanded_tag_groups",
    )

    def __init__(
        self,
        name: str = "Default Profile",
        *,
        pinned_cards: list[PinnedCard] | None = None,
        run_colors: dict[str, str] | None = None,
        group_colors: dict[str, int] | None = None,
        superimposed_cards: list[SuperimposedCardEntry] | None = None,
        run_selection: list[RunSelectionEntry] | None = None,
        selected_runs: list[str] | None = None,
        metric_descriptions: dict[str, str] | None = None,
        tag_filter: str = "",
        run_filter: str = "",
        smoothing: float = 0.6,
        symlog_linear_threshold: float | None = None,
        group_by: GroupByConfig | None = None,
        y_axis_scale: AxisScale | None = None,
        x_axis_scale: AxisScale | None = None,
        tag_axis_scales: dict[str, TagAxisScale] | None = None,
        tag_symlog_linear_thresholds: dict[str, float] | None = None,
        expanded_tag_groups: dict[str, bool] | None = None,
    ):
        self._name = name
        self._pinned_cards: list[PinnedCard] = list(pinned_cards or [])
        self._run_colors: dict[str, str] = dict(run_colors or {})
        self._group_colors: dict[str, int] = dict(group_colors or {})
        self._superimposed_cards: list[SuperimposedCardEntry] = list(
            superimposed_cards or []
        )
        if run_selection is not None:
            self._run_selection: list[RunSelectionEntry] = list(
                run_selection
            )
        elif selected_runs is not None:
            self._run_selection = [
                RunSelectionEntry(
                    type="RUN_NAME", value=r, selected=True
                )
                for r in selected_runs
            ]
        else:
            self._run_selection = []
        self._metric_descriptions: dict[str, str] = dict(
            metric_descriptions or {}
        )
        self._tag_filter = tag_filter
        self._run_filter = run_filter
        self._smoothing = smoothing
        self._symlog_linear_threshold = symlog_linear_threshold
        self._group_by = group_by
        # Use setters for validation.
        self.y_axis_scale = y_axis_scale
        self.x_axis_scale = x_axis_scale
        self._tag_axis_scales: dict[str, TagAxisScale] = dict(
            tag_axis_scales or {}
        )
        self._tag_symlog_linear_thresholds: dict[str, float] = dict(
            tag_symlog_linear_thresholds or {}
        )
        self._expanded_tag_groups: dict[str, bool] = dict(
            expanded_tag_groups or {}
        )

    # --------------------------------------------------------------- #
    # Properties
    # --------------------------------------------------------------- #

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str) -> None:
        self._name = value

    @property
    def pinned_cards(self) -> list[PinnedCard]:
        return self._pinned_cards

    @pinned_cards.setter
    def pinned_cards(self, value: list[PinnedCard]) -> None:
        self._pinned_cards = list(value)

    @property
    def run_colors(self) -> dict[str, str]:
        return self._run_colors

    @run_colors.setter
    def run_colors(self, value: dict[str, str]) -> None:
        self._run_colors = dict(value)

    @property
    def group_colors(self) -> dict[str, int]:
        return self._group_colors

    @group_colors.setter
    def group_colors(self, value: dict[str, int]) -> None:
        self._group_colors = dict(value)

    @property
    def superimposed_cards(self) -> list[SuperimposedCardEntry]:
        return self._superimposed_cards

    @superimposed_cards.setter
    def superimposed_cards(
        self, value: list[SuperimposedCardEntry]
    ) -> None:
        self._superimposed_cards = list(value)

    @property
    def run_selection(self) -> list[RunSelectionEntry]:
        return self._run_selection

    @run_selection.setter
    def run_selection(self, value: list[RunSelectionEntry]) -> None:
        self._run_selection = list(value)

    @property
    def metric_descriptions(self) -> dict[str, str]:
        return self._metric_descriptions

    @metric_descriptions.setter
    def metric_descriptions(self, value: dict[str, str]) -> None:
        self._metric_descriptions = dict(value)

    @property
    def tag_filter(self) -> str:
        return self._tag_filter

    @tag_filter.setter
    def tag_filter(self, value: str) -> None:
        self._tag_filter = value

    @property
    def run_filter(self) -> str:
        return self._run_filter

    @run_filter.setter
    def run_filter(self, value: str) -> None:
        self._run_filter = value

    @property
    def smoothing(self) -> float:
        return self._smoothing

    @smoothing.setter
    def smoothing(self, value: float) -> None:
        self._smoothing = value

    @property
    def symlog_linear_threshold(self) -> float | None:
        return self._symlog_linear_threshold

    @symlog_linear_threshold.setter
    def symlog_linear_threshold(self, value: float | None) -> None:
        self._symlog_linear_threshold = value

    @property
    def group_by(self) -> GroupByConfig | None:
        return self._group_by

    @group_by.setter
    def group_by(self, value: GroupByConfig | None) -> None:
        self._group_by = value

    @property
    def y_axis_scale(self) -> AxisScale | None:
        return self._y_axis_scale

    @y_axis_scale.setter
    def y_axis_scale(self, value: AxisScale | None) -> None:
        if value is not None and value not in VALID_AXIS_SCALES:
            raise ValueError(
                f"Invalid y_axis_scale: {value!r}. "
                f"Must be one of {VALID_AXIS_SCALES}"
            )
        self._y_axis_scale = value

    @property
    def x_axis_scale(self) -> AxisScale | None:
        return self._x_axis_scale

    @x_axis_scale.setter
    def x_axis_scale(self, value: AxisScale | None) -> None:
        if value is not None and value not in VALID_AXIS_SCALES:
            raise ValueError(
                f"Invalid x_axis_scale: {value!r}. "
                f"Must be one of {VALID_AXIS_SCALES}"
            )
        self._x_axis_scale = value

    @property
    def tag_axis_scales(self) -> dict[str, TagAxisScale]:
        return self._tag_axis_scales

    @tag_axis_scales.setter
    def tag_axis_scales(
        self, value: dict[str, TagAxisScale]
    ) -> None:
        self._tag_axis_scales = dict(value)

    @property
    def tag_symlog_linear_thresholds(self) -> dict[str, float]:
        return self._tag_symlog_linear_thresholds

    @tag_symlog_linear_thresholds.setter
    def tag_symlog_linear_thresholds(
        self, value: dict[str, float]
    ) -> None:
        self._tag_symlog_linear_thresholds = dict(value)

    @property
    def expanded_tag_groups(self) -> dict[str, bool]:
        return self._expanded_tag_groups

    @expanded_tag_groups.setter
    def expanded_tag_groups(self, value: dict[str, bool]) -> None:
        self._expanded_tag_groups = dict(value)

    # --------------------------------------------------------------- #
    # Convenience helpers
    # --------------------------------------------------------------- #

    def pin_scalar(self, tag: str) -> None:
        """Pin a scalar card."""
        self._pinned_cards.append(
            PinnedCard(plugin="scalars", tag=tag)
        )

    def pin_histogram(self, tag: str, run_id: str) -> None:
        """Pin a histogram card."""
        self._pinned_cards.append(
            PinnedCard(plugin="histograms", tag=tag, runId=run_id)
        )

    def pin_image(
        self, tag: str, run_id: str, sample: int = 0
    ) -> None:
        """Pin an image card."""
        self._pinned_cards.append(
            PinnedCard(
                plugin="images",
                tag=tag,
                runId=run_id,
                sample=sample,
            )
        )

    def add_superimposed_card(
        self,
        title: str,
        tags: list[str],
        run_id: str | None = None,
    ) -> None:
        """Add a superimposed (multi-tag overlay) card."""
        self._superimposed_cards.append(
            create_superimposed_card(title, tags, run_id)
        )

    def select_runs(self, run_names: list[str]) -> None:
        """Set visible runs by name (replaces current selection)."""
        self._run_selection = [
            RunSelectionEntry(
                type="RUN_NAME", value=name, selected=True
            )
            for name in run_names
        ]

    # --------------------------------------------------------------- #
    # Serialization
    # --------------------------------------------------------------- #

    def serialize(self) -> SerializedProfile:
        """Convert to the ``SerializedProfile`` dict format.

        The returned dictionary is JSON-serialisable and understood
        by the TensorBored frontend.

        Raises:
            ValueError: If any ``tag_axis_scales`` entries contain
                invalid axis keys or scale names.
        """
        for tag, axes in self._tag_axis_scales.items():
            for axis_key, scale in axes.items():
                if axis_key not in ("y", "x"):
                    raise ValueError(
                        f"Invalid axis key {axis_key!r} for tag "
                        f"{tag!r}. Must be 'y' or 'x'"
                    )
                if scale not in VALID_AXIS_SCALES:
                    raise ValueError(
                        f"Invalid scale {scale!r} for tag "
                        f"{tag!r} axis {axis_key!r}. "
                        f"Must be one of {VALID_AXIS_SCALES}"
                    )

        data = ProfileData(
            version=PROFILE_VERSION,
            name=self._name,
            lastModifiedTimestamp=int(time.time() * 1000),
            pinnedCards=list(self._pinned_cards),
            runColors=[
                RunColorEntry(runId=rid, color=c)
                for rid, c in self._run_colors.items()
            ],
            groupColors=[
                GroupColorEntry(groupKey=gk, colorId=cid)
                for gk, cid in self._group_colors.items()
            ],
            superimposedCards=list(self._superimposed_cards),
            tagFilter=self._tag_filter,
            runFilter=self._run_filter,
            smoothing=self._smoothing,
        )
        if self._run_selection:
            data["runSelection"] = self._run_selection
        if self._metric_descriptions:
            data["metricDescriptions"] = self._metric_descriptions
        if self._group_by is not None:
            data["groupBy"] = self._group_by
        if self._y_axis_scale is not None:
            data["yAxisScale"] = self._y_axis_scale
        if self._x_axis_scale is not None:
            data["xAxisScale"] = self._x_axis_scale
        if self._tag_axis_scales:
            data["tagAxisScales"] = dict(self._tag_axis_scales)
        if self._symlog_linear_threshold is not None:
            data["symlogLinearThreshold"] = (
                self._symlog_linear_threshold
            )
        if self._tag_symlog_linear_thresholds:
            data["tagSymlogLinearThresholds"] = dict(
                self._tag_symlog_linear_thresholds
            )
        if self._expanded_tag_groups:
            data["expandedTagGroups"] = dict(
                self._expanded_tag_groups
            )
        return SerializedProfile(version=PROFILE_VERSION, data=data)

    def write(self, logdir: str) -> str:
        """Serialize and write to disk.

        Writes to ``<logdir>/.tensorboard/default_profile.json``.

        Returns:
            The path to the written file.
        """
        return write_profile(logdir, self.serialize())

    # --------------------------------------------------------------- #
    # Construction from existing data
    # --------------------------------------------------------------- #

    @classmethod
    def from_serialized(
        cls, serialized: SerializedProfile
    ) -> Profile:
        """Create a :class:`Profile` from a ``SerializedProfile``."""
        data = serialized["data"]
        return cls(
            name=data["name"],
            pinned_cards=data.get("pinnedCards", []),
            run_colors={
                e["runId"]: e["color"]
                for e in data.get("runColors", [])
            },
            group_colors={
                e["groupKey"]: e["colorId"]
                for e in data.get("groupColors", [])
            },
            superimposed_cards=data.get("superimposedCards", []),
            run_selection=data.get("runSelection"),
            metric_descriptions=data.get("metricDescriptions"),
            tag_filter=data.get("tagFilter", ""),
            run_filter=data.get("runFilter", ""),
            smoothing=data.get("smoothing", 0.6),
            symlog_linear_threshold=data.get(
                "symlogLinearThreshold"
            ),
            group_by=data.get("groupBy"),
            y_axis_scale=data.get("yAxisScale"),
            x_axis_scale=data.get("xAxisScale"),
            tag_axis_scales=data.get("tagAxisScales"),
            tag_symlog_linear_thresholds=data.get(
                "tagSymlogLinearThresholds"
            ),
            expanded_tag_groups=data.get("expandedTagGroups"),
        )

    @classmethod
    def load(cls, logdir: str) -> Profile | None:
        """Load the default profile from a logdir.

        Returns ``None`` if no profile file exists.
        """
        serialized = read_profile(logdir)
        if serialized is None:
            return None
        return cls.from_serialized(serialized)

    # --------------------------------------------------------------- #
    # Merging
    # --------------------------------------------------------------- #

    def update(self, other: Profile) -> None:
        """Merge *other* into this profile in place.

        * **Dict fields** are merged (other's entries win on key
          conflict).
        * **List fields** are extended (other's items appended).
        * **Required scalar fields** (``name``, ``smoothing``) are
          replaced by other's value.
        * **Regex fields** (``tag_filter``, ``run_filter``) are
          combined with ``|`` (regex alternation) when both sides
          are non-empty.
        * **Optional scalar fields** (those whose "unset" state is
          ``None``) are replaced only when other's value is not
          ``None``.
        """
        self._name = other._name
        self._tag_filter = _merge_regex(
            self._tag_filter, other._tag_filter
        )
        self._run_filter = _merge_regex(
            self._run_filter, other._run_filter
        )
        self._smoothing = other._smoothing

        if other._symlog_linear_threshold is not None:
            self._symlog_linear_threshold = (
                other._symlog_linear_threshold
            )
        if other._group_by is not None:
            self._group_by = other._group_by
        if other._y_axis_scale is not None:
            self._y_axis_scale = other._y_axis_scale
        if other._x_axis_scale is not None:
            self._x_axis_scale = other._x_axis_scale

        self._pinned_cards.extend(other._pinned_cards)
        self._superimposed_cards.extend(other._superimposed_cards)
        self._run_selection.extend(other._run_selection)

        self._run_colors.update(other._run_colors)
        self._group_colors.update(other._group_colors)
        self._metric_descriptions.update(other._metric_descriptions)
        self._tag_axis_scales.update(other._tag_axis_scales)
        self._tag_symlog_linear_thresholds.update(
            other._tag_symlog_linear_thresholds
        )
        self._expanded_tag_groups.update(other._expanded_tag_groups)

    def __or__(self, other: Profile) -> Profile:
        """Return a new profile merging *self* and *other*.

        Equivalent to ``self.copy()`` followed by
        ``result.update(other)``.  See :meth:`update` for the
        merging rules.
        """
        if not isinstance(other, Profile):
            return NotImplemented
        result = Profile(
            name=self._name,
            pinned_cards=list(self._pinned_cards),
            run_colors=dict(self._run_colors),
            group_colors=dict(self._group_colors),
            superimposed_cards=list(self._superimposed_cards),
            run_selection=list(self._run_selection),
            metric_descriptions=dict(self._metric_descriptions),
            tag_filter=self._tag_filter,
            run_filter=self._run_filter,
            smoothing=self._smoothing,
            symlog_linear_threshold=self._symlog_linear_threshold,
            group_by=self._group_by,
            y_axis_scale=self._y_axis_scale,
            x_axis_scale=self._x_axis_scale,
            tag_axis_scales=dict(self._tag_axis_scales),
            tag_symlog_linear_thresholds=dict(
                self._tag_symlog_linear_thresholds
            ),
            expanded_tag_groups=dict(self._expanded_tag_groups),
        )
        result.update(other)
        return result

    def __ior__(self, other: Profile) -> Profile:
        """In-place merge: ``self |= other``."""
        if not isinstance(other, Profile):
            return NotImplemented
        self.update(other)
        return self

    def __repr__(self) -> str:
        return f"Profile({self._name!r})"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def create_profile(
    name: str = "Default Profile",
    pinned_cards: list[PinnedCard] | None = None,
    run_colors: dict[str, str] | None = None,
    group_colors: list[GroupColorEntry] | None = None,
    superimposed_cards: list[SuperimposedCardEntry] | None = None,
    run_selection: list[RunSelectionEntry] | None = None,
    selected_runs: list[str] | None = None,
    metric_descriptions: dict[str, str] | None = None,
    tag_filter: str = "",
    run_filter: str = "",
    smoothing: float = 0.6,
    symlog_linear_threshold: float = 1.0,
    group_by: GroupByConfig | None = None,
    y_axis_scale: AxisScale | None = None,
    x_axis_scale: AxisScale | None = None,
    tag_axis_scales: dict[str, TagAxisScale] | None = None,
    tag_symlog_linear_thresholds: dict[str, float] | None = None,
    expanded_tag_groups: dict[str, bool] | None = None,
) -> Profile:
    """Create a :class:`Profile`.

    This is the primary way to build a profile.  The returned object
    can be inspected, mutated, merged with ``|``, and written to
    disk with :meth:`Profile.write`.

    Args:
        name: User-friendly name for the profile.
        pinned_cards: Cards to pin at the top of the dashboard.
        run_colors: Mapping from run name/ID to hex colour string.
        group_colors: Group-key to colour-palette-index assignments
            (list of ``GroupColorEntry`` dicts for backward compat).
        superimposed_cards: Multi-tag overlay card definitions.
        run_selection: Explicit run visibility entries.
        selected_runs: Convenience list of run names to select
            (converted to ``RunSelectionEntry`` with
            ``type="RUN_NAME"`` and ``selected=True``).
        metric_descriptions: Long-form Markdown descriptions per tag.
        tag_filter: Regex pattern to filter tags.
        run_filter: Regex pattern to filter runs.
        smoothing: Scalar smoothing value (0.0 to 0.999).
        symlog_linear_threshold: Linear threshold for the symlog
            scale.  Default 1.0 (omitted from JSON when default).
        group_by: Run-grouping configuration.
        y_axis_scale: Global Y-axis scale for scalar plots.
        x_axis_scale: Global X-axis scale (STEP/RELATIVE only).
        tag_axis_scales: Per-tag axis scale overrides.
        tag_symlog_linear_thresholds: Per-tag symlog thresholds.
        expanded_tag_groups: Tag-group expand/collapse state.

    Returns:
        A new :class:`Profile` instance.

    Raises:
        ValueError: If an invalid axis scale name is provided.
    """
    gc = (
        {e["groupKey"]: e["colorId"] for e in group_colors}
        if group_colors
        else None
    )
    return Profile(
        name,
        pinned_cards=pinned_cards,
        run_colors=run_colors,
        group_colors=gc,
        superimposed_cards=superimposed_cards,
        run_selection=run_selection,
        selected_runs=selected_runs,
        metric_descriptions=metric_descriptions,
        tag_filter=tag_filter,
        run_filter=run_filter,
        smoothing=smoothing,
        symlog_linear_threshold=(
            symlog_linear_threshold
            if symlog_linear_threshold != 1.0
            else None
        ),
        group_by=group_by,
        y_axis_scale=y_axis_scale,
        x_axis_scale=x_axis_scale,
        tag_axis_scales=tag_axis_scales,
        tag_symlog_linear_thresholds=tag_symlog_linear_thresholds,
        expanded_tag_groups=expanded_tag_groups,
    )


def write_profile(
    logdir: str, profile: SerializedProfile | Profile
) -> str:
    """Write a profile to the logdir.

    The profile is written to
    ``<logdir>/.tensorboard/default_profile.json``.

    Args:
        logdir: The TensorBoard log directory.
        profile: A :class:`Profile` instance or a
            ``SerializedProfile`` dict (from :func:`create_profile`).

    Returns:
        The path to the written profile file.
    """
    if isinstance(profile, Profile):
        profile = profile.serialize()
    profile_dir = os.path.join(logdir, ".tensorboard")
    os.makedirs(profile_dir, exist_ok=True)

    profile_path = os.path.join(profile_dir, "default_profile.json")
    with open(profile_path, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)

    return profile_path


def read_profile(logdir: str) -> SerializedProfile | None:
    """Read the default profile from a logdir.

    Returns:
        The profile dictionary, or ``None`` if no profile exists.
    """
    profile_path = os.path.join(logdir, ".tensorboard", "default_profile.json")
    if not os.path.exists(profile_path):
        return None

    try:
        with open(profile_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def set_default_profile(
    logdir: str,
    name: str = "Default Profile",
    pinned_cards: list[PinnedCard] | None = None,
    run_colors: dict[str, str] | None = None,
    group_colors: list[GroupColorEntry] | None = None,
    superimposed_cards: list[SuperimposedCardEntry] | None = None,
    run_selection: list[RunSelectionEntry] | None = None,
    selected_runs: list[str] | None = None,
    metric_descriptions: dict[str, str] | None = None,
    tag_filter: str = "",
    run_filter: str = "",
    smoothing: float = 0.6,
    symlog_linear_threshold: float = 1.0,
    group_by: GroupByConfig | None = None,
    y_axis_scale: AxisScale | None = None,
    x_axis_scale: AxisScale | None = None,
    tag_axis_scales: dict[str, TagAxisScale] | None = None,
    tag_symlog_linear_thresholds: dict[str, float] | None = None,
    expanded_tag_groups: dict[str, bool] | None = None,
) -> str:
    """Create and write a profile in one call.

    All parameters are forwarded to :func:`create_profile`;
    see its docstring for details.

    Returns:
        The path to the written profile file.
    """
    return create_profile(
        name=name,
        pinned_cards=pinned_cards,
        run_colors=run_colors,
        group_colors=group_colors,
        superimposed_cards=superimposed_cards,
        run_selection=run_selection,
        selected_runs=selected_runs,
        metric_descriptions=metric_descriptions,
        tag_filter=tag_filter,
        run_filter=run_filter,
        smoothing=smoothing,
        symlog_linear_threshold=symlog_linear_threshold,
        group_by=group_by,
        y_axis_scale=y_axis_scale,
        x_axis_scale=x_axis_scale,
        tag_axis_scales=tag_axis_scales,
        tag_symlog_linear_thresholds=tag_symlog_linear_thresholds,
        expanded_tag_groups=expanded_tag_groups,
    ).write(logdir)


# ---------------------------------------------------------------------------
# Convenience helpers for building common card entries
# ---------------------------------------------------------------------------
def pin_scalar(tag: str) -> PinnedCard:
    """Create a pinned scalar card entry."""
    return PinnedCard(plugin="scalars", tag=tag)


def pin_histogram(tag: str, run_id: str) -> PinnedCard:
    """Create a pinned histogram card entry."""
    return PinnedCard(plugin="histograms", tag=tag, runId=run_id)


def pin_image(tag: str, run_id: str, sample: int = 0) -> PinnedCard:
    """Create a pinned image card entry."""
    return PinnedCard(plugin="images", tag=tag, runId=run_id, sample=sample)


_superimposed_card_counter = 0


def create_superimposed_card(
    title: str,
    tags: list[str],
    run_id: str | None = None,
) -> SuperimposedCardEntry:
    """Create a superimposed (multi-tag overlay) card entry."""
    global _superimposed_card_counter
    _superimposed_card_counter += 1
    return SuperimposedCardEntry(
        id=f"superimposed-{int(time.time() * 1000)}"
        f"-{_superimposed_card_counter}",
        title=title,
        tags=tags,
        runId=run_id,
    )
