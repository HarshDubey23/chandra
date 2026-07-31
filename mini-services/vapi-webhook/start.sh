#!/usr/bin/env bash
# Daemon launcher for chandra-vapi-webhook
set -e
cd /home/z/my-project/mini-services/vapi-webhook
export DATABASE_URL='file:/home/z/my-project/db/custom.db'
export VAPI_SECRET='dev-secret'

# Double-fork: parent forks child, child setsids and forks grandchild, grandchild execs bun
# Using setsid + & in a subshell achieves detachment
(
  setsid bash -c '
    exec bun --hot index.ts
  ' </dev/null >>service.log 2>&1 &
  echo $! > service.pid
) 
