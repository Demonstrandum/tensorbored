#!/usr/bin/env python3
"""
TensorBored Demo Data Generator

This script generates fake PyTorch training data to showcase all the features
of TensorBored. It creates:

- Multiple training runs with different hyperparameters
- Scalar metrics (loss, accuracy, learning rate)
- Histograms (weight distributions over time)
- Images (generated samples, attention maps)
- Text summaries (sample training script)
- A default profile with pinned cards and custom colors

The generated data demonstrates:
1. Dashboard Profiles - pre-configured views from training scripts
2. Color Sampler - perceptually uniform colors for runs
3. Pinned Cards - important metrics always visible
4. Metric Descriptions - hover text for metric cards
5. Superimposed Cards - comparing multiple metrics on one chart
6. Run Grouping - organizing related experiments

Run this script to regenerate the demo data:
    python generate_demo_data.py

Then start TensorBored:
    tensorbored --logdir=./logs
"""

import math
import random
import hashlib
from pathlib import Path

import numpy as np

from tensorbored.torch import SummaryWriter
from tensorbored.plugins.core import profile_writer, color_sampler
from tensorbored.summary import Writer as NativeWriter

# ==============================================================================
# Configuration
# ==============================================================================

LOGDIR = Path(__file__).parent / "logs"
TOTAL_STEPS = 500
LOG_EVERY = 5

# Experiment configurations
EXPERIMENTS = {
    "baseline": {
        "lr": 0.001,
        "batch_size": 32,
        "optimizer": "SGD",
        "loss_scale": 1.0,
        "converge_step": 400,
    },
    "adam_lr1e-3": {
        "lr": 0.001,
        "batch_size": 32,
        "optimizer": "Adam",
        "loss_scale": 0.85,
        "converge_step": 300,
    },
    "adam_lr1e-4": {
        "lr": 0.0001,
        "batch_size": 32,
        "optimizer": "Adam",
        "loss_scale": 0.9,
        "converge_step": 450,
    },
    "large_batch": {
        "lr": 0.004,
        "batch_size": 256,
        "optimizer": "Adam",
        "loss_scale": 0.8,
        "converge_step": 250,
    },
    "small_batch": {
        "lr": 0.0005,
        "batch_size": 8,
        "optimizer": "SGD",
        "loss_scale": 1.1,
        "converge_step": 480,
    },
}


# ==============================================================================
# Synthetic Data Generation
# ==============================================================================


def generate_loss_curve(step: int, config: dict, seed: int) -> float:
    """Generate a realistic loss curve with noise."""
    random.seed(seed + step)

    # Exponential decay with noise
    scale = config["loss_scale"]
    converge = config["converge_step"]

    # Base loss curve: starts high, decays exponentially
    progress = min(step / converge, 1.0)
    base_loss = 2.5 * math.exp(-3 * progress) + 0.1

    # Add realistic noise (more noise early, less late)
    noise_scale = 0.15 * (1 - progress * 0.7)
    noise = random.gauss(0, noise_scale)

    # Occasional spikes (learning rate warmup artifacts)
    if step < 50 and random.random() < 0.1:
        noise += random.uniform(0.1, 0.3)

    return max(0.01, (base_loss + noise) * scale)


def generate_accuracy_curve(step: int, config: dict, seed: int) -> float:
    """Generate accuracy curve (inverse of loss, bounded 0-1)."""
    random.seed(seed + step + 1000)

    converge = config["converge_step"]
    scale = config["loss_scale"]

    # Sigmoid-like accuracy growth
    progress = min(step / converge, 1.0)
    base_acc = 1 / (1 + math.exp(-8 * (progress - 0.3)))

    # Scale by experiment quality (lower loss_scale = better experiment)
    base_acc = base_acc * (1.1 - scale * 0.15)

    # Add noise
    noise = random.gauss(0, 0.02 * (1 - progress * 0.5))

    return min(0.99, max(0.1, base_acc + noise))


def generate_lr_schedule(step: int, config: dict) -> float:
    """Generate learning rate with warmup and decay."""
    base_lr = config["lr"]

    # Warmup for first 50 steps
    if step < 50:
        return base_lr * (step / 50)

    # Cosine decay after warmup
    progress = (step - 50) / (TOTAL_STEPS - 50)
    return base_lr * (0.5 * (1 + math.cos(math.pi * progress)))


def generate_weight_histogram(step: int, layer: str, seed: int) -> np.ndarray:
    """Generate fake weight distributions that evolve over training."""
    np.random.seed(seed + step)

    # Weights start with larger variance, converge to smaller
    progress = step / TOTAL_STEPS
    std = 0.5 * (1 - progress * 0.6)

    # Different layers have different distributions
    if "conv" in layer:
        # Conv layers: roughly normal
        return np.random.normal(0, std, 1000)
    elif "bn" in layer:
        # BatchNorm: gamma near 1, beta near 0
        if "gamma" in layer:
            return np.random.normal(1.0, std * 0.2, 500)
        else:
            return np.random.normal(0, std * 0.3, 500)
    else:
        # FC layers: slightly wider distribution
        return np.random.normal(0, std * 1.2, 2000)


def generate_gradient_histogram(step: int, layer: str, seed: int) -> np.ndarray:
    """Generate fake gradient distributions."""
    np.random.seed(seed + step + 5000)

    # Gradients get smaller as training progresses
    progress = step / TOTAL_STEPS
    scale = 0.1 * (1 - progress * 0.8)

    # Heavy-tailed distribution for gradients
    return np.random.laplace(0, scale, 1000)


def generate_sample_image(step: int, seed: int) -> np.ndarray:
    """Generate a fake 'generated sample' image that improves over time."""
    np.random.seed(seed + step)

    # Image quality improves with training
    progress = step / TOTAL_STEPS
    noise_level = 0.5 * (1 - progress * 0.9)

    # Create a pattern that becomes clearer over time
    x = np.linspace(-1, 1, 64)
    y = np.linspace(-1, 1, 64)
    X, Y = np.meshgrid(x, y)

    # Circular pattern
    pattern = np.sin(5 * np.sqrt(X**2 + Y**2) - step * 0.05)
    pattern = (pattern + 1) / 2  # Normalize to 0-1

    # Add noise
    noise = np.random.uniform(0, noise_level, (64, 64))
    image = np.clip(pattern * (1 - noise_level) + noise, 0, 1)

    # Convert to RGB
    rgb = np.stack([image, image * 0.8, image * 0.6], axis=-1)
    return (rgb * 255).astype(np.uint8)


def generate_attention_map(step: int, seed: int) -> np.ndarray:
    """Generate a fake attention map visualization."""
    np.random.seed(seed + step + 10000)

    # Attention becomes more focused over time
    progress = step / TOTAL_STEPS
    focus = 0.1 + progress * 0.4

    x = np.linspace(-1, 1, 32)
    y = np.linspace(-1, 1, 32)
    X, Y = np.meshgrid(x, y)

    # Multiple attention heads
    attention = np.zeros((32, 32))
    n_heads = 4
    for i in range(n_heads):
        np.random.seed(seed + step + 10000 + i)
        cx = np.random.uniform(-0.5, 0.5)
        cy = np.random.uniform(-0.5, 0.5)
        attention += np.exp(-((X - cx) ** 2 + (Y - cy) ** 2) / (2 * focus**2))

    attention = attention / attention.max()

    # Apply colormap (viridis-like)
    r = np.clip(attention * 0.3 + 0.1, 0, 1)
    g = np.clip(attention * 0.8, 0, 1)
    b = np.clip(1 - attention * 0.5, 0, 1)

    rgb = np.stack([r, g, b], axis=-1)
    return (rgb * 255).astype(np.uint8)


# ==============================================================================
# Profile Setup
# ==============================================================================


def setup_default_profile(logdir: Path, run_ids: list):
    """Create a default TensorBoard profile showcasing all features."""

    # Generate perceptually uniform colors for all runs
    run_colors = color_sampler.colors_for_runs(run_ids, varied=True)

    # Create the default profile
    profile_writer.set_default_profile(
        logdir=str(logdir),
        name="TensorBored Demo Dashboard",
        # Pin the most important metrics
        pinned_cards=[
            profile_writer.pin_scalar("loss/train"),
            profile_writer.pin_scalar("loss/eval"),
            profile_writer.pin_scalar("accuracy/train"),
            profile_writer.pin_scalar("accuracy/eval"),
            profile_writer.pin_scalar("learning_rate"),
        ],
        # Create superimposed cards for comparison
        superimposed_cards=[
            profile_writer.create_superimposed_card(
                title="Train vs Eval Loss",
                tags=["loss/train", "loss/eval"],
            ),
            profile_writer.create_superimposed_card(
                title="Train vs Eval Accuracy",
                tags=["accuracy/train", "accuracy/eval"],
            ),
        ],
        # Apply generated colors
        run_colors=run_colors,
        # Configure filters and smoothing
        tag_filter="loss|accuracy|learning_rate",
        metric_descriptions={
            "loss/train": "Training loss used for optimization.",
            "loss/eval": "Evaluation loss on the validation split.",
            "loss/components/classification": "Classification (cross-entropy) component of the training loss.",
            "loss/components/regularization": "L2 regularization component of the training loss.",
            "accuracy/train": "Top-1 accuracy on the training set.",
            "accuracy/eval": "Top-1 accuracy on the validation set.",
            "learning_rate": "Learning rate after warmup and cosine decay.",
            "gradients/global_norm": "Global L2 norm of all gradients.",
            "diagnostics/convergence_rate": "Rate of convergence toward the loss minimum.",
            "diagnostics/performance/throughput/tokens_per_sec": "Training throughput in tokens processed per second.",
            "diagnostics/performance/memory/peak_mb": "Peak GPU memory usage in megabytes.",
        },
        smoothing=0.8,
        # Group runs by experiment type
        group_by={
            "key": "regex",
            "regexString": r"(baseline|adam|large|small)",
        },
        # Per-tag axis scales: log for loss curves
        tag_axis_scales={
            "loss/train": {"y": "log10"},
            "loss/eval": {"y": "log10"},
        },
        # Expand nested groups to showcase hierarchical grouping
        expanded_tag_groups={
            "loss": True,
            "loss/components": True,
            "accuracy": True,
            "gradients": True,
            "gradients/per_layer": True,
            "gradients/per_layer/encoder": True,
            "gradients/per_layer/decoder": True,
            "weights": True,
            "weights/encoder": True,
            "weights/decoder": True,
            "diagnostics": True,
            "diagnostics/performance": True,
            "diagnostics/performance/throughput": True,
            "diagnostics/performance/memory": True,
        },
    )

    print(f"Created default profile with {len(run_ids)} run colors")
    print(f"  Run colors: {run_colors}")


# ==============================================================================
# Sample Training Script (written to text plugin)
# ==============================================================================

SAMPLE_SCRIPT = '''\
#!/usr/bin/env python3
"""
Sample PyTorch Training Script

This script demonstrates how to use TensorBored's features in a typical
PyTorch training workflow. The data you're viewing in this dashboard was
generated by a script similar to this one.

Run with different configurations:
    python train.py --optimizer=adam --lr=0.001 --batch_size=32
    python train.py --optimizer=sgd --lr=0.0005 --batch_size=8
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from tensorbored.torch import SummaryWriter

from tensorbored.plugins.core import profile_writer, color_sampler


class SimpleNet(nn.Module):
    """A simple CNN for demonstration."""

    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.fc1 = nn.Linear(64 * 8 * 8, 256)
        self.fc2 = nn.Linear(256, 10)
        self.pool = nn.MaxPool2d(2)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = x.view(x.size(0), -1)
        x = self.relu(self.fc1(x))
        return self.fc2(x)


def train(config):
    """Main training loop."""

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SimpleNet().to(device)
    criterion = nn.CrossEntropyLoss()

    if config["optimizer"] == "adam":
        optimizer = optim.Adam(model.parameters(), lr=config["lr"])
    else:
        optimizer = optim.SGD(model.parameters(), lr=config["lr"], momentum=0.9)

    writer = SummaryWriter(log_dir=f"{config['logdir']}/{config['run_name']}")

    for step in range(config["total_steps"]):
        model.train()
        inputs = torch.randn(config["batch_size"], 3, 32, 32).to(device)
        targets = torch.randint(0, 10, (config["batch_size"],)).to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()

        _, predicted = outputs.max(1)
        accuracy = (predicted == targets).float().mean()

        if step % 5 == 0:
            writer.add_scalar("loss/train", loss.item(), step)
            writer.add_scalar("accuracy/train", accuracy.item(), step)

        if step % 50 == 0:
            writer.add_histogram("weights/conv1", model.conv1.weight, step)
            writer.add_histogram("weights/fc1", model.fc1.weight, step)

        if step % 100 == 0:
            print(f"Step {step}: loss={loss.item():.4f}, acc={accuracy.item():.4f}")

    writer.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--optimizer", default="adam", choices=["adam", "sgd"])
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--total_steps", type=int, default=500)
    parser.add_argument("--logdir", default="./logs")
    parser.add_argument("--run_name", default="experiment")
    args = parser.parse_args()

    run_names = ["baseline", "adam_lr1e-3", "adam_lr1e-4", "large_batch", "small_batch"]
    profile_writer.set_default_profile(args.logdir, "Training Dashboard",
        pinned_cards=[profile_writer.pin_scalar("loss/train")],
        run_colors=color_sampler.colors_for_runs(run_names, varied=True),
    )

    train(vars(args))
'''

SAMPLE_TEXT = f"""# Sample Training Script

This is an example PyTorch training script that demonstrates how to use
TensorBored's features. The data in this dashboard was generated by a
script similar to this one.

## Key TensorBored Features Used

1. **`profile_writer`** - Configure the dashboard from your training script
2. **`color_sampler`** - Generate perceptually uniform colors for runs
3. **Pinned cards** - Important metrics always visible at the top
4. **Superimposed cards** - Compare train vs eval on single charts

## Full Script

```python
{SAMPLE_SCRIPT}
```

## Running This Script

```bash
# Install TensorBored
pip install tensorbored

# Run training with different configs
python train.py --optimizer=adam --lr=0.001 --run_name=adam_lr1e-3
python train.py --optimizer=adam --lr=0.0001 --run_name=adam_lr1e-4
python train.py --optimizer=sgd --lr=0.001 --run_name=baseline
python train.py --optimizer=adam --lr=0.004 --batch_size=256 --run_name=large_batch
python train.py --optimizer=sgd --lr=0.0005 --batch_size=8 --run_name=small_batch

# View in TensorBored
tensorbored --logdir=./logs
```
"""


# ==============================================================================
# Main Generation Logic
# ==============================================================================


def main():
    """Generate all demo data."""
    print("=" * 60)
    print("TensorBored Demo Data Generator")
    print("=" * 60)

    # Clean up old logs
    import shutil

    if LOGDIR.exists():
        print(f"Removing old logs at {LOGDIR}")
        shutil.rmtree(LOGDIR)

    LOGDIR.mkdir(parents=True, exist_ok=True)

    # Get run IDs and set up profile
    run_ids = list(EXPERIMENTS.keys())
    setup_default_profile(LOGDIR, run_ids)

    # Generate data for each experiment
    for exp_name, config in EXPERIMENTS.items():
        print(f"\nGenerating data for: {exp_name}")
        print(
            f"  Config: lr={config['lr']}, batch_size={config['batch_size']}, "
            f"optimizer={config['optimizer']}"
        )

        # Create a deterministic seed from experiment name
        seed = int(hashlib.md5(exp_name.encode()).hexdigest()[:8], 16)
        writer = SummaryWriter(log_dir=str(LOGDIR / exp_name))

        for step in range(0, TOTAL_STEPS + 1, LOG_EVERY):
            # Scalars
            train_loss = generate_loss_curve(step, config, seed)
            eval_loss = (
                generate_loss_curve(step, config, seed + 100) * 1.05
            )  # Eval slightly worse
            train_acc = generate_accuracy_curve(step, config, seed)
            eval_acc = generate_accuracy_curve(step, config, seed + 100) * 0.98
            lr = generate_lr_schedule(step, config)

            writer.add_scalar("loss/train", train_loss, step)
            writer.add_scalar("loss/eval", eval_loss, step)
            writer.add_scalar("accuracy/train", train_acc, step)
            writer.add_scalar("accuracy/eval", eval_acc, step)
            writer.add_scalar("learning_rate", lr, step)

            # Additional metrics
            random.seed(seed + step + 2000)
            grad_norm = 1.0 / (1 + step * 0.01) + random.gauss(0, 0.05)
            writer.add_scalar(
                "gradients/global_norm", max(0.01, grad_norm), step
            )

            # Loss components (deeper nesting for loss breakdown)
            random.seed(seed + step + 4000)
            cls_loss = train_loss * (0.7 + random.gauss(0, 0.05))
            reg_loss = train_loss * (0.3 + random.gauss(0, 0.02))
            writer.add_scalar("loss/components/classification", cls_loss, step)
            writer.add_scalar("loss/components/regularization", reg_loss, step)

            # Performance diagnostics (4-level nesting)
            random.seed(seed + step + 5000)
            tokens = 12000 + random.gauss(0, 500) + step * 2
            mem = 2048 + random.gauss(0, 50) + step * 0.5
            writer.add_scalar(
                "diagnostics/performance/throughput/tokens_per_sec",
                tokens,
                step,
            )
            writer.add_scalar(
                "diagnostics/performance/memory/peak_mb", mem, step
            )

            # Histograms (less frequent), nested by architecture block
            if step % 50 == 0:
                for layer in ["conv1", "conv2"]:
                    weights = generate_weight_histogram(step, layer, seed)
                    writer.add_histogram(
                        f"weights/encoder/{layer}", weights, step
                    )
                    grads = generate_gradient_histogram(step, layer, seed)
                    writer.add_histogram(
                        f"gradients/per_layer/encoder/{layer}", grads, step
                    )

                for layer in ["fc1", "fc2"]:
                    weights = generate_weight_histogram(step, layer, seed)
                    writer.add_histogram(
                        f"weights/decoder/{layer}", weights, step
                    )
                    grads = generate_gradient_histogram(step, layer, seed)
                    writer.add_histogram(
                        f"gradients/per_layer/decoder/{layer}", grads, step
                    )

            # Images (less frequent)
            if step % 100 == 0:
                sample = generate_sample_image(step, seed)
                writer.add_image(
                    "samples/generated", sample, step, dataformats="HWC"
                )

                attention = generate_attention_map(step, seed)
                writer.add_image(
                    "attention/layer1", attention, step, dataformats="HWC"
                )

            # Progress
            if step % 100 == 0:
                print(
                    f"    Step {step}/{TOTAL_STEPS}: "
                    f"loss={train_loss:.4f}, acc={train_acc:.4f}"
                )

        # Write a scalar with a per-run description via the native writer.
        # This demonstrates the per-run description tab feature: each run
        # describes the same metric differently based on its configuration.
        run_desc = (
            f"Convergence rate for **{config['optimizer']}** "
            f"(lr={config['lr']}, batch={config['batch_size']}). "
            f"Expected to converge around step {config['converge_step']}."
        )
        native = NativeWriter(str(LOGDIR / exp_name))
        for step in range(0, TOTAL_STEPS + 1, LOG_EVERY * 10):
            random.seed(seed + step + 3000)
            rate = 1.0 / (1 + step * 0.005 / config["loss_scale"])
            rate += random.gauss(0, 0.02)
            native.add_scalar(
                "diagnostics/convergence_rate",
                max(0.01, rate),
                step,
                description=run_desc,
            )
        native.flush()
        native.close()

        # Write sample training script to text plugin (first run only)
        if exp_name == "baseline":
            writer.add_text("training_script/sample_code", SAMPLE_TEXT, 0)

        writer.flush()
        writer.close()

    print("\n" + "=" * 60)
    print("Demo data generation complete!")
    print(f"Logs written to: {LOGDIR}")
    print("\nTo view in TensorBored:")
    print(f"  tensorbored --logdir={LOGDIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
