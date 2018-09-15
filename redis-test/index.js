const settings = require('./settings.json');
const redis = require("redis");
const client = redis.createClient({
        host: settings.redis_host,
        password: settings.redis_pass
    });

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", (err) => {
    console.log("Error " + err);
});

client.on("connect", () => {
    console.log("connected");
});

