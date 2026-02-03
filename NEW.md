# TensorBored - New Features

TensorBored is a fork of TensorBoard with enhanced features for PyTorch workflows and improved user experience.

## Quick Feature List

- **Dashboard Profiles** - Save, load, and share complete dashboard configurations
- **Superimposed Plots** - Combine multiple metrics on a single chart for easy comparison
- **Pinned Card Reordering** - Drag-and-drop to reorganize your pinned charts
- **Profile Writer API** - Configure dashboards from Python training scripts
- **Color Sampler** - Generate perceptually uniform color palettes for runs
- **Persistent Settings** - Your customizations survive page refreshes
- **PR Preview Deployments** - Automatic Hugging Face Space previews for PRs
- **Offline-First Design** - Works entirely without internet access

---

## Dashboard Profiles

Profiles let you save and restore your entire dashboard state including pinned cards, run colors, filters, and smoothing settings.

### Features

- **Save/Load** - Save current state with a name, load it later
- **Import/Export** - Share profiles as JSON files with teammates
- **Backend Defaults** - Training scripts can set default profiles via `profile_writer`
- **Automatic Persistence** - Active profile persists across browser sessions

### Usage

Access profiles via the bookmark icon in the top bar. The menu provides options to:
- Save current dashboard state
- Load saved profiles
- Export profiles as JSON for sharing
- Import profiles from teammates

### Python API

```python
from tensorbored.plugins.core import profile_writer

profile_writer.set_default_profile(
    logdir='/path/to/logs',
    name='Training Monitor',
    pinned_cards=[
        profile_writer.pin_scalar('train/loss'),
        profile_writer.pin_scalar('eval/accuracy'),
    ],
    run_colors={'train': '#2196F3', 'eval': '#4CAF50'},
    smoothing=0.8,
)
```

---

## Superimposed Plots

Compare multiple metrics on a single chart by superimposing them.

### Features

- Overlay different tags on one chart (e.g., train/loss + eval/loss)
- Each tag gets a distinct color
- Dynamically add/remove tags from superimposed charts
- Title automatically updates to reflect included metrics

### Usage

1. Hover over any scalar card
2. Click the "Add to superimposed" option in the card menu
3. Either create a new superimposed card or add to an existing one
4. Superimposed cards appear in a dedicated section

---

## Pinned Card Reordering

Organize your pinned cards in any order you prefer.

### Features

- Drag-and-drop pinned cards to reorder them
- Use arrow buttons for precise positioning
- Order persists with profiles

---

## Color Sampler Module

Generate distinguishable colors for runs programmatically.

### API

```python
from tensorbored.plugins.core import color_sampler

# Generate N colors
colors = color_sampler.sample_colors(5)

# Get colors for specific runs
run_colors = color_sampler.colors_for_runs(['exp1', 'exp2', 'exp3'])

# For many runs (>8), use varied lightness
colors = color_sampler.sample_colors_varied(15)

# Palette types
colors = color_sampler.palette_categorical(8)   # High contrast
colors = color_sampler.palette_sequential(5)    # Light to dark
colors = color_sampler.palette_diverging(5)     # Two-ended
```

Colors are generated in OKLCH color space for perceptual uniformity.

---

## Persistent Tag Filter

The tag filter (regex search bar) remembers your preferences:

- When you clear the filter, it stays cleared on refresh
- User preferences override profile defaults
- Stored in browser localStorage

---

## PR Preview Deployments

Pull requests automatically get preview deployments on Hugging Face Spaces.

### How It Works

1. When a PR is opened/updated, CI builds a wheel
2. A Hugging Face Space is created/updated with the build
3. A comment is posted on the PR with preview links
4. Space is deleted when PR is closed

---

## Offline-First Design

TensorBored works entirely offline:

- No external network requests during normal operation
- All assets bundled locally
- Suitable for air-gapped environments

---

## Default Run Selection

When loading the dashboard:

- All runs are visible by default (unless explicitly configured otherwise)
- If you previously hid all runs, the default is restored on refresh
- Profiles can specify which runs should be visible

---

## Storage Architecture

TensorBored uses localStorage for persistence:

| Key Pattern | Contents |
|------------|----------|
| `_tb_profile.*` | Saved dashboard profiles |
| `_tb_active_profile` | Currently active profile name |
| `_tb_run_selection.v1` | Run visibility states |
| `_tb_run_colors.v1` | Custom run colors |
| `_tb_tag_filter.v1` | Tag filter regex |
| `tb-saved-pins` | Pinned cards |

---

## Migration from TensorBoard

TensorBored is a drop-in replacement:

- Reads the same tfevents files
- Compatible with existing logdirs
- Same command-line interface
- URL-based pins from TensorBoard still work

To switch:
```bash
# Instead of: tensorboard --logdir ./logs
tensorbored --logdir ./logs
```
