#!/bin/bash
# setup-certs.sh
# Run from Git Bash in the project root folder:
#   bash scripts/setup-certs.sh

echo ""
echo "TaskManager - TLS Certificate Setup"
echo "-------------------------------------"

if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: Run this from the project root (where docker-compose.yml is)"
    echo "  cd /c/Users/Alex/Desktop/TaskManager"
    echo "  bash scripts/setup-certs.sh"
    exit 1
fi

mkdir -p ./certs

if ! command -v openssl &> /dev/null; then
    echo "ERROR: openssl not found. Run this from Git Bash."
    exit 1
fi

echo "Using: $(openssl version)"
echo "Generating self-signed certificate..."

# MSYS_NO_PATHCONV=1 prevents Git Bash from converting /CN= into a Windows path
MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes \
    -keyout ./certs/key.pem \
    -out    ./certs/cert.pem \
    -subj   "/CN=localhost/O=TaskManager/C=RO" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

if [ $? -eq 0 ]; then
    echo ""
    echo "Done! Certificates created:"
    echo "  ./certs/cert.pem"
    echo "  ./certs/key.pem"
    echo ""
    echo "Next step: docker compose up -d"
else
    echo "ERROR: Certificate generation failed."
    exit 1
fi
