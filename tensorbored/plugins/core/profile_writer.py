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
TensorBoard dashboard configurations. When users load TensorBoard, the
default profile will be automatically applied.

Example usage:

    from tensorbored.plugins.core import profile_writer

    # Create a profile with pinned cards and run colors
    profile = profile_writer.create_profile(
        name="Training Dashboard",
        pinned_cards=[
            {"plugin": "scalars", "tag": "train/loss"},
            {"plugin": "scalars", "tag": "train/accuracy"},
            {"plugin": "scalars", "tag": "eval/loss"},
        ],
        run_colors={
            "train": "#2196F3",  # Blue
            "eval": "#4CAF50",   # Green
        },
        tag_filter="loss|accuracy",
        smoothing=0.8,
    )

    # Write the profile to the logdir
    profile_writer.write_profile(logdir, profile)

    # Or use the convenience function
    profile_writer.set_default_profile(
        logdir,
        pinned_cards=[{"plugin": "scalars", "tag": "train/loss"}],
        run_colors={"train": "#ff0000"},
    )
"""

import json
import os
import time
from typing import Any, Dict, List, Optional

# Profile format version
PROFILE_VERSION = 1


def create_profile(
    name: str = "Default Profile",
    pinned_cards: Optional[List[Dict[str, Any]]] = None,
    run_colors: Optional[Dict[str, str]] = None,
    group_colors: Optional[List[Dict[str, Any]]] = None,
    superimposed_cards: Optional[List[Dict[str, Any]]] = None,
    run_selection: Optional[List[Dict[str, Any]]] = None,
    selected_runs: Optional[List[str]] = None,
    metric_descriptions: Optional[Dict[str, str]] = None,
    tag_filter: str = "",
    run_filter: str = "",
    smoothing: float = 0.6,
    group_by: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create a TensorBoard profile dictionary.

    Args:
        name: User-friendly name for the profile.
        pinned_cards: List of cards to pin. Each card is a dict with:
            - plugin: str (e.g., "scalars", "images", "histograms")
            - tag: str (the tag name)
            - runId: str (optional, for single-run plugins)
            - sample: int (optional, for sampled plugins like images)
        run_colors: Dict mapping run names/IDs to hex color strings
            (e.g., {"run1": "#ff0000", "run2": "#00ff00"}).
        group_colors: List of group color assignments. Each entry is a dict:
            - groupKey: str
            - colorId: int
        superimposed_cards: List of superimposed card definitions. Each is:
            - id: str (unique identifier)
            - title: str (display title)
            - tags: List[str] (scalar tags to combine)
            - runId: Optional[str] (run filter, or None for all runs)
        run_selection: Optional run selection entries. Each entry is:
            - type: str ("RUN_ID" or "RUN_NAME")
            - value: str (run id or run name)
            - selected: bool
        selected_runs: Convenience list of run names to select by default.
        metric_descriptions: Mapping from metric tag name to a long-form
            Markdown description for that metric.
        tag_filter: Regex pattern to filter tags.
        run_filter: Regex pattern to filter runs.
        smoothing: Scalar smoothing value (0.0 to 0.999).
        group_by: Grouping configuration dict with:
            - key: str ("RUN", "EXPERIMENT", "REGEX", or "REGEX_BY_EXP")
            - regexString: str (optional, for REGEX/REGEX_BY_EXP)

    Returns:
        A profile dictionary ready to be written to the logdir.
    """
    # Convert run_colors dict to list format
    run_color_entries = []
    if run_colors:
        for run_id, color in run_colors.items():
            run_color_entries.append({"runId": run_id, "color": color})

    run_selection_entries = run_selection or []
    if not run_selection_entries and selected_runs:
        run_selection_entries = [
            {"type": "RUN_NAME", "value": run_name, "selected": True}
            for run_name in selected_runs
        ]

    return {
        "version": PROFILE_VERSION,
        "data": {
            "version": PROFILE_VERSION,
            "name": name,
            "lastModifiedTimestamp": int(time.time() * 1000),
            "pinnedCards": pinned_cards or [],
            "runColors": run_color_entries,
            "groupColors": group_colors or [],
            "superimposedCards": superimposed_cards or [],
            "runSelection": run_selection_entries,
            "metricDescriptions": metric_descriptions or {},
            "tagFilter": tag_filter,
            "runFilter": run_filter,
            "smoothing": smoothing,
            "groupBy": group_by,
        },
    }


def write_profile(logdir: str, profile: Dict[str, Any]) -> str:
    """Write a profile to the logdir.

    The profile will be written to `<logdir>/.tensorboard/default_profile.json`.
    When TensorBoard starts with this logdir, it will offer this profile
    as the default dashboard configuration.

    Args:
        logdir: The TensorBoard log directory.
        profile: A profile dictionary (from create_profile or manually created).

    Returns:
        The path to the written profile file.

    Raises:
        ValueError: If the profile is missing required fields.
        OSError: If unable to write to the logdir.
    """
    if "version" not in profile:
        raise ValueError("Profile must have a 'version' field")

    profile_dir = os.path.join(logdir, ".tensorboard")
    os.makedirs(profile_dir, exist_ok=True)

    profile_path = os.path.join(profile_dir, "default_profile.json")
    with open(profile_path, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)

    return profile_path


def read_profile(logdir: str) -> Optional[Dict[str, Any]]:
    """Read the default profile from a logdir.

    Args:
        logdir: The TensorBoard log directory.

    Returns:
        The profile dictionary, or None if no profile exists.
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
    pinned_cards: Optional[List[Dict[str, Any]]] = None,
    run_colors: Optional[Dict[str, str]] = None,
    group_colors: Optional[List[Dict[str, Any]]] = None,
    superimposed_cards: Optional[List[Dict[str, Any]]] = None,
    run_selection: Optional[List[Dict[str, Any]]] = None,
    selected_runs: Optional[List[str]] = None,
    metric_descriptions: Optional[Dict[str, str]] = None,
    tag_filter: str = "",
    run_filter: str = "",
    smoothing: float = 0.6,
    group_by: Optional[Dict[str, Any]] = None,
) -> str:
    """Convenience function to create and write a profile in one call.

    Args:
        logdir: The TensorBoard log directory.
        name: User-friendly name for the profile.
        pinned_cards: List of cards to pin (see create_profile).
        run_colors: Dict mapping run names to hex colors.
        group_colors: List of group color assignments.
        superimposed_cards: List of superimposed card definitions.
        run_selection: Optional run selection entries.
        selected_runs: Convenience list of run names to select by default.
        metric_descriptions: Mapping from metric tag name to a long-form
            Markdown description for that metric.
        tag_filter: Regex pattern to filter tags.
        run_filter: Regex pattern to filter runs.
        smoothing: Scalar smoothing value.
        group_by: Grouping configuration.

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
        group_by=group_by,
    )
    return write_profile(logdir, profile)


def pin_scalar(tag: str) -> Dict[str, str]:
    """Helper to create a pinned scalar card entry.

    Args:
        tag: The scalar tag name (e.g., "train/loss").

    Returns:
        A dict suitable for the pinned_cards list.
    """
    return {"plugin": "scalars", "tag": tag}


def pin_histogram(tag: str, run_id: str) -> Dict[str, str]:
    """Helper to create a pinned histogram card entry.

    Args:
        tag: The histogram tag name.
        run_id: The run ID (required for histograms).

    Returns:
        A dict suitable for the pinned_cards list.
    """
    return {"plugin": "histograms", "tag": tag, "runId": run_id}


def pin_image(tag: str, run_id: str, sample: int = 0) -> Dict[str, Any]:
    """Helper to create a pinned image card entry.

    Args:
        tag: The image tag name.
        run_id: The run ID (required for images).
        sample: The sample index (default 0).

    Returns:
        A dict suitable for the pinned_cards list.
    """
    return {"plugin": "images", "tag": tag, "runId": run_id, "sample": sample}


_superimposed_card_counter = 0


def create_superimposed_card(
    title: str,
    tags: List[str],
    run_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Helper to create a superimposed card entry.

    Superimposed cards combine multiple scalar tags on a single plot.

    Args:
        title: Display title for the card.
        tags: List of scalar tag names to superimpose.
        run_id: Optional run ID filter (None shows all runs).

    Returns:
        A dict suitable for the superimposed_cards list.
    """
    global _superimposed_card_counter
    _superimposed_card_counter += 1
    return {
        "id": f"superimposed-{int(time.time() * 1000)}-{_superimposed_card_counter}",
        "title": title,
        "tags": tags,
        "runId": run_id,
    }
