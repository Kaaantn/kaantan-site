exports.handler = async function () {
  const key = process.env.YOUTUBE_API_KEY;
  let youtube = null;

  if (key) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=qkaantan&key=${key}`
      );
      const data = await res.json();
      const count = data.items && data.items[0] && data.items[0].statistics.subscriberCount;
      if (count) youtube = parseInt(count, 10);
    } catch (e) {
      // stay null on failure, page degrades gracefully
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
    body: JSON.stringify({ youtube }),
  };
};
