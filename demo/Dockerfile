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

# Install base Python dependencies (excluding tensorboard - we use our wheel)
RUN pip install --no-cache-dir --user \
    numpy>=1.24.0 \
    pillow>=10.0.0 \
    protobuf>=3.20.0

# Copy and install TensorBored wheel (built by CI)
COPY --chown=user wheel/*.whl /tmp/
RUN pip install --no-cache-dir --user /tmp/*.whl && rm /tmp/*.whl

# Copy TensorBored custom modules (profile_writer, color_sampler)
# These override the packaged versions to ensure we have the latest
# Note: Find the actual site-packages path dynamically at runtime if needed
COPY --chown=user tensorbored_plugins_core/ /tmp/tensorbored_plugins_core/
RUN SITE_PACKAGES=$(python -c "import site; print(site.getusersitepackages())") && \
    mkdir -p "$SITE_PACKAGES/tensorbored/plugins/core" && \
    cp -r /tmp/tensorbored_plugins_core/* "$SITE_PACKAGES/tensorbored/plugins/core/" && \
    rm -rf /tmp/tensorbored_plugins_core

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
