// Cross-platform post-build step: copies static assets into the standalone
// output so `.next/standalone/server.js` can serve them (replaces `cp -r`,
// which is unavailable on Windows). Safe to run multiple times.
/* eslint-disable @typescript-eslint/no-require-imports */
const { cpSync, existsSync } = require('node:fs')

const copies = [
  ['.next/static', '.next/standalone/.next/static'],
  ['public', '.next/standalone/public'],
]

for (const [src, dest] of copies) {
  if (!existsSync(src)) {
    console.error(`postbuild: source missing, skipped: ${src}`)
    continue
  }
  cpSync(src, dest, { recursive: true })
  console.log(`postbuild: copied ${src} -> ${dest}`)
}
