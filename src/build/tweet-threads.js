export default (tweets, author) => {
  tweets.forEach((tweet, index) => {
    tweets[index].tweet._threads = []
    tweets[index].tweet._parent_thread = false
  })

  tweets.forEach((tweet, index) => {
    if (
      tweet.tweet.in_reply_to_user_id_str &&
      tweet.tweet.in_reply_to_user_id_str === author
    ) {
      let parentThread = tweets.findIndex(
        (parentTweet) =>
          parentTweet.tweet.id === tweet.tweet.in_reply_to_status_id,
      )
      if (parentThread < 0 || !tweets[parentThread]) {
        return
      }
      const findParent = () => {
        if (
          tweets[parentThread] &&
          tweets[parentThread].tweet.in_reply_to_user_id_str &&
          tweets[parentThread].tweet.in_reply_to_user_id_str === author
        ) {
          const newParent = tweets.findIndex(
            (parentTweet) =>
              parentTweet.tweet.id ===
              tweets[parentThread].tweet.in_reply_to_status_id,
          )
          if (newParent < 0) {
            return
          }
          parentThread = newParent
          findParent()
        }
      }
      findParent()
      tweets[index].tweet._parent_thread = tweets[parentThread].tweet.id
      tweets[parentThread].tweet._threads.push(tweet.tweet.id)
    }
  })
}
