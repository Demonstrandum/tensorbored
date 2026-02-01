# TensorBored

TensorBored is a suite of web applications for inspecting and understanding your
runs and graphs, with a focus on PyTorch compatibility.

This README gives an overview of key concepts in TensorBored, as well as how to
interpret the visualizations it provides. For an in-depth example of using
TensorBoard, see the tutorial: [TensorBoard: Getting Started][].

TensorBored is designed to run entirely offline, without requiring any access
to the Internet. For instance, this may be on your local machine, behind a
corporate firewall, or in a datacenter.

[TensorBoard: Getting Started]: https://www.tensorflow.org/tensorboard/get_started
[TensorBoard.dev]: https://tensorbored.dev
[This experiment]: https://tensorbored.dev/experiment/EDZb7XgKSBKo6Gznh3i8hg/#scalars

# Usage

Before running TensorBored, make sure you have generated summary data in a log
directory by creating a summary writer:

``` python
# sess.graph contains the graph definition; that enables the Graph Visualizer.

file_writer = tf.summary.FileWriter('/path/to/logs', sess.graph)
```

For more details, see
[the TensorBoard tutorial](https://www.tensorflow.org/get_started/summaries_and_tensorboard).
Once you have event files, run TensorBored and provide the log directory. If
you're using a precompiled TensorFlow package (e.g. you installed via pip), run:

```
tensorbored --logdir path/to/logs
```

Or, if you are building from source:

```bash
bazel build tensorbored:tensorbored
./bazel-bin/tensorbored/tensorbored --logdir path/to/logs

# or even more succinctly
bazel run tensorbored -- --logdir path/to/logs
```

This should print that TensorBored has started. Next, connect to
http://localhost:6006.

TensorBored requires a `logdir` to read logs from. For info on configuring
it, run `tensorbored --help`.

TensorBored can be used in Google Chrome or Firefox. Other browsers might
work, but there may be bugs or performance issues.

# Dashboard Profiles

TensorBored supports **Dashboard Profiles**, a system for saving, loading, and
sharing your dashboard configurations (pinned cards, run colors, filters,
smoothing settings, and more).

## Why Profiles?

Previously, dashboard state was stored in the URL, causing issues:

- **URL length limits**: Browsers limit URLs to ~2000-8000 characters (~10 pinned cards max)
- **Unwieldy URLs**: Long encoded JSON was difficult to share
- **No persistence**: Refreshing the page lost your setup

Profiles solve this by storing configurations in:
1. **Browser localStorage** - automatic persistence across sessions
2. **JSON files** - sharing and programmatic configuration from training scripts

## Configuring from Training Scripts (Python API)

Set up default dashboard configurations from your training code using the
`profile_writer` module:

- Pre-configure dashboards for specific experiments
- Ensure team members see the same default view
- Automate dashboard setup in MLOps pipelines

### Basic Usage

```python
from tensorbored.plugins.core import profile_writer

# Set a default profile for your experiment
profile_writer.set_default_profile(
    logdir='/path/to/logs',
    name='Training Monitor',
    pinned_cards=[
        profile_writer.pin_scalar('train/loss'),
        profile_writer.pin_scalar('train/accuracy'),
        profile_writer.pin_scalar('eval/loss'),
        profile_writer.pin_scalar('eval/accuracy'),
    ],
    run_colors={
        'train': '#2196F3',  # Blue
        'eval': '#4CAF50',   # Green
    },
    smoothing=0.8,
    tag_filter='loss|accuracy',
)
```

### Automatic Color Generation (`color_sampler`)

Use the `color_sampler` module to generate perceptually uniform, distinguishable colors:

```python
from tensorbored.plugins.core import profile_writer, color_sampler

run_ids = ['baseline', 'experiment_v1', 'experiment_v2', 'ablation_a', 'ablation_b']

# Option 1: One-liner with colors_for_runs()
run_colors = color_sampler.colors_for_runs(run_ids)

# Option 2: Use ColorMap for more control
cm = color_sampler.ColorMap(len(run_ids))
run_colors = {rid: cm(i) for i, rid in enumerate(run_ids)}

# Option 3: Get a list of colors directly
colors = color_sampler.sample_colors(5)
run_colors = dict(zip(run_ids, colors))

# Use with profile_writer
profile_writer.set_default_profile(
    logdir='/path/to/logs',
    run_colors=run_colors,
    pinned_cards=[profile_writer.pin_scalar('loss')],
)
```

Colors are generated in **OKLCH color space** (perceptually uniform), ensuring
all colors are equally distinguishable.

#### `color_sampler` API

| Function | Description |
|----------|-------------|
| `sample_colors(n)` | Generate n evenly-spaced colors |
| `sample_colors_varied(n)` | Generate n colors with varied lightness (better for >8 colors) |
| `colors_for_runs(run_ids)` | Create a `{run_id: color}` dict directly |
| `ColorMap(n)` | Callable object: `cm(i)` returns color at index i |
| `palette_categorical(n)` | High-contrast colors for categorical data |
| `palette_sequential(n)` | Light-to-dark gradient (single hue) |
| `palette_diverging(n)` | Two-ended palette for data with midpoint |
| `lighten(hex, amount)` | Lighten a hex color |
| `darken(hex, amount)` | Darken a hex color |

#### Parameters

```python
# Customize the color generation
colors = color_sampler.sample_colors(
    n=10,
    lightness=0.7,    # 0-1, higher = lighter (default 0.7)
    chroma=0.15,      # 0-0.4, higher = more saturated (default 0.15)
    hue_start=0.0,    # 0-360, rotate the palette (default 0)
)

# For many runs (>8), use varied mode for maximum distinction
colors = color_sampler.sample_colors_varied(15)

# ColorMap with varied mode
cm = color_sampler.ColorMap(15, varied=True)
```

#### Examples

```python
# 5 colors for a small experiment
>>> color_sampler.sample_colors(5)
['#dc8a78', '#a4b93e', '#40c4aa', '#7aa6f5', '#d898d5']

# Sequential palette for ordered data (e.g., epochs)
>>> color_sampler.palette_sequential(5, hue=250)  # Blue gradient
['#e5e5f7', '#b5b5e5', '#8585d3', '#5555c1', '#2525af']

# Diverging palette for metrics with a meaningful center
>>> color_sampler.palette_diverging(5)  # Blue → White → Orange
['#4d7ec7', '#a5c0e2', '#f5f5f5', '#e5b99b', '#c76341']
```

### API Reference

#### `profile_writer.set_default_profile()`

Creates and writes a default profile to the log directory.

| Parameter | Type | Description |
|-----------|------|-------------|
| `logdir` | `str` | Path to TensorBored log directory |
| `name` | `str` | Display name for the profile (default: "Default Profile") |
| `pinned_cards` | `list` | List of cards to pin (use helper functions below) |
| `run_colors` | `dict` | Mapping of run names to hex color codes |
| `group_colors` | `dict` | Mapping of group keys to color IDs |
| `smoothing` | `float` | Scalar smoothing value, 0.0-0.999 (default: 0.6) |
| `tag_filter` | `str` | Regex to filter displayed tags |
| `run_filter` | `str` | Regex to filter displayed runs |
| `group_by` | `dict` | Run grouping configuration |

#### Pin Helper Functions

```python
# Pin a scalar chart (multi-run, shows all runs)
profile_writer.pin_scalar('loss')

# Pin a histogram for a specific run
profile_writer.pin_histogram('weights/layer1', run_id='experiment_1')

# Pin an image with specific sample index
profile_writer.pin_image('generated/samples', run_id='gan_run', sample=0)
```

#### Superimposed Cards (Custom Plots)

Create custom comparison charts with multiple metrics:

```python
profile_writer.set_default_profile(
    logdir='/path/to/logs',
    superimposed_cards=[
        profile_writer.create_superimposed_card(
            title='Loss Comparison',
            tags=['train/loss', 'eval/loss', 'test/loss'],
        ),
        profile_writer.create_superimposed_card(
            title='Per-Run Accuracy',
            tags=['accuracy'],
            run_id='best_model',
        ),
    ],
)
```

#### Advanced: Group By Configuration

```python
# Group runs by experiment
profile_writer.set_default_profile(
    logdir='/path/to/logs',
    group_by={'key': 'experiment'},
)

# Group runs by regex pattern
profile_writer.set_default_profile(
    logdir='/path/to/logs',
    group_by={
        'key': 'regex',
        'regex_string': r'(train|eval)_.*',
    },
)
```

### Storage Location

The profile is written to:
```
<logdir>/.tensorboard/default_profile.json
```

This file is automatically loaded when TensorBored starts with that log directory.

## Frontend Profile Management

The TensorBored web interface provides a profile management menu for interactive
configuration.

### Features

| Feature | Description |
|---------|-------------|
| **Save Profile** | Save current dashboard state with a custom name |
| **Load Profile** | Switch to a previously saved profile |
| **Delete Profile** | Remove profiles you no longer need |
| **Export Profile** | Download profile as JSON file for sharing |
| **Import Profile** | Load a profile from a JSON file |
| **Load Default** | Load the default profile from the log directory (if set by training script) |

### What Gets Saved

A profile captures:

- **Pinned Cards**: All your pinned scalar, histogram, and image cards
- **Superimposed Cards**: Custom comparison charts you've created
- **Run Colors**: Custom colors assigned to runs
- **Group Colors**: Colors for run groups
- **Smoothing**: Scalar smoothing setting
- **Tag Filter**: Current tag filter regex
- **Run Filter**: Current run filter regex
- **Group By**: Run grouping configuration

### Storage

Frontend profiles are stored in **browser localStorage**, which means:

- ✅ Persists across browser sessions
- ✅ No URL length limitations
- ✅ Supports up to 1000 pinned cards
- ⚠️ Per-browser (not synced across devices)
- ⚠️ Cleared if you clear browser data

Use **Export/Import** to transfer profiles between browsers or share with teammates.

## Data Flow: Frontend ↔ Backend

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TRAINING SCRIPT                               │
│                                                                         │
│   profile_writer.set_default_profile(logdir, ...)                       │
│                              │                                          │
│                              ▼                                          │
│              <logdir>/.tensorboard/default_profile.json                 │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               │ (TensorBored reads on startup)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TENSORBORED BACKEND                             │
│                                                                         │
│   GET /data/profile  →  Returns default_profile.json contents           │
│   POST /data/profile →  Saves new default profile (optional)            │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               │ (HTTP API)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TENSORBORED FRONTEND                            │
│                                                                         │
│   localStorage['tb-profile-*']  ←→  User profiles                       │
│   localStorage['tb-saved-pins'] ←→  Auto-saved pinned cards             │
│                                                                         │
│   Profile Menu:                                                         │
│   • Save/Load/Delete profiles                                           │
│   • Export/Import JSON                                                  │
│   • Load Default (from backend)                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Configuration Reference

### Profile JSON Schema

```json
{
  "version": 1,
  "name": "My Profile",
  "lastModifiedTimestamp": 1706745600000,
  "pinnedCards": [
    {"plugin": "scalars", "tag": "train/loss"},
    {"plugin": "images", "tag": "samples", "runId": "exp1", "sample": 0}
  ],
  "runColors": [
    {"runId": "train", "color": "#2196F3"},
    {"runId": "eval", "color": "#4CAF50"}
  ],
  "groupColors": [
    {"groupKey": "experiment:exp1", "colorId": 0}
  ],
  "superimposedCards": [
    {
      "id": "custom-card-1",
      "title": "Loss Comparison",
      "tags": ["train/loss", "eval/loss"],
      "runId": null
    }
  ],
  "tagFilter": "loss|accuracy",
  "runFilter": "",
  "smoothing": 0.8,
  "groupBy": null
}
```

### localStorage Keys

| Key | Description |
|-----|-------------|
| `tb-saved-pins` | Auto-saved pinned cards (all types) |
| `tb-profile-index` | List of saved profile names |
| `tb-profile-<name>` | Individual profile data |
| `tb-active-profile` | Currently active profile name |

### Backwards Compatibility

- **Old URLs with pins**: Still work! TensorBored reads pinned cards from URL
  parameters for backwards compatibility with shared links.
- **Legacy scalar pins**: The old `tb-saved-scalar-pins` localStorage key is
  automatically migrated to the new format on first load.

## Examples

### Example 1: Research Experiment Setup

```python
# In your training script (train.py)
from tensorbored.plugins.core import profile_writer

def setup_tensorbored_profile(logdir):
    """Configure TensorBored for this experiment."""
    profile_writer.set_default_profile(
        logdir=logdir,
        name='ResNet-50 Training',
        pinned_cards=[
            # Loss curves
            profile_writer.pin_scalar('loss/total'),
            profile_writer.pin_scalar('loss/classification'),
            profile_writer.pin_scalar('loss/regularization'),
            # Metrics
            profile_writer.pin_scalar('metrics/accuracy'),
            profile_writer.pin_scalar('metrics/top5_accuracy'),
            # Learning rate
            profile_writer.pin_scalar('learning_rate'),
        ],
        superimposed_cards=[
            profile_writer.create_superimposed_card(
                title='Train vs Eval Loss',
                tags=['train/loss', 'eval/loss'],
            ),
        ],
        run_colors={
            'baseline': '#9E9E9E',
            'experiment_v1': '#2196F3',
            'experiment_v2': '#4CAF50',
        },
        smoothing=0.9,
        tag_filter='loss|accuracy|learning_rate',
    )

# Call during training setup
setup_tensorbored_profile('/experiments/resnet50/logs')
```

### Example 2: Team Dashboard Template

```python
# Create a shareable profile JSON programmatically
from tensorbored.plugins.core import profile_writer
import json

profile = profile_writer.create_profile(
    name='Team Standard View',
    pinned_cards=[
        profile_writer.pin_scalar('train/loss'),
        profile_writer.pin_scalar('eval/loss'),
        profile_writer.pin_scalar('eval/accuracy'),
    ],
    smoothing=0.6,
)

# Save to a shared location
with open('team_profile.json', 'w') as f:
    json.dump(profile, f, indent=2)

# Team members can import this via the TensorBored UI
```

### Example 3: CI/CD Integration

```python
# In your CI pipeline
from tensorbored.plugins.core import profile_writer

def configure_ci_tensorboard(logdir, experiment_name):
    """Standard CI TensorBored configuration."""
    profile_writer.set_default_profile(
        logdir=logdir,
        name=f'CI: {experiment_name}',
        pinned_cards=[
            profile_writer.pin_scalar('loss'),
            profile_writer.pin_scalar('accuracy'),
            profile_writer.pin_scalar('throughput'),
        ],
        tag_filter='loss|accuracy|throughput',
        smoothing=0.0,  # No smoothing for CI metrics
    )
```

## Migration from URL-based Storage

If you're upgrading from an older version:

1. **Existing URL bookmarks**: Still work for loading, but new pins won't be added to the URL
2. **Legacy scalar pins**: Automatically migrated to new format
3. **Pin limit**: Increased from 10 to 1000

No action required — migration happens automatically on first use.

# Key Concepts

### Summary Ops: How TensorBored gets data from TensorFlow

The first step in using TensorBored is acquiring data from your TensorFlow run.
For this, you need
[summary ops](https://www.tensorflow.org/api_docs/python/tf/summary).
Summary ops are ops, just like
[`tf.matmul`](https://www.tensorflow.org/api_docs/python/tf/linalg/matmul)
and
[`tf.nn.relu`](https://www.tensorflow.org/api_docs/python/tf/nn/relu),
which means they take in tensors, produce tensors, and are evaluated from within
a TensorFlow graph. However, summary ops have a twist: the Tensors they produce
contain serialized protobufs, which are written to disk and sent to TensorBored.
To visualize the summary data in TensorBored, you should evaluate the summary
op, retrieve the result, and then write that result to disk using a
summary.FileWriter. A full explanation, with examples, is in [the
tutorial](https://www.tensorflow.org/get_started/summaries_and_tensorboard).

The supported summary ops include:
* [`tf.summary.scalar`](https://www.tensorflow.org/api_docs/python/tf/summary/scalar)
* [`tf.summary.image`](https://www.tensorflow.org/api_docs/python/tf/summary/image)
* [`tf.summary.audio`](https://www.tensorflow.org/api_docs/python/tf/summary/audio)
* [`tf.summary.text`](https://www.tensorflow.org/api_docs/python/tf/summary/text)
* [`tf.summary.histogram`](https://www.tensorflow.org/api_docs/python/tf/summary/histogram)

### Tags: Giving names to data

When you make a summary op, you will also give it a `tag`. The tag is basically
a name for the data recorded by that op, and will be used to organize the data
in the frontend. The scalar and histogram dashboards organize data by tag, and
group the tags into folders according to a directory/like/hierarchy. If you have
a lot of tags, we recommend grouping them with slashes.

### Event Files & LogDirs: How TensorBored loads the data

`summary.FileWriters` take summary data from TensorFlow, and then write them to a
specified directory, known as the `logdir`. Specifically, the data is written to
an append-only record dump that will have "tfevents" in the filename.
TensorBored reads data from a full directory, and organizes it into the history
of a single TensorFlow execution.

Why does it read the whole directory, rather than an individual file? You might
have been using
[supervisor.py](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/python/training/supervisor.py)
to run your model, in which case if TensorFlow crashes, the supervisor will
restart it from a checkpoint. When it restarts, it will start writing to a new
events file, and TensorBored will stitch the various event files together to
produce a consistent history of what happened.

### Runs: Comparing different executions of your model

You may want to visually compare multiple executions of your model; for example,
suppose you've changed the hyperparameters and want to see if it's converging
faster. TensorBored enables this through different "runs". When TensorBored is
passed a `logdir` at startup, it recursively walks the directory tree rooted at
`logdir` looking for subdirectories that contain tfevents data. Every time it
encounters such a subdirectory, it loads it as a new `run`, and the frontend
will organize the data accordingly.

For example, here is a well-organized TensorBored log directory, with two runs,
"run1" and "run2".

```
/some/path/mnist_experiments/
/some/path/mnist_experiments/run1/
/some/path/mnist_experiments/run1/events.out.tfevents.1456525581.name
/some/path/mnist_experiments/run1/events.out.tfevents.1456525585.name
/some/path/mnist_experiments/run2/
/some/path/mnist_experiments/run2/events.out.tfevents.1456525385.name
/tensorbored --logdir /some/path/mnist_experiments
```

#### Logdir & Logdir_spec (Legacy Mode)

You may also pass a comma separated list of log directories, and TensorBored
will watch each directory. You can also assign names to individual log
directories by putting a colon between the name and the path, as in

```
tensorbored --logdir_spec name1:/path/to/logs/1,name2:/path/to/logs/2
```

_This flag (`--logdir_spec`) is discouraged and can usually be avoided_. TensorBored walks log directories recursively; for finer-grained control, prefer using a symlink tree. _Some features may not work when using `--logdir_spec` instead of `--logdir`._

# The Visualizations

### Scalar Dashboard

TensorBored's Scalar Dashboard visualizes scalar statistics that vary over time;
for example, you might want to track the model's loss or learning rate. As
described in *Key Concepts*, you can compare multiple runs, and the data is
organized by tag. The line charts have the following interactions:

* Clicking on the small blue icon in the lower-left corner of each chart will
expand the chart

* Dragging a rectangular region on the chart will zoom in

* Double clicking on the chart will zoom out

* Mousing over the chart will produce crosshairs, with data values recorded in
the run-selector on the left.

Additionally, you can create new folders to organize tags by writing regular
expressions in the box in the top-left of the dashboard.

### Histogram Dashboard

The Histogram Dashboard displays how the statistical distribution of a Tensor
has varied over time. It visualizes data recorded via `tf.summary.histogram`.
Each chart shows temporal "slices" of data, where each slice is a histogram of
the tensor at a given step. It's organized with the oldest timestep in the back,
and the most recent timestep in front. By changing the Histogram Mode from
"offset" to "overlay", the perspective will rotate so that every histogram slice
is rendered as a line and overlaid with one another.

### Distribution Dashboard

The Distribution Dashboard is another way of visualizing histogram data from
`tf.summary.histogram`. It shows some high-level statistics on a distribution.
Each line on the chart represents a percentile in the distribution over the
data: for example, the bottom line shows how the minimum value has changed over
time, and the line in the middle shows how the median has changed. Reading from
top to bottom, the lines have the following meaning: `[maximum, 93%, 84%, 69%,
50%, 31%, 16%, 7%, minimum]`

These percentiles can also be viewed as standard deviation boundaries on a
normal distribution: `[maximum, μ+1.5σ, μ+σ, μ+0.5σ, μ, μ-0.5σ, μ-σ, μ-1.5σ,
minimum]` so that the colored regions, read from inside to outside, have widths
`[σ, 2σ, 3σ]` respectively.

### Image Dashboard

The Image Dashboard can display pngs that were saved via a `tf.summary.image`.
The dashboard is set up so that each row corresponds to a different tag, and
each column corresponds to a run. Since the image dashboard supports arbitrary
pngs, you can use this to embed custom visualizations (e.g. matplotlib
scatterplots) into TensorBored. This dashboard always shows you the latest image
for each tag.

### Audio Dashboard

The Audio Dashboard can embed playable audio widgets for audio saved via a
`tf.summary.audio`. The dashboard is set up so that each row corresponds to a
different tag, and each column corresponds to a run. This dashboard always
embeds the latest audio for each tag.

### Graph Explorer

The Graph Explorer can visualize a TensorFlow graph, enabling inspection of the
TensorFlow model. To get best use of the graph visualizer, you should use name
scopes to hierarchically group the ops in your graph - otherwise, the graph may
be difficult to decipher. For more information, including examples, see the
[examining the TensorFlow graph](https://www.tensorflow.org/tensorboard/graphs)
tutorial.

### Embedding Projector

The Embedding Projector allows you to visualize high-dimensional data; for
example, you may view your input data after it has been embedded in a high-
dimensional space by your model. The embedding projector reads data from your
model checkpoint file, and may be configured with additional metadata, like
a vocabulary file or sprite images. For more details, see [the embedding
projector tutorial](https://www.tensorflow.org/tutorials/text/word_embeddings).

### Text Dashboard

The Text Dashboard displays text snippets saved via `tf.summary.text`. Markdown
features including hyperlinks, lists, and tables are all supported.

### Time Series Dashboard

The Time Series Dashboard shows a unified interface containing all your Scalars,
Histograms, and Images saved via `tf.summary.scalar`, `tf.summary.image`, or
`tf.summary.histogram`. It enables viewing your 'accuracy' line chart side by
side with activation histograms and training example images, for example.

Features include:

* Custom run colors: click on the colored circles in the run selector to change
a run's color.

* Pinned cards: click the 'pin' icon on any card to add it to the pinned section
at the top for quick comparison.

* Settings: the right pane offers settings for charts and other visualizations.
Important settings will persist across TensorBored sessions, when hosted at the
same URL origin.

* Autocomplete in tag filter: search for specific charts more easily.

# Frequently Asked Questions

### My TensorBored isn't showing any data! What's wrong?

First, check that the directory passed to `--logdir` is correct. You can also
verify this by navigating to the Scalars dashboard (under the "Inactive" menu)
and looking for the log directory path at the bottom of the left sidebar.

If you're loading from the proper path, make sure that event files are present.
TensorBored will recursively walk its logdir, it's fine if the data is nested
under a subdirectory. Ensure the following shows at least one result:

`find DIRECTORY_PATH | grep tfevents`

You can also check that the event files actually have data by running
tensorboard in inspect mode to inspect the contents of your event files.

`tensorbored --inspect --logdir DIRECTORY_PATH`

The output for an event file corresponding to a blank TensorBored may
still sometimes show a few steps, representing a few initial events that
aren't shown by TensorBored (for example, when using the Keras TensorBoard callback):

```
tensor
   first_step           0
   last_step            2
   max_step             2
   min_step             0
   num_steps            2
   outoforder_steps     [(2, 0), (2, 0), (2, 0)]
```

In contrast, the output for an event file with more data might look like this:

```
tensor
   first_step           0
   last_step            55
   max_step             250
   min_step             0
   num_steps            60
   outoforder_steps     [(2, 0), (2, 0), (2, 0), (2, 0), (50, 9), (100, 19), (150, 29), (200, 39), (250, 49)]
```

### TensorBored is showing only some of my data, or isn't properly updating!

> **Update:** After [2.3.0 release][2-3-0], TensorBoard no longer auto reloads
> every 30 seconds. To re-enable the behavior, please open the settings by
> clicking the gear icon in the top-right of the TensorBored web interface, and
> enable "Reload data".

> **Update:** the [experimental `--reload_multifile=true` option][pr-1867] can
> now be used to poll all "active" files in a directory for new data, rather
> than the most recent one as described below. A file is "active" as long as it
> received new data within `--reload_multifile_inactive_secs` seconds ago,
> defaulting to 86400.

This issue usually comes about because of how TensorBored iterates through the
`tfevents` files: it progresses through the events file in timestamp order, and
only reads one file at a time. Let's suppose we have files with timestamps `a`
and `b`, where `a<b`. Once TensorBored has read all the events in `a`, it will
never return to it, because it assumes any new events are being written in the
more recent file. This could cause an issue if, for example, you have two
`FileWriters` simultaneously writing to the same directory. If you have
multiple summary writers, each one should be writing to a separate directory.

### Does TensorBored support multiple or distributed summary writers?

> **Update:** the [experimental `--reload_multifile=true` option][pr-1867] can
> now be used to poll all "active" files in a directory for new data, defined as
> any file that received new data within `--reload_multifile_inactive_secs`
> seconds ago, defaulting to 86400.

No. TensorBored expects that only one events file will be written to at a time,
and multiple summary writers means multiple events files. If you are running a
distributed TensorFlow instance, we encourage you to designate a single worker
as the "chief" that is responsible for all summary processing. See
[supervisor.py](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/python/training/supervisor.py)
for an example.

### I'm seeing data overlapped on itself! What gives?

If you are seeing data that seems to travel backwards through time and overlap
with itself, there are a few possible explanations.

* You may have multiple execution of TensorFlow that all wrote to the same log
directory. Please have each TensorFlow run write to its own logdir.

  > **Update:** the [experimental `--reload_multifile=true` option][pr-1867] can
  > now be used to poll all "active" files in a directory for new data, defined
  > as any file that received new data within `--reload_multifile_inactive_secs`
  > seconds ago, defaulting to 86400.

* You may have a bug in your code where the global_step variable (passed
to `FileWriter.add_summary`) is being maintained incorrectly.

* It may be that your TensorFlow job crashed, and was restarted from an earlier
checkpoint. See *How to handle TensorFlow restarts*, below.

As a workaround, try changing the x-axis display in TensorBored from `steps` to
`wall_time`. This will frequently clear up the issue.

### How should I handle TensorFlow restarts?

TensorFlow is designed with a mechanism for graceful recovery if a job crashes
or is killed: TensorFlow can periodically write model checkpoint files, which
enable you to restart TensorFlow without losing all your training progress.

However, this can complicate things for TensorBored; imagine that TensorFlow
wrote a checkpoint at step `a`, and then continued running until step `b`, and
then crashed and restarted at timestamp `a`. All of the events written between
`a` and `b` were "orphaned" by the restart event and should be removed.

To facilitate this, we have a `SessionLog` message in
`tensorflow/core/util/event.proto` which can record `SessionStatus.START` as an
event; like all events, it may have a `step` associated with it. If TensorBored
detects a `SessionStatus.START` event with step `a`, it will assume that every
event with a step greater than `a` was orphaned, and it will discard those
events. This behavior may be disabled with the flag
`--purge_orphaned_data false` (in versions after 0.7).

### How can I export data from TensorBored?

The Scalar Dashboard supports exporting data; you can click the "enable
download links" option in the left-hand bar. Then, each plot will provide
download links for the data it contains.

If you need access to the full dataset, you can read the event files that
TensorBored consumes by using the [`summary_iterator`](
https://www.tensorflow.org/api_docs/python/tf/compat/v1/train/summary_iterator)
method.

### Can I make my own plugin?

Yes! You can clone and tinker with one of the [examples][plugin-examples] and
make your own, amazing visualizations. More documentation on the plugin system
is described in the [ADDING_A_PLUGIN](./ADDING_A_PLUGIN.md) guide. Feel free to
file feature requests or questions about plugin functionality.

Once satisfied with your own groundbreaking new plugin, see the
[distribution section][plugin-distribution] on how to publish to PyPI and share
it with the community.

[plugin-examples]: ./tensorbored/examples/plugins
[plugin-distribution]: ./ADDING_A_PLUGIN.md#distribution

### Can I customize which lines appear in a plot?

Using the [custom scalars plugin](tensorbored/plugins/custom_scalar), you can
create scalar plots with lines for custom run-tag pairs. However, within the
original scalars dashboard, each scalar plot corresponds to data for a specific
tag and contains lines for each run that includes that tag.

### Can I visualize margins above and below lines?

Margin plots (that visualize lower and upper bounds) may be created with the
[custom scalars plugin](tensorbored/plugins/custom_scalar). The original
scalars plugin does not support visualizing margins.

### Can I create scatterplots (or other custom plots)?

This isn't yet possible. As a workaround, you could create your custom plot in
your own code (e.g. matplotlib) and then write it into an `SummaryProto`
(`core/framework/summary.proto`) and add it to your `FileWriter`. Then, your
custom plot will appear in the TensorBored image tab.

### Is my data being downsampled? Am I really seeing all the data?

TensorBored uses [reservoir
sampling](https://en.wikipedia.org/wiki/Reservoir_sampling) to downsample your
data so that it can be loaded into RAM. You can modify the number of elements it
will keep per tag by using the `--samples_per_plugin` command line argument (ex:
`--samples_per_plugin=scalars=500,images=20`).
See this [Stack Overflow question](http://stackoverflow.com/questions/43702546/tensorboard-doesnt-show-all-data-points/)
for some more information.

### I get a network security popup every time I run TensorBored on a mac!

Versions of TensorBoard prior to TensorBoard 2.0 would by default serve on host
`0.0.0.0`, which is publicly accessible. For those versions of TensorBoard, you
can stop the popups by specifying `--host localhost` at startup.

In TensorBoard 2.0 and up, `--host localhost` is the default. Use `--bind_all`
to restore the old behavior of serving to the public network on both IPv4 and
IPv6.

### Can I run `tensorboard` without a TensorFlow installation?

TensorBoard 1.14+ can be run with a reduced feature set if you do not have
TensorFlow installed. The primary limitation is that as of 1.14, only the
following plugins are supported: scalars, custom scalars, image, audio,
graph, projector (partial), distributions, histograms, text, PR curves, mesh.
In addition, there is no support for log directories on Google Cloud Storage.

### How can I contribute to TensorBored development?

See [DEVELOPMENT.md](DEVELOPMENT.md).

### I have a different issue that wasn't addressed here!

First, try searching our [GitHub
issues](https://github.com/tensorflow/tensorboard/issues) and
[Stack Overflow][stack-overflow]. It may be
that someone else has already had the same issue or question.

General usage questions (or problems that may be specific to your local setup)
should go to [Stack Overflow][stack-overflow].

If you have found a bug in TensorBored, please [file a GitHub issue](
https://github.com/tensorflow/tensorboard/issues/new) with as much supporting
information as you can provide (e.g. attaching events files, including the output
of `tensorbored --inspect`, etc.).

[stack-overflow]: https://stackoverflow.com/questions/tagged/tensorboard
[pr-1867]: https://github.com/tensorflow/tensorboard/pull/1867
[2-3-0]: https://github.com/tensorflow/tensorboard/releases/tag/2.3.0
