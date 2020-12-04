const pusher = new Pusher("c5de6c0eb0b859f7aaf9", {
  cluster: "ap1",
});
console.log("ok");
const channel = pusher.subscribe("my-channel");
channel.bind("my-event", function (data) {
  alert("An Event is triggered" + data.message);
});
