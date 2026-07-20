#!/bin/bash
cd "$(dirname "$0")"
while true; do
  node server.js 2>/dev/null
  sleep 2
done
