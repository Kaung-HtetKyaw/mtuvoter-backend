const Pusher = require("pusher");

class Realtime extends Pusher {
  constructor({ appId, key, secret, cluster, encrypted }) {
    super({ appId, key, secret, cluster, encrypted });
  }
}

const {
  PUSHER_APP_ID: appId,
  PUSHER_KEY: key,
  PUSHER_SECRET: secret,
  PUSHER_CLUSTER: cluster,
} = process.env;

const realtime = new Realtime({ appId, key, secret, cluster });
module.exports = realtime;
