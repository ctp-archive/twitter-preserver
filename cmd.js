#!/usr/bin/env node

import commandLineArgs from 'command-line-args'
import unzip from './src/unzip.js'
import build from './src/build/index.js'
import cleanup from './src/cleanup.js'
import cleanCache from './src/clean-cache.js'
import helpOutput from './src/help.js'

const {
  source,
  output,
  pdf,
  templates,
  dev,
  help,
  include,
  expandUrls,
  clean,
} = commandLineArgs([
  { name: 'source', alias: 's', type: String, defaultOption: true },
  { name: 'output', alias: 'o', type: String, defaultValue: './public' },
  { name: 'pdf', alias: 'p', type: Boolean, defaultValue: false },
  { name: 'dev', alias: 'd', type: Boolean, defaultValue: false },
  {
    name: 'include',
    alias: 'i',
    type: String,
    defaultValue: 'tweets,dms,group-dms,likes',
  },
  { name: 'help', type: Boolean, defaultValue: false },
  { name: 'expandUrls', type: Boolean, defaultValue: true },
  { name: 'clean', type: Boolean, defaultValue: false },
  {
    name: 'templates',
    alias: 't',
    type: String,
    defaultValue: './src/templates',
  },
])

const includedData = include.split(',').map((item) => item.trim().toLowerCase())

;(() => {
  if (clean) {
    cleanCache().then((result) => {
      console.log('Cleaned up URL cache')
    })
    return
  }
  if (help) {
    console.log(helpOutput())
    return
  }
  unzip(source)
    .then((path) =>
      build({
        source: path,
        templates,
        output,
        include: includedData,
        expandUrls,
        pdf,
        dev,
      }),
    )
    .then((path) => {
      if (source.search('.zip') > -1) {
        return cleanup(path)
      }
      return
    })
    .catch((error) => {
      console.log(error)
    })
})()
