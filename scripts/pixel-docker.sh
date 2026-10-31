#!/usr/bin/env bash
# Runs the Linux pixel test in the pinned Playwright image (spec 13.1).
# Works on a copy inside the container so the host node_modules is never touched.
# Failure artifacts (actual / expected / diff PNGs) are copied back to ./test-results-linux.
set -euo pipefail

docker run --rm -v "$PWD":/host -w /host mcr.microsoft.com/playwright:v1.63.0-jammy bash -c '
  set -e
  mkdir -p /tmp/app
  tar --exclude=node_modules --exclude=dist --exclude=test-results -cf - . | tar -xf - -C /tmp/app
  cd /tmp/app
  npm ci --no-audit --no-fund
  rc=0
  npx playwright test pixel || rc=$?
  rm -rf /host/test-results-linux
  [ -d test-results ] && cp -r test-results /host/test-results-linux
  exit $rc
'
