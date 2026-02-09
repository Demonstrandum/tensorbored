# TensorBored - New Features

TensorBored is a fork of TensorBoard with enhanced features for PyTorch workflows and improved user experience.

## Quick Feature List

- **Dashboard Profiles** - No more URL length limits; configure dashboards programmatically and cache in localStorage
- **Superimposed Plots** - Combine multiple metrics on a single chart for easy comparison
- **Pinned Card Reordering** - Drag-and-drop to reorganize your pinned charts
- **Programmatic Run Colors** - Set colors from your training harness, or get stable hash-based colors automatically
- **Log/Symlog X-Axis** - Log scale for x-axis, plus symlog scale for plots with negative values
- **Persistent Settings** - Tag filters, run selections, and customizations survive page refreshes

---

## Dashboard Profiles

Traditional TensorBoard stores dashboard state in the URL, which hits browser URL length limits with complex configurations. TensorBored profiles solve this:

- **No URL limits** - Profiles are stored in browser localStorage, not the URL
- **Programmatic configuration** - Set default profiles from your Python training harness
- **Shareable** - Export/import profiles as JSON files to share with teammates
- **Automatic persistence** - Active profile persists across browser sessions

### Usage

Access profiles via the flag icon in the top bar. The menu provides options to:
- Save current dashboard state
- Load saved profiles
- Export profiles as JSON for sharing
- Import profiles from teammates
- View the raw profile JSON

### Python API

Configure your dashboard before users even open it:

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
    tag_filter='loss|accuracy',
)
```

When users open TensorBored pointed at this logdir, they get your pre-configured view automatically.

---

## Superimposed Plots

Compare multiple metrics on a single chart by superimposing them.

### Features

- Overlay different tags on one chart (e.g., train/loss + eval/loss)
- Each tag gets a distinct color
- Dynamically add/remove tags from superimposed charts
- Title automatically updates to reflect included metrics (e.g., "loss" → "loss + accuracy")

### Usage

1. Hover over any scalar card
2. Click the "Add to superimposed" option in the card menu
3. Either create a new superimposed card or add to an existing one
4. Superimposed cards appear in a dedicated section

---

## Pinned Card Reordering

Organize your pinned cards in any order you prefer.

- Drag-and-drop pinned cards to reorder them
- Use arrow buttons for precise positioning
- Order persists with profiles

---

## Programmatic Run Colors

### Stable Colors by Default

In stock TensorBoard, run colors change randomly on page refresh. TensorBored computes colors deterministically from the run ID/name hash, so:

- **Consistent colors** - Same run always gets the same color
- **Refresh-safe** - Colors don't shuffle when you reload the page
- **Cross-session stable** - Colors stay the same across browser sessions

### Set Colors from Your Harness

For full control, set run colors programmatically:

```python
from tensorbored.plugins.core import profile_writer

profile_writer.set_default_profile(
    logdir='/path/to/logs',
    name='My Experiment',
    run_colors={
        'baseline': '#9E9E9E',
        'experiment_v1': '#2196F3',
        'experiment_v2': '#4CAF50',
    },
)
```

If you don't specify colors, the stable hash-based colors are used.

---

## Log Scale and Symlog for X-Axis

### Log Scale X-Axis

For experiments with exponential step ranges, use log scale on the x-axis to see early training details without losing late-stage visibility.

### Symlog Scale

When plotting metrics that can go negative (like some loss functions or gradients), standard log scale breaks. Symlog (symmetric log) handles this:

- Linear near zero
- Logarithmic for large positive and negative values
- Smooth transition between regions

This lets you visualize metrics spanning many orders of magnitude in both directions.

---

## Persistent Tag Filter

The tag filter (regex search bar) remembers your preferences:

- When you clear the filter, it stays cleared on refresh
- User preferences override profile defaults
- No more fighting with a filter that keeps resetting

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
