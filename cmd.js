#!/usr/bin/env node

import commandLineArgs from 'command-line-args'
import unzip from './src/unzip.js'
import build from './src/build/index.js'
import cleanup from './src/cleanup.js'
import serve from './src/serve.js'
import helpOutput from './src/help.js'

const { source, expanded, output, templates, dev, help } = commandLineArgs([
  { name: 'source', alias: 's', type: String, defaultOption: true },
  { name: 'output', alias: 'o', type: String, defaultValue: './public' },
  { name: 'expanded', alias: 'e', type: Boolean, defaultValue: false },
  { name: 'dev', alias: 'd', type: Boolean, defaultValue: false },
  { name: 'help', type: Boolean, defaultValue: false },
  {
    name: 'templates',
    alias: 't',
    type: String,
    defaultValue: './src/templates',
  },
])

if (help) {
  console.log(helpOutput())
} else {
  unzip(source, expanded)
    .then((path) => {
      if (dev) {
        return serve(path, templates, output)
      }
      return build(path, templates, output)
    })
    .then((path) => {
      if (!expanded) {
        return cleanup(path)
      }
      return
    })
}
