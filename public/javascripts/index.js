const pusher = new Pusher("c5de6c0eb0b859f7aaf9", {
  cluster: "ap1",
});
console.log("ok");
const channel = pusher.subscribe("vote-result");
channel.bind("new-vote", async function (data) {
  const { election, position, candidate } = data;
  console.log("Someone voted");
  const result = await fetch(
    `/api/v1/ballots/elections/${election}/positions/${position}`
  )
    .then((res) => res.json())
    .then((data) => console.log(data));
});
