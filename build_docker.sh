# build_docker.sh
#!/bin/bash
IMAGE_TAG="${1:-myproject_app}"
ARCH="${2:-}"

PLATFORM_FLAG=""
if [ -n "$ARCH" ]; then
    PLATFORM_FLAG="--platform=$ARCH"
fi

docker build $PLATFORM_FLAG -t "$IMAGE_TAG" .