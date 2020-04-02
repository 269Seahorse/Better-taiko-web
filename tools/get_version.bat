@echo off
(
git log -1 --pretty="format:{\"commit\": \"%%H\", \"commit_short\": \"%%h\", \"version\": \"%%ad\"}" --date="format:%%y.%%m.%%d"
) > ../version.json
