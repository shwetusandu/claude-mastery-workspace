#!/bin/bash
# Builds the app and writes: the Claude artifact page and the hosted server's page.
set -e
cd "$(dirname "$0")"
pnpm exec vite build >/dev/null 2>&1
python3 - <<'PY'
import glob
js=open(glob.glob('dist/assets/*.js')[0]).read().replace('</script','<\\/script')
css=open(glob.glob('dist/assets/*.css')[0]).read()
frag='<title>Claude Mastery Workspace</title>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">\n<style>'+css+'</style>\n<div id="root"></div>\n<script type="module">'+js+'</script>\n'
open('../claude-mastery-artifact.html','w').write(frag)
head='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>\n'
open('../public/index.html','w').write(head+'<script>window.__HOSTED__=true</script>\n'+frag+'</body></html>')
open('/tmp/preview.html','w').write(head+frag+'</body></html>')
print('built', len(frag))
PY
