#!/bin/bash 

rm -rf ./docs-tmp
mkdir docs-tmp
node scripts/readme.js
cp README.md ./docs-tmp 
twitter-preserver ./test/sample.zip --output=./docs-tmp/demo --pdf
gh-pages -d docs-tmp