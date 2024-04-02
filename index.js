const fs = require("fs").promises;

const NB_TOKEN = "2GgDWI2CKE6POtjawGH-5TvNgE0iJccCKmHsOxt6UW4";

const fetchPosts = async (url) => {
  const response = await fetch(url);
  return response;
};

const filterPostsByDate = (posts) => {
  const june2020Timestamp = new Date("2020-06-01").getTime();

  return posts
    .filter((p) => p.published_at)
    .filter((post) => {
      const postCreatedAt = new Date(post.published_at).getTime();
      return postCreatedAt < june2020Timestamp;
    });
};

const processAllPosts = async (url) => {
  const allPosts = [];
  let total = 0;
  let nextUrl = true;

  do {
    const postsData = await fetchPosts(url);
    const data = await postsData.json();
    const results = data.results;
    allPosts.push(...results);

    let nextUrl = data.next || false;
    total += data.results.length;

    if (nextUrl) {
      url = `https://tectonica.nationbuilder.com/${nextUrl}&access_token=${NB_TOKEN}`;
    } else {
      break;
    }
  } while (nextUrl);

  const past2020juneEvents = filterPostsByDate(allPosts);
  await fs.writeFile(
    "past-events.json",
    JSON.stringify(past2020juneEvents, null, 2)
  );

  console.log("total elements: ", total);
  console.log("Past events: ", past2020juneEvents.length);
};

(async () => {
  const initialUrl = `https://tectonica.nationbuilder.com/api/v1/sites/tecto2020/pages/blogs/1078/posts?access_token=${NB_TOKEN}`;
  await processAllPosts(initialUrl);
})();
