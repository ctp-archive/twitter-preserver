export default () => `Usage: twitter-archive path/to/archive.zip
twitter-archive --source=path/to/archive.zip

Arguments:

--source
  The source Zip file that was downloaded from Twitter.

--expanded
  Use if the source is actually an already-expanded Twitter zip file.

--output=./public
  Write the results of the archive to this folder (default ./public)

--templates=./src/templates
  Use this directory for Nunjucks template files. Useful if you want to use your own templates to format the output.

--dev
  Run a web server that live updates for easier template development.
  
  `
