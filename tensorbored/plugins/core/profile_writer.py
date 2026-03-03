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

The recommended approach is the :class:`Profile` wrapper, which gives
Pythonic attribute access over the camelCase JSON the frontend expects::

    from tensorbored.plugins.core import profile_writer

    p = profile_writer.Profile("Training Dashboard")
    p.pin_scalar("train/loss")
    p.pin_scalar("eval/loss")
    p.run_colors["train"] = "#2196F3"
    p.run_colors["eval"] = "#4CAF50"
    p.tag_filter = "loss|accuracy"
    p.smoothing = 0.8
    p.write("./logs")

Or construct from keyword arguments::

    p = profile_writer.Profile(
        "Training Dashboard",
        pinned_cards=[profile_writer.pin_scalar("train/loss")],
        run_colors={"train": "#ff0000"},
        tag_axis_scales={"train/loss": {"y": "log10"}},
        smoothing=0.8,
    )
    p.write(logdir)

The one-shot helpers ``set_default_profile`` and ``create_profile``
are still available for simple cases::

    profile_writer.set_default_profile(
        logdir,
        pinned_cards=[{"plugin": "scalars", "tag": "train/loss"}],
        run_colors={"train": "#ff0000"},
        tag_axis_scales={"train/loss": {"y": "log10"}},
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
# Profile wrapper
# ---------------------------------------------------------------------------
class Profile:
    """High-level wrapper for a TensorBored dashboard profile.

    Provides Pythonic attribute access (snake_case properties) over
    the camelCase ``ProfileData`` dictionary that the frontend and
    JSON serialisation format expect.

    Basic usage::

        from tensorbored.plugins.core import profile_writer

        p = profile_writer.Profile("My Dashboard")
        p.pin_scalar("train/loss")
        p.pin_scalar("eval/loss")
        p.run_colors["train"] = "#2196F3"
        p.smoothing = 0.8
        p.y_axis_scale = "log10"
        p.write("./logs")

    Keyword-argument construction::

        p = profile_writer.Profile(
            "Training Monitor",
            pinned_cards=[profile_writer.pin_scalar("train/loss")],
            run_colors={"train": "#ff0000"},
            smoothing=0.9,
        )
        p.write(logdir)

    Loading an existing profile::

        p = profile_writer.Profile.load("./logs")
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
) -> SerializedProfile:
    """Create a TensorBoard profile dictionary.

    Args:
        name: User-friendly name for the profile.
        pinned_cards: Cards to pin at the top of the dashboard.
        run_colors: Mapping from run name/ID to hex colour string.
        group_colors: Group-key to colour-palette-index assignments.
        superimposed_cards: Multi-tag overlay card definitions.
        run_selection: Explicit run visibility entries.
        selected_runs: Convenience list of run names to select
            (converted to ``RunSelectionEntry`` with ``type="RUN_NAME"``
            and ``selected=True``).
        metric_descriptions: Long-form Markdown descriptions per tag.
        tag_filter: Regex pattern to filter tags.
        run_filter: Regex pattern to filter runs.
        smoothing: Scalar smoothing value (0.0 to 0.999).
        symlog_linear_threshold: Linear threshold for the symlog scale.
            Controls the width of the linear region near zero. Default 1.0.
        group_by: Run-grouping configuration.
        y_axis_scale: Global Y-axis scale for scalar plots.
        x_axis_scale: Global X-axis scale for scalar plots
            (STEP/RELATIVE only).
        tag_symlog_linear_thresholds: Per-tag symlog linear threshold
            overrides. Example: ``{"train/loss": 10.0}``
        tag_axis_scales: Per-tag axis scale overrides.  Example::

                {"train/loss": {"y": "log10"}}

        expanded_tag_groups: Which tag group sections to expand or
            collapse. Maps tag group names to booleans
            (``True`` = expanded, ``False`` = collapsed).
            When omitted, the dashboard uses its default behaviour
            (auto-expand the first two groups).  Example::

                {"train": True, "eval": True, "debug": False}

    Returns:
        A serialised profile ready to be written to the logdir.

    Raises:
        ValueError: If an invalid axis scale name is provided.
    """
    if y_axis_scale is not None and y_axis_scale not in VALID_AXIS_SCALES:
        raise ValueError(
            f"Invalid y_axis_scale: {y_axis_scale!r}. "
            f"Must be one of {VALID_AXIS_SCALES}"
        )
    if x_axis_scale is not None and x_axis_scale not in VALID_AXIS_SCALES:
        raise ValueError(
            f"Invalid x_axis_scale: {x_axis_scale!r}. "
            f"Must be one of {VALID_AXIS_SCALES}"
        )
    if tag_axis_scales is not None:
        for tag, axes in tag_axis_scales.items():
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

    run_color_entries: list[RunColorEntry] = [
        RunColorEntry(runId=run_id, color=color)
        for run_id, color in (run_colors or {}).items()
    ]

    run_selection_entries = run_selection or []
    if not run_selection_entries and selected_runs:
        run_selection_entries = [
            RunSelectionEntry(type="RUN_NAME", value=run_name, selected=True)
            for run_name in selected_runs
        ]

    data = ProfileData(
        version=PROFILE_VERSION,
        name=name,
        lastModifiedTimestamp=int(time.time() * 1000),
        pinnedCards=pinned_cards or [],
        runColors=run_color_entries,
        groupColors=group_colors or [],
        superimposedCards=superimposed_cards or [],
        tagFilter=tag_filter,
        runFilter=run_filter,
        smoothing=smoothing,
    )
    if run_selection_entries:
        data["runSelection"] = run_selection_entries
    if metric_descriptions:
        data["metricDescriptions"] = metric_descriptions
    if group_by is not None:
        data["groupBy"] = group_by
    if y_axis_scale is not None:
        data["yAxisScale"] = y_axis_scale
    if x_axis_scale is not None:
        data["xAxisScale"] = x_axis_scale
    if tag_axis_scales:
        data["tagAxisScales"] = tag_axis_scales
    if symlog_linear_threshold != 1.0:
        data["symlogLinearThreshold"] = symlog_linear_threshold
    if tag_symlog_linear_thresholds:
        data["tagSymlogLinearThresholds"] = tag_symlog_linear_thresholds
    if expanded_tag_groups:
        data["expandedTagGroups"] = expanded_tag_groups

    return SerializedProfile(version=PROFILE_VERSION, data=data)


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
    profile = create_profile(
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
    )
    return write_profile(logdir, profile)


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
