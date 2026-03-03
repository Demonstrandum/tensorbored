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
"""Tests for profile_writer module."""

import json
import os
import tempfile
import unittest

from tensorbored.plugins.core import profile_writer


class ProfileWriterTest(unittest.TestCase):
    def setUp(self):
        self.logdir = tempfile.mkdtemp()

    def test_create_profile_returns_profile(self):
        """Test create_profile returns a Profile instance."""
        profile = profile_writer.create_profile()
        self.assertIsInstance(profile, profile_writer.Profile)

    def test_create_profile_defaults(self):
        """Test create_profile with default values."""
        profile = profile_writer.create_profile()
        self.assertEqual(profile.name, "Default Profile")
        self.assertEqual(profile.pinned_cards, [])
        self.assertEqual(profile.run_colors, {})
        self.assertEqual(profile.run_selection, [])
        self.assertEqual(profile.metric_descriptions, {})
        self.assertEqual(profile.tag_filter, "")
        self.assertEqual(profile.smoothing, 0.6)
        # Serialized form should have the correct version.
        s = profile.serialize()
        self.assertEqual(s["version"], profile_writer.PROFILE_VERSION)
        self.assertNotIn("runSelection", s["data"])
        self.assertNotIn("metricDescriptions", s["data"])

    def test_create_profile_with_pinned_cards(self):
        """Test create_profile with pinned cards."""
        pinned = [
            {"plugin": "scalars", "tag": "loss"},
            {"plugin": "scalars", "tag": "accuracy"},
        ]
        profile = profile_writer.create_profile(pinned_cards=pinned)
        self.assertEqual(profile.pinned_cards, pinned)

    def test_create_profile_with_run_colors(self):
        """Test create_profile stores run_colors as a dict."""
        colors = {"run1": "#ff0000", "run2": "#00ff00"}
        profile = profile_writer.create_profile(run_colors=colors)
        self.assertEqual(profile.run_colors, colors)

    def test_create_profile_with_all_options(self):
        """Test create_profile with all options."""
        profile = profile_writer.create_profile(
            name="My Dashboard",
            pinned_cards=[{"plugin": "scalars", "tag": "loss"}],
            run_colors={"train": "#0000ff"},
            selected_runs=["train", "eval"],
            metric_descriptions={
                "train/loss": "The loss used to optimize the model.",
            },
            tag_filter="train.*",
            run_filter="exp1",
            smoothing=0.9,
            group_by={"key": "REGEX", "regexString": "(.*)_train"},
        )
        self.assertEqual(profile.name, "My Dashboard")
        self.assertEqual(len(profile.pinned_cards), 1)
        self.assertEqual(profile.run_colors, {"train": "#0000ff"})
        self.assertEqual(len(profile.run_selection), 2)
        self.assertEqual(
            profile.metric_descriptions["train/loss"],
            "The loss used to optimize the model.",
        )
        self.assertEqual(profile.tag_filter, "train.*")
        self.assertEqual(profile.run_filter, "exp1")
        self.assertEqual(profile.smoothing, 0.9)
        self.assertEqual(profile.group_by["key"], "REGEX")

    def test_write_profile(self):
        """Test write_profile creates the profile file."""
        profile = profile_writer.create_profile(name="Test")
        path = profile_writer.write_profile(self.logdir, profile)

        self.assertTrue(os.path.exists(path))
        self.assertTrue(path.endswith("default_profile.json"))

        with open(path, "r") as f:
            saved = json.load(f)
        self.assertEqual(saved["data"]["name"], "Test")

    def test_write_profile_creates_directory(self):
        """Test write_profile creates .tensorboard directory if needed."""
        profile = profile_writer.create_profile()
        profile_writer.write_profile(self.logdir, profile)

        tb_dir = os.path.join(self.logdir, ".tensorboard")
        self.assertTrue(os.path.isdir(tb_dir))

    def test_read_profile(self):
        """Test read_profile reads back written profile."""
        profile = profile_writer.create_profile(name="Read Test")
        profile_writer.write_profile(self.logdir, profile)

        loaded = profile_writer.read_profile(self.logdir)
        self.assertIsNotNone(loaded)
        self.assertEqual(loaded["data"]["name"], "Read Test")

    def test_read_profile_returns_none_when_missing(self):
        """Test read_profile returns None when no profile exists."""
        loaded = profile_writer.read_profile(self.logdir)
        self.assertIsNone(loaded)

    def test_set_default_profile(self):
        """Test set_default_profile convenience function."""
        path = profile_writer.set_default_profile(
            self.logdir,
            name="Quick Setup",
            pinned_cards=[{"plugin": "scalars", "tag": "loss"}],
            run_colors={"train": "#ff0000"},
            smoothing=0.75,
        )

        self.assertTrue(os.path.exists(path))

        loaded = profile_writer.read_profile(self.logdir)
        self.assertEqual(loaded["data"]["name"], "Quick Setup")
        self.assertEqual(loaded["data"]["smoothing"], 0.75)

    def test_pin_scalar_helper(self):
        """Test pin_scalar helper function."""
        card = profile_writer.pin_scalar("train/loss")
        self.assertEqual(card, {"plugin": "scalars", "tag": "train/loss"})

    def test_pin_histogram_helper(self):
        """Test pin_histogram helper function."""
        card = profile_writer.pin_histogram("weights", "run1")
        self.assertEqual(
            card, {"plugin": "histograms", "tag": "weights", "runId": "run1"}
        )

    def test_pin_image_helper(self):
        """Test pin_image helper function."""
        card = profile_writer.pin_image("images/input", "run1", sample=2)
        self.assertEqual(
            card,
            {
                "plugin": "images",
                "tag": "images/input",
                "runId": "run1",
                "sample": 2,
            },
        )

    def test_create_superimposed_card_helper(self):
        """Test create_superimposed_card helper function."""
        card = profile_writer.create_superimposed_card(
            title="Train vs Eval Loss",
            tags=["train/loss", "eval/loss"],
        )
        self.assertEqual(card["title"], "Train vs Eval Loss")
        self.assertEqual(card["tags"], ["train/loss", "eval/loss"])
        self.assertIsNone(card["runId"])
        self.assertIn("id", card)

    def test_create_superimposed_card_unique_ids(self):
        """Test that multiple superimposed cards get unique IDs."""
        card1 = profile_writer.create_superimposed_card(
            title="Card A",
            tags=["loss/train", "loss/eval"],
        )
        card2 = profile_writer.create_superimposed_card(
            title="Card B",
            tags=["accuracy/train", "accuracy/eval"],
        )
        self.assertNotEqual(card1["id"], card2["id"])

    def test_create_profile_with_axis_scales(self):
        """Test create_profile with axis scale settings."""
        profile = profile_writer.create_profile(
            y_axis_scale="log10",
            x_axis_scale="symlog10",
        )
        self.assertEqual(profile.y_axis_scale, "log10")
        self.assertEqual(profile.x_axis_scale, "symlog10")

    def test_create_profile_omits_axis_scales_when_none(self):
        """Test create_profile omits axis scale fields when None."""
        profile = profile_writer.create_profile()
        data = profile.serialize()["data"]
        self.assertNotIn("yAxisScale", data)
        self.assertNotIn("xAxisScale", data)

    def test_create_profile_invalid_y_axis_scale(self):
        """Test create_profile raises for invalid Y axis scale."""
        with self.assertRaises(ValueError):
            profile_writer.create_profile(y_axis_scale="invalid")

    def test_create_profile_invalid_x_axis_scale(self):
        """Test create_profile raises for invalid X axis scale."""
        with self.assertRaises(ValueError):
            profile_writer.create_profile(x_axis_scale="quadratic")

    def test_set_default_profile_with_axis_scales(self):
        """Test set_default_profile passes axis scales through."""
        profile_writer.set_default_profile(
            self.logdir,
            y_axis_scale="log10",
            x_axis_scale="symlog10",
        )
        loaded = profile_writer.read_profile(self.logdir)
        self.assertEqual(loaded["data"]["yAxisScale"], "log10")
        self.assertEqual(loaded["data"]["xAxisScale"], "symlog10")

    def test_create_profile_with_tag_axis_scales(self):
        """Test create_profile with per-tag axis scales."""
        profile = profile_writer.create_profile(
            tag_axis_scales={
                "train/loss": {"y": "log10"},
                "eval/loss": {"y": "log10", "x": "symlog10"},
            },
        )
        self.assertEqual(profile.tag_axis_scales["train/loss"], {"y": "log10"})
        self.assertEqual(
            profile.tag_axis_scales["eval/loss"],
            {"y": "log10", "x": "symlog10"},
        )

    def test_create_profile_invalid_tag_axis_scale(self):
        """Test create_profile raises for invalid per-tag axis scale."""
        with self.assertRaises(ValueError):
            profile_writer.create_profile(
                tag_axis_scales={"loss": {"y": "cubic"}}
            ).serialize()

    def test_create_profile_invalid_tag_axis_key(self):
        """Test create_profile raises for invalid axis key."""
        with self.assertRaises(ValueError):
            profile_writer.create_profile(
                tag_axis_scales={"loss": {"z": "log10"}}
            ).serialize()

    def test_create_profile_with_expanded_tag_groups(self):
        """Test create_profile with expanded_tag_groups."""
        profile = profile_writer.create_profile(
            expanded_tag_groups={"train": True, "eval": True, "debug": False},
        )
        self.assertEqual(
            profile.expanded_tag_groups,
            {"train": True, "eval": True, "debug": False},
        )

    def test_create_profile_omits_expanded_tag_groups_when_none(self):
        """Test create_profile omits expandedTagGroups when not provided."""
        profile = profile_writer.create_profile()
        data = profile.serialize()["data"]
        self.assertNotIn("expandedTagGroups", data)

    def test_create_profile_omits_expanded_tag_groups_when_empty(self):
        """Test create_profile omits expandedTagGroups when empty dict."""
        profile = profile_writer.create_profile(expanded_tag_groups={})
        data = profile.serialize()["data"]
        self.assertNotIn("expandedTagGroups", data)

    def test_set_default_profile_with_expanded_tag_groups(self):
        """Test set_default_profile passes expanded_tag_groups through."""
        profile_writer.set_default_profile(
            self.logdir,
            expanded_tag_groups={"train": True, "eval": False},
        )
        loaded = profile_writer.read_profile(self.logdir)
        self.assertEqual(
            loaded["data"]["expandedTagGroups"],
            {"train": True, "eval": False},
        )


class ProfileClassTest(unittest.TestCase):
    """Tests for the Profile wrapper class."""

    def setUp(self):
        self.logdir = tempfile.mkdtemp()

    # ---- construction ----

    def test_defaults(self):
        p = profile_writer.Profile()
        self.assertEqual(p.name, "Default Profile")
        self.assertEqual(p.pinned_cards, [])
        self.assertEqual(p.run_colors, {})
        self.assertEqual(p.group_colors, {})
        self.assertEqual(p.superimposed_cards, [])
        self.assertEqual(p.run_selection, [])
        self.assertEqual(p.metric_descriptions, {})
        self.assertEqual(p.tag_filter, "")
        self.assertEqual(p.run_filter, "")
        self.assertEqual(p.smoothing, 0.6)
        self.assertIsNone(p.symlog_linear_threshold)
        self.assertIsNone(p.group_by)
        self.assertIsNone(p.y_axis_scale)
        self.assertIsNone(p.x_axis_scale)
        self.assertEqual(p.tag_axis_scales, {})
        self.assertEqual(p.tag_symlog_linear_thresholds, {})
        self.assertEqual(p.expanded_tag_groups, {})

    def test_construction_with_kwargs(self):
        p = profile_writer.Profile(
            "My Dashboard",
            pinned_cards=[{"plugin": "scalars", "tag": "loss"}],
            run_colors={"train": "#ff0000"},
            group_colors={"grp": 3},
            metric_descriptions={"loss": "The loss"},
            tag_filter="loss",
            run_filter="train",
            smoothing=0.9,
            symlog_linear_threshold=10.0,
            group_by={"key": "REGEX", "regexString": "(.*)"},
            y_axis_scale="log10",
            x_axis_scale="symlog10",
            tag_axis_scales={"loss": {"y": "log10"}},
            tag_symlog_linear_thresholds={"loss": 5.0},
            expanded_tag_groups={"train": True, "eval": False},
        )
        self.assertEqual(p.name, "My Dashboard")
        self.assertEqual(len(p.pinned_cards), 1)
        self.assertEqual(p.run_colors, {"train": "#ff0000"})
        self.assertEqual(p.group_colors, {"grp": 3})
        self.assertEqual(p.smoothing, 0.9)
        self.assertEqual(p.symlog_linear_threshold, 10.0)
        self.assertEqual(p.y_axis_scale, "log10")
        self.assertEqual(p.x_axis_scale, "symlog10")
        self.assertEqual(p.tag_axis_scales, {"loss": {"y": "log10"}})
        self.assertEqual(p.tag_symlog_linear_thresholds, {"loss": 5.0})
        self.assertEqual(p.expanded_tag_groups, {"train": True, "eval": False})

    def test_selected_runs_convenience(self):
        p = profile_writer.Profile(selected_runs=["train", "eval"])
        self.assertEqual(len(p.run_selection), 2)
        self.assertEqual(p.run_selection[0]["value"], "train")
        self.assertTrue(p.run_selection[0]["selected"])

    def test_run_selection_takes_priority_over_selected_runs(self):
        sel = [{"type": "RUN_ID", "value": "abc", "selected": False}]
        p = profile_writer.Profile(run_selection=sel, selected_runs=["x"])
        self.assertEqual(len(p.run_selection), 1)
        self.assertEqual(p.run_selection[0]["value"], "abc")

    # ---- setters ----

    def test_property_setters(self):
        p = profile_writer.Profile()
        p.name = "Updated"
        p.tag_filter = "acc"
        p.run_filter = "exp"
        p.smoothing = 0.99
        p.symlog_linear_threshold = 0.5
        p.group_by = {"key": "RUN"}
        p.y_axis_scale = "symlog10"
        p.x_axis_scale = "log10"
        p.expanded_tag_groups = {"a": True}
        self.assertEqual(p.name, "Updated")
        self.assertEqual(p.tag_filter, "acc")
        self.assertEqual(p.run_filter, "exp")
        self.assertEqual(p.smoothing, 0.99)
        self.assertEqual(p.symlog_linear_threshold, 0.5)
        self.assertEqual(p.y_axis_scale, "symlog10")
        self.assertEqual(p.x_axis_scale, "log10")
        self.assertEqual(p.expanded_tag_groups, {"a": True})

    def test_invalid_y_axis_scale(self):
        with self.assertRaises(ValueError):
            profile_writer.Profile(y_axis_scale="bad")

    def test_invalid_x_axis_scale(self):
        p = profile_writer.Profile()
        with self.assertRaises(ValueError):
            p.x_axis_scale = "bad"

    # ---- mutation of returned collections ----

    def test_run_colors_mutation(self):
        p = profile_writer.Profile()
        p.run_colors["train"] = "#aabbcc"
        self.assertEqual(p.run_colors["train"], "#aabbcc")

    def test_pinned_cards_mutation(self):
        p = profile_writer.Profile()
        p.pinned_cards.append({"plugin": "scalars", "tag": "loss"})
        self.assertEqual(len(p.pinned_cards), 1)

    def test_metric_descriptions_mutation(self):
        p = profile_writer.Profile()
        p.metric_descriptions["loss"] = "Training loss"
        self.assertEqual(p.metric_descriptions["loss"], "Training loss")

    def test_expanded_tag_groups_mutation(self):
        p = profile_writer.Profile()
        p.expanded_tag_groups["train"] = True
        self.assertTrue(p.expanded_tag_groups["train"])

    # ---- convenience helpers ----

    def test_pin_scalar(self):
        p = profile_writer.Profile()
        p.pin_scalar("train/loss")
        self.assertEqual(
            p.pinned_cards[-1],
            {"plugin": "scalars", "tag": "train/loss"},
        )

    def test_pin_histogram(self):
        p = profile_writer.Profile()
        p.pin_histogram("weights", "run1")
        self.assertEqual(
            p.pinned_cards[-1],
            {
                "plugin": "histograms",
                "tag": "weights",
                "runId": "run1",
            },
        )

    def test_pin_image(self):
        p = profile_writer.Profile()
        p.pin_image("images/input", "run1", sample=2)
        self.assertEqual(
            p.pinned_cards[-1],
            {
                "plugin": "images",
                "tag": "images/input",
                "runId": "run1",
                "sample": 2,
            },
        )

    def test_add_superimposed_card(self):
        p = profile_writer.Profile()
        p.add_superimposed_card("Train vs Eval", ["train/loss", "eval/loss"])
        self.assertEqual(len(p.superimposed_cards), 1)
        self.assertEqual(p.superimposed_cards[0]["title"], "Train vs Eval")
        self.assertEqual(
            p.superimposed_cards[0]["tags"],
            ["train/loss", "eval/loss"],
        )

    def test_select_runs(self):
        p = profile_writer.Profile()
        p.select_runs(["train", "eval"])
        self.assertEqual(len(p.run_selection), 2)
        self.assertEqual(p.run_selection[0]["type"], "RUN_NAME")
        self.assertEqual(p.run_selection[0]["value"], "train")
        self.assertTrue(p.run_selection[1]["selected"])

    # ---- serialization ----

    def test_serialize_defaults(self):
        p = profile_writer.Profile()
        s = p.serialize()
        self.assertEqual(s["version"], profile_writer.PROFILE_VERSION)
        data = s["data"]
        self.assertEqual(data["name"], "Default Profile")
        self.assertEqual(data["pinnedCards"], [])
        self.assertEqual(data["runColors"], [])
        self.assertEqual(data["groupColors"], [])
        self.assertEqual(data["superimposedCards"], [])
        self.assertEqual(data["tagFilter"], "")
        self.assertEqual(data["smoothing"], 0.6)
        self.assertNotIn("runSelection", data)
        self.assertNotIn("metricDescriptions", data)
        self.assertNotIn("yAxisScale", data)
        self.assertNotIn("xAxisScale", data)
        self.assertNotIn("tagAxisScales", data)
        self.assertNotIn("symlogLinearThreshold", data)
        self.assertNotIn("expandedTagGroups", data)

    def test_serialize_run_colors(self):
        p = profile_writer.Profile(run_colors={"a": "#111", "b": "#222"})
        data = p.serialize()["data"]
        color_dict = {e["runId"]: e["color"] for e in data["runColors"]}
        self.assertEqual(color_dict, {"a": "#111", "b": "#222"})

    def test_serialize_group_colors(self):
        p = profile_writer.Profile(group_colors={"grp": 5})
        data = p.serialize()["data"]
        self.assertEqual(
            data["groupColors"],
            [{"groupKey": "grp", "colorId": 5}],
        )

    def test_serialize_all_optional_fields(self):
        p = profile_writer.Profile(
            run_colors={"r": "#000"},
            selected_runs=["train"],
            metric_descriptions={"loss": "d"},
            group_by={"key": "RUN"},
            y_axis_scale="log10",
            x_axis_scale="symlog10",
            tag_axis_scales={"loss": {"y": "log10"}},
            symlog_linear_threshold=2.0,
            tag_symlog_linear_thresholds={"loss": 3.0},
            expanded_tag_groups={"train": True},
        )
        data = p.serialize()["data"]
        self.assertIn("runSelection", data)
        self.assertIn("metricDescriptions", data)
        self.assertEqual(data["groupBy"]["key"], "RUN")
        self.assertEqual(data["yAxisScale"], "log10")
        self.assertEqual(data["xAxisScale"], "symlog10")
        self.assertEqual(data["tagAxisScales"], {"loss": {"y": "log10"}})
        self.assertEqual(data["symlogLinearThreshold"], 2.0)
        self.assertEqual(data["tagSymlogLinearThresholds"], {"loss": 3.0})
        self.assertEqual(data["expandedTagGroups"], {"train": True})

    def test_serialize_validates_tag_axis_scales(self):
        p = profile_writer.Profile()
        p.tag_axis_scales["loss"] = {"z": "log10"}
        with self.assertRaises(ValueError):
            p.serialize()

    def test_serialize_validates_tag_axis_scale_values(self):
        p = profile_writer.Profile()
        p.tag_axis_scales["loss"] = {"y": "cubic"}
        with self.assertRaises(ValueError):
            p.serialize()

    # ---- from_serialized round-trip ----

    def test_from_serialized_round_trip(self):
        original = profile_writer.Profile(
            "Round Trip",
            pinned_cards=[
                profile_writer.pin_scalar("train/loss"),
            ],
            run_colors={"train": "#ff0000", "eval": "#00ff00"},
            group_colors={"grp": 2},
            metric_descriptions={"loss": "desc"},
            tag_filter="loss",
            smoothing=0.8,
            y_axis_scale="log10",
            expanded_tag_groups={"train": True},
            symlog_linear_threshold=5.0,
            tag_symlog_linear_thresholds={"loss": 10.0},
        )
        serialized = original.serialize()
        loaded = profile_writer.Profile.from_serialized(serialized)

        self.assertEqual(loaded.name, "Round Trip")
        self.assertEqual(len(loaded.pinned_cards), 1)
        self.assertEqual(
            loaded.run_colors,
            {"train": "#ff0000", "eval": "#00ff00"},
        )
        self.assertEqual(loaded.group_colors, {"grp": 2})
        self.assertEqual(loaded.metric_descriptions, {"loss": "desc"})
        self.assertEqual(loaded.tag_filter, "loss")
        self.assertEqual(loaded.smoothing, 0.8)
        self.assertEqual(loaded.y_axis_scale, "log10")
        self.assertEqual(loaded.expanded_tag_groups, {"train": True})
        self.assertEqual(loaded.symlog_linear_threshold, 5.0)
        self.assertEqual(loaded.tag_symlog_linear_thresholds, {"loss": 10.0})

    # ---- write / load round-trip ----

    def test_write_and_load(self):
        p = profile_writer.Profile(
            "Disk Trip",
            run_colors={"r1": "#abc"},
            smoothing=0.75,
        )
        p.pin_scalar("loss")
        path = p.write(self.logdir)
        self.assertTrue(os.path.exists(path))

        loaded = profile_writer.Profile.load(self.logdir)
        self.assertIsNotNone(loaded)
        self.assertEqual(loaded.name, "Disk Trip")
        self.assertEqual(loaded.run_colors, {"r1": "#abc"})
        self.assertEqual(loaded.smoothing, 0.75)
        self.assertEqual(len(loaded.pinned_cards), 1)

    def test_load_returns_none_when_missing(self):
        self.assertIsNone(profile_writer.Profile.load(self.logdir))

    def test_write_profile_accepts_profile_instance(self):
        p = profile_writer.Profile("Direct Write")
        path = profile_writer.write_profile(self.logdir, p)
        self.assertTrue(os.path.exists(path))
        loaded = profile_writer.read_profile(self.logdir)
        self.assertEqual(loaded["data"]["name"], "Direct Write")

    # ---- repr ----

    def test_repr(self):
        p = profile_writer.Profile("Test")
        self.assertEqual(repr(p), "Profile('Test')")

    # ---- update / merge ----

    def test_update_merges_dicts(self):
        a = profile_writer.Profile(
            run_colors={"r1": "#aaa"},
            metric_descriptions={"loss": "d1"},
            expanded_tag_groups={"train": True},
        )
        b = profile_writer.Profile(
            run_colors={"r2": "#bbb"},
            metric_descriptions={"acc": "d2"},
            expanded_tag_groups={"eval": False},
        )
        a.update(b)
        self.assertEqual(a.run_colors, {"r1": "#aaa", "r2": "#bbb"})
        self.assertEqual(a.metric_descriptions, {"loss": "d1", "acc": "d2"})
        self.assertEqual(
            a.expanded_tag_groups,
            {"train": True, "eval": False},
        )

    def test_update_extends_lists(self):
        a = profile_writer.Profile(
            pinned_cards=[profile_writer.pin_scalar("loss")]
        )
        b = profile_writer.Profile(
            pinned_cards=[profile_writer.pin_scalar("acc")]
        )
        a.update(b)
        self.assertEqual(len(a.pinned_cards), 2)

    def test_update_replaces_scalars(self):
        a = profile_writer.Profile("A", smoothing=0.8)
        b = profile_writer.Profile("B", smoothing=0.5)
        a.update(b)
        self.assertEqual(a.name, "B")
        self.assertEqual(a.smoothing, 0.5)

    def test_update_merges_tag_filter(self):
        a = profile_writer.Profile(tag_filter="loss")
        b = profile_writer.Profile(tag_filter="accuracy")
        a.update(b)
        self.assertEqual(a.tag_filter, "(loss)|(accuracy)")

    def test_update_merges_run_filter(self):
        a = profile_writer.Profile(run_filter="train")
        b = profile_writer.Profile(run_filter="eval")
        a.update(b)
        self.assertEqual(a.run_filter, "(train)|(eval)")

    def test_update_filter_one_side_empty(self):
        a = profile_writer.Profile(tag_filter="loss")
        b = profile_writer.Profile()
        a.update(b)
        self.assertEqual(a.tag_filter, "loss")

        c = profile_writer.Profile()
        d = profile_writer.Profile(tag_filter="acc")
        c.update(d)
        self.assertEqual(c.tag_filter, "acc")

    def test_update_skips_none_optionals(self):
        a = profile_writer.Profile(y_axis_scale="log10")
        b = profile_writer.Profile()
        a.update(b)
        self.assertEqual(a.y_axis_scale, "log10")

    def test_update_overrides_non_none_optionals(self):
        a = profile_writer.Profile(y_axis_scale="log10")
        b = profile_writer.Profile(y_axis_scale="symlog10")
        a.update(b)
        self.assertEqual(a.y_axis_scale, "symlog10")

    def test_or_returns_new_profile(self):
        a = profile_writer.Profile(
            "A",
            run_colors={"r1": "#aaa"},
            pinned_cards=[profile_writer.pin_scalar("loss")],
        )
        b = profile_writer.Profile(
            "B",
            run_colors={"r2": "#bbb"},
            pinned_cards=[profile_writer.pin_scalar("acc")],
            y_axis_scale="log10",
        )
        c = a | b
        self.assertIsNot(c, a)
        self.assertIsNot(c, b)
        self.assertEqual(c.name, "B")
        self.assertEqual(c.run_colors, {"r1": "#aaa", "r2": "#bbb"})
        self.assertEqual(len(c.pinned_cards), 2)
        self.assertEqual(c.y_axis_scale, "log10")
        # Originals are unmodified.
        self.assertEqual(a.run_colors, {"r1": "#aaa"})
        self.assertEqual(len(a.pinned_cards), 1)

    def test_ior_mutates_in_place(self):
        a = profile_writer.Profile("A", run_colors={"r1": "#aaa"})
        b = profile_writer.Profile("B", run_colors={"r2": "#bbb"})
        a |= b
        self.assertEqual(a.name, "B")
        self.assertEqual(a.run_colors, {"r1": "#aaa", "r2": "#bbb"})

    def test_or_not_implemented_for_non_profile(self):
        p = profile_writer.Profile()
        self.assertEqual(p.__or__("not a profile"), NotImplemented)
        self.assertEqual(p.__ior__("not a profile"), NotImplemented)

    # ---- builder workflow ----

    def test_builder_workflow(self):
        """End-to-end builder-pattern workflow."""
        p = profile_writer.Profile("Builder Test")
        p.pin_scalar("train/loss")
        p.pin_scalar("eval/loss")
        p.run_colors["train"] = "#2196F3"
        p.run_colors["eval"] = "#4CAF50"
        p.smoothing = 0.8
        p.tag_filter = "loss|accuracy"
        p.y_axis_scale = "log10"
        p.metric_descriptions["train/loss"] = "Training loss"
        p.expanded_tag_groups["train"] = True
        p.add_superimposed_card("Loss Comparison", ["train/loss", "eval/loss"])
        p.select_runs(["train", "eval"])

        path = p.write(self.logdir)
        loaded = profile_writer.Profile.load(self.logdir)

        self.assertEqual(loaded.name, "Builder Test")
        self.assertEqual(len(loaded.pinned_cards), 2)
        self.assertEqual(
            loaded.run_colors,
            {"train": "#2196F3", "eval": "#4CAF50"},
        )
        self.assertEqual(loaded.smoothing, 0.8)
        self.assertEqual(loaded.tag_filter, "loss|accuracy")
        self.assertEqual(loaded.y_axis_scale, "log10")
        self.assertEqual(
            loaded.metric_descriptions["train/loss"],
            "Training loss",
        )
        self.assertTrue(loaded.expanded_tag_groups["train"])
        self.assertEqual(len(loaded.superimposed_cards), 1)
        self.assertEqual(len(loaded.run_selection), 2)


class IntegrationTest(unittest.TestCase):
    """Integration tests demonstrating typical usage."""

    def setUp(self):
        self.logdir = tempfile.mkdtemp()

    def test_typical_training_setup(self):
        """Test a typical training script setup."""
        profile_writer.set_default_profile(
            self.logdir,
            name="Training Dashboard",
            pinned_cards=[
                profile_writer.pin_scalar("train/loss"),
                profile_writer.pin_scalar("train/accuracy"),
                profile_writer.pin_scalar("eval/loss"),
            ],
            run_colors={
                "train": "#2196F3",
                "eval": "#4CAF50",
            },
            tag_filter="loss|accuracy",
            smoothing=0.8,
        )

        loaded = profile_writer.Profile.load(self.logdir)
        self.assertIsNotNone(loaded)
        self.assertEqual(loaded.name, "Training Dashboard")
        self.assertEqual(len(loaded.pinned_cards), 3)
        self.assertEqual(len(loaded.run_colors), 2)

    def test_superimposed_cards_setup(self):
        """Test setting up superimposed cards."""
        profile_writer.set_default_profile(
            self.logdir,
            name="Combined Metrics",
            pinned_cards=[profile_writer.pin_scalar("train/loss")],
            superimposed_cards=[
                profile_writer.create_superimposed_card(
                    title="Loss Comparison",
                    tags=["train/loss", "eval/loss", "test/loss"],
                ),
                profile_writer.create_superimposed_card(
                    title="Accuracy Comparison",
                    tags=["train/accuracy", "eval/accuracy"],
                ),
            ],
        )

        loaded = profile_writer.read_profile(self.logdir)
        self.assertEqual(len(loaded["data"]["superimposedCards"]), 2)
        self.assertEqual(
            loaded["data"]["superimposedCards"][0]["title"], "Loss Comparison"
        )


if __name__ == "__main__":
    unittest.main()
