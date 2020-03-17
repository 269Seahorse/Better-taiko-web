#!/bin/bash
toplevel=$( git rev-parse --show-toplevel )
git log -1 --pretty="format:{\"commit\": \"%H\", \"commit_short\": \"%h\", \"version\": \"%ad\"}" --date="format:%y.%m.%d" > "$toplevel/version.json"
