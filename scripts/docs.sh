#!/bin/bash 

rm -rf /tmp/twitter-preserver-docs
mkdir /tmp/twitter-preserver-docs
node scripts/readme.js
cp README.md /tmp/twitter-preserver-docs 
twitter-preserver ./test/sample.zip --output=/tmp/twitter-preserver-docs/demo --pdf
gh-pages -d /tmp/twitter-preserver-docs