# TensorBored Demo - HuggingFace Spaces
#
# This Dockerfile creates a demo instance of TensorBored with pre-generated
# training data showcasing all the new features.
#
# For HuggingFace Spaces, this is deployed automatically via GitHub Actions.

FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user (required by HuggingFace Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Install Python dependencies
RUN pip install --no-cache-dir --user \
    tensorboard>=2.15.0 \
    numpy>=1.24.0 \
    pillow>=10.0.0 \
    protobuf>=3.20.0

# Create tensorbored alias
RUN ln -s /home/user/.local/bin/tensorboard /home/user/.local/bin/tensorbored

# Copy TensorBored custom modules (profile_writer, color_sampler)
# These are copied by the GitHub Actions workflow
COPY --chown=user tensorboard_plugins_core/ /home/user/.local/lib/python3.11/site-packages/tensorboard/plugins/core/

# Copy demo files
COPY --chown=user generate_demo_data.py /app/generate_demo_data.py
COPY --chown=user start.sh /app/start.sh

# Make startup script executable
RUN chmod +x /app/start.sh

# Generate demo data at build time
RUN python /app/generate_demo_data.py

# HuggingFace Spaces uses port 7860
EXPOSE 7860

# Start TensorBored
CMD ["/app/start.sh"]
