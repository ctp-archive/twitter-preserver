const twitterUrlRegex =
  /http(s?):\/\/t.co\/([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g

export default (tweets, links) => {
  tweets.forEach(({ tweet }, index) => {
    const matches = tweet.full_text.match(twitterUrlRegex)

    if (matches && matches.length) {
      const last = matches.pop()
      const link = links.find((link) => link.url === last)
      if (link && link.meta) {
        tweets[index].tweet._social_card = link
      }
    }
  })
}
