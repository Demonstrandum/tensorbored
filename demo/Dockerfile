# TensorBored Demo - HuggingFace Spaces
#
# Deployed automatically via GitHub Actions with the wheel built from CI.

FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Cache-busting: this file changes with each deployment to force pip reinstall.
# HuggingFace Spaces caches Docker layers aggressively, so without this the old
# wheel would be used even when a new one is uploaded.
COPY --chown=user .build-version /tmp/.build-version
COPY --chown=user *.whl /tmp/
RUN pip install --no-cache-dir --user /tmp/*.whl pillow>=10.0.0

COPY --chown=user generate_demo_data.py /app/
COPY --chown=user start.sh /app/

RUN chmod +x /app/start.sh
RUN python /app/generate_demo_data.py

EXPOSE 7860
CMD ["/app/start.sh"]
