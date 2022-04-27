import includes from './includes.js'

export default () => `Usage: twitter-preserver path/to/archive.zip
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

--pdf
  Write output to PDF files. Will appear as a \`./pdf\` directory within the output directory

--include=tweets,dms,likes
  Comma-separated list of what data to include in the export.
  Possible values are: ${includes.join(', ')}

--templates=./src/templates
  Use this directory for Nunjucks template files.
  Useful if you want to use your own templates to format the output.

--dev
  Run a web server that live updates for easier template development.
  
  `
