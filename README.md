# Twitter preserver

An open-source project funded by the Alfred P. Sloan Foundation as part of the preservation of [The COVID Tracking Project](https://covidtracking.com).

When you download an archive of your user data from Twitter, the ZIP file you are provided is fine for personal use, but not useful for long-term preservation (over 50 years) in an archive. For example:

- The iconography and design of the interface assumes the user is familiar with Twitter, which may not exist or be drastically different.
- Some content like DMs might not be appropriate for preservation.
- Javascript or browser security rules might change in the future, breaking the way the archive includes content.
- The actual HTML files are not easily parseable by future researchers.
- Printing the archive pages to a stable format (acid-free paper) is not pretty.

This project converts a downloaded ZIP file from Twitter into a collection of simple HTML files made to be either hosted online, or opened locally. It also converts the data into a Markdown and PDF.
