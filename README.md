[![Unit tests](https://github.com/ctp-archive/twitter-preserver/actions/workflows/test.yml/badge.svg)](https://github.com/ctp-archive/twitter-preserver/actions/workflows/test.yml)

# Twitter preserver

An open-source project funded by the Alfred P. Sloan Foundation as part of the preservation of [The COVID Tracking Project](https://covidtracking.com).

When you download an archive of your user data from Twitter, the ZIP file you are provided is fine for personal use, but not useful for long-term preservation (over 50 years) in an archive. For example:

- The iconography and design of the interface assumes the user is familiar with Twitter, which may not exist or be drastically different.
- Some content like DMs might not be appropriate for preservation.
- Javascript or browser security rules might change in the future, breaking the way the archive includes content.
- The actual HTML files are not easily parseable by future researchers.
- Printing the archive pages to a stable format (acid-free paper) is not pretty.

This project converts a downloaded ZIP file from Twitter into a collection of simple HTML files made to be either hosted online, or opened locally. It also converts the data into a Markdown and PDF.

**[View a demonstration of a preserved Twitter account](https://ctp-archive.github.io/twitter-preserver/demo)**

## Usage

`npx twitter-archiver [commands]`



```help
Usage: twitter-preserver path/to/archive.zip
twitter-preserver --source=path/to/archive.zip

Arguments:

--source
  The source Zip file that was downloaded from Twitter.

--expanded
  Use if the source is actually an already-expanded Twitter zip file.

--expandUrls
  Enabled by default. Will replace all "t.co" URLs in Tweet text with
  the actual URL the link was pointing to.

--clean
  Remove cache for URLs.

--output=./public
  Write the results of the archive to this folder (default ./public)

--include=tweets,dms,likes
  Comma-separated list of what data to include in the export.
  Possible values are: tweets, dms, likes, group-dms

--templates=./src/templates
  Use this directory for Nunjucks template files.
  Useful if you want to use your own templates to format the output.

--dev
  Run a web server that live updates for easier template development.
  
  
```

## Using your own templates

```

```
