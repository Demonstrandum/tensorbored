# What's New in TensorBored

TensorBored is a drop-in fork of TensorBoard that fixes the things that have been driving you crazy.

```bash
pip install tensorbored
tensorbored --logdir ./logs   # that's it. reads your existing tfevents.
```

- [Stable run colours](#your-colours-keep-shuffling-fixed) — deterministic, or set them from Python
- [Superimposed plots](#you-cant-compare-two-metrics-on-the-same-chart-you-can-now) — multiple metrics on one chart
- [Dashboard profiles](#your-dashboard-resets-on-every-refresh-not-any-more) — persistent, exportable, configurable from Python
- [Log & symlog axes](#no-log-scale-on-the-x-axis-and-no-way-to-handle-negatives-fixed) — both axes, handles negatives
- [Pinned card reordering](#pinned-cards-are-stuck-in-the-order-you-pinned-them-not-here) — drag-and-drop
- [Metric descriptions](#you-have-50-metrics-and-cant-remember-what-aux_head_3nll-means-add-descriptions) — hover tooltips from Python
- [Default run visibility](#you-open-the-dashboard-and-everything-is-blank-thats-gone) — no more blank dashboards
- [Persistent tag filter](#the-tag-filter-keeps-resetting-it-remembers-now) — survives refresh

---

## Your colours keep shuffling? Fixed.

TensorBoard randomly assigns run colours on every page load. Refresh the page, and suddenly your baseline is green instead of blue. Maddening.

TensorBored computes colours deterministically from the run name. Same run, same colour, every time, across sessions, across browsers. No configuration needed.

Want full control? Set them from your training script:

```python
from tensorbored.plugins.core import profile_writer

profile_writer.set_default_profile(
    logdir='./logs',
    run_colors={
        'baseline': '#9E9E9E',
        'experiment_v1': '#2196F3',
        'experiment_v2': '#4CAF50',
    },
)
```

Or generate perceptually uniform palettes automatically:

```python
from tensorbored.plugins.core import color_sampler

run_colors = color_sampler.colors_for_runs(['baseline', 'exp_v1', 'exp_v2'])
```

---

## You can't compare two metrics on the same chart? You can now.

TensorBoard gives you one chart per tag. Want to see `train/loss` and `eval/loss` on the same axes? Too bad, scroll back and forth and squint.

TensorBored lets you superimpose any scalar tags onto a single chart. From the UI: click the menu on any card, "Add to superimposed plot", done. Or pre-configure them:

```python
profile_writer.set_default_profile(
    logdir='./logs',
    superimposed_cards=[
        profile_writer.create_superimposed_card(
            title='Train vs Eval Loss',
            tags=['loss/train', 'loss/eval'],
        ),
    ],
)
```

---

## Your dashboard resets on every refresh? Not any more.

TensorBoard stores layout in the URL. This means:
- Hit refresh? Layout gone.
- Too many pins? URL too long, browser truncates it.
- Share a config with a teammate? Copy-paste a 2000-character URL and pray.

TensorBored uses **localStorage-based profiles**. Pin cards, set colours, configure filters, adjust smoothing — it all persists across refreshes, across sessions. Export a profile as JSON, email it to a colleague, they import it in one click.

Pin limit went from ~15 (URL length cap) to **1,000**.

Set up the dashboard from Python before anyone even opens a browser:

```python
profile_writer.set_default_profile(
    logdir='./logs',
    name='Training Dashboard',
    pinned_cards=[
        profile_writer.pin_scalar('loss/train'),
        profile_writer.pin_scalar('accuracy/eval'),
    ],
    tag_filter='loss|accuracy',
    smoothing=0.8,
)
```

---

## No log scale on the x-axis? And no way to handle negatives? Fixed.

TensorBoard gives you a y-axis log toggle. That's it. No x-axis log scale for when your step counts span orders of magnitude. And if your data has zeros or negative values, log scale just breaks.

TensorBored adds **symmetric log scale** (symlog) for both axes. It's linear near zero, logarithmic for large magnitudes, and handles negatives gracefully. Both X and Y axes cycle through Linear, Log, and SymLog with a single click.

---

## Pinned cards are stuck in the order you pinned them? Not here.

Drag-and-drop to reorder. Arrow buttons for precise positioning. Order persists across refreshes.

---

## You have 50 metrics and can't remember what `aux_head_3/nll` means? Add descriptions.

```python
profile_writer.set_default_profile(
    logdir='./logs',
    metric_descriptions={
        'loss/train': 'Cross-entropy loss for backprop.',
        'aux_head_3/nll': 'NLL from the auxiliary prediction head on layer 3.',
        'gradients/global_norm': 'Global L2 norm of all gradients before clipping.',
    },
)
```

Hover over any metric card header and the description appears as a tooltip. Set it once in your training harness, every teammate sees it.

---

## You open the dashboard and everything is blank? That's gone.

TensorBoard sometimes loads with all runs hidden, giving you an empty dashboard with no explanation. TensorBored defaults all runs to visible. If a saved selection would hide every run, it resets to all-visible instead of showing you nothing.

---

## The tag filter keeps resetting? It remembers now.

Type a filter, refresh — it's still there. Clear the filter, refresh — it stays cleared. Your explicit choice is persisted and takes priority over profile defaults.

---

## Quick reference

| Pain point | TensorBoard | TensorBored |
|---|---|---|
| Run colours | Random on each load | Stable hash or explicit |
| Compare metrics | Separate charts, scroll | Superimposed plots |
| Dashboard state | URL (lost on refresh, length-limited) | localStorage profiles (persistent, exportable) |
| Pin limit | ~15 (URL length) | 1,000 |
| X-axis scale | Linear only | Linear, Log, SymLog |
| Y-axis negatives | Log breaks | SymLog handles it |
| Pin order | Fixed (insertion order) | Drag-and-drop |
| Metric docs | None | Hover descriptions |
| Settings on refresh | Gone | Persisted |
| All runs hidden | Blank dashboard | Auto-reset to visible |
| Tag filter on refresh | Resets | Remembered |
| Share config | Long URL | JSON export/import |
| Configure from Python | No | `profile_writer` API |
| Colour palette | Random | OKLCH perceptually uniform |

---

Everything is backwards compatible. Same `tfevents` format, same logdir structure, same CLI flags. Just `pip install tensorbored` and go.

For the full API reference and detailed examples, see [AGENTS_DOC.md](./AGENTS_DOC.md).
