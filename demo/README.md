---
title: TensorBored Demo
emoji: 📊
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: apache-2.0
---

# TensorBored Demo

**TensorBored** is a TensorBoard fork focused on PyTorch compatibility and improved usability.

This demo showcases the new features with pre-generated fake training data.

## ✨ New Features

### 1. Dashboard Profiles
Save, load, and share your dashboard configurations! No more lost settings.
- **Pinned Cards**: Pin important metrics for quick access (up to 1000!)
- **Run Colors**: Assign custom colors to runs
- **Filters & Smoothing**: All your settings persist
- **Export/Import**: Share profiles as JSON files

### 2. Color Sampler API
Generate perceptually uniform colors using the OKLCH color space:

```python
from tensorbored.plugins.core import color_sampler

# Auto-assign colors to runs
run_colors = color_sampler.colors_for_runs(['train', 'eval', 'test'])

# Get evenly-spaced colors
colors = color_sampler.sample_colors(5)
```

### 3. Python Profile Writer
Configure dashboards directly from your training scripts:

```python
from tensorbored.plugins.core import profile_writer, color_sampler

profile_writer.set_default_profile(
    logdir='/path/to/logs',
    name='My Training Dashboard',
    pinned_cards=[
        profile_writer.pin_scalar('loss/train'),
        profile_writer.pin_scalar('accuracy'),
    ],
    run_colors=color_sampler.colors_for_runs(['run1', 'run2']),
    smoothing=0.8,
    metric_descriptions={
        'loss/train': 'Training loss used for optimization.',
        'accuracy': 'Top-1 accuracy on the training set.',
    },
)
```

### 4. Metric Descriptions
Add long-form descriptions that show on hover in metric card headers:

```python
profile_writer.set_default_profile(
    logdir=logdir,
    metric_descriptions={
        'loss/train': 'Training loss used for optimization.',
        'loss/eval': 'Evaluation loss on the validation split.',
    },
)
```

### 5. Superimposed Cards
Compare multiple metrics on a single chart:

```python
profile_writer.set_default_profile(
    logdir=logdir,
    superimposed_cards=[
        profile_writer.create_superimposed_card(
            title='Train vs Eval Loss',
            tags=['loss/train', 'loss/eval'],
        ),
    ],
)
```

## 📊 Demo Data

This demo includes 5 simulated training runs:

| Run | Optimizer | LR | Batch Size |
|-----|-----------|-----|------------|
| baseline | SGD | 0.001 | 32 |
| adam_lr1e-3 | Adam | 0.001 | 32 |
| adam_lr1e-4 | Adam | 0.0001 | 32 |
| large_batch | Adam | 0.004 | 256 |
| small_batch | SGD | 0.0005 | 8 |

Each run logs:
- **Scalars**: loss, accuracy, learning rate
- **Histograms**: weight and gradient distributions
- **Images**: generated samples, attention maps
- **Text**: the source code that generated this data!

## 🚀 Running Locally

```bash
# Clone the repo
git clone https://github.com/your-org/tensorbored.git
cd tensorbored/demo

# Generate demo data
pip install numpy pillow
python generate_demo_data.py

# Start TensorBored
pip install tensorbored
tensorbored --logdir=./logs
```

## 📦 Docker

```bash
docker build -t tensorbored-demo .
docker run -p 7860:7860 tensorbored-demo
```

Then open http://localhost:7860

## 📖 Learn More

- Check the **Text** tab to see the full source code
- Click **Load Default Profile** to see the pre-configured dashboard
- Try **Export Profile** to download the configuration as JSON
- Hover metric titles to see description tooltips

---

*Built with ❤️ by the TensorBored team*
