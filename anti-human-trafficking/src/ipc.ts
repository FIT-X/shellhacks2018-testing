const settings = require('../settings.json');
import * as redis from 'redis';
const debug = require('debug')('app:ipc');

const client = redis.createClient({
    host: process.env.REDIS_HOST || settings.redis_host,
    password: process.env.REDIS_PASS || settings.redis_pass
});

client.on('error', (err) => {
    debug('Redis error:', err);
});

client.on('connect', () => {
    debug('connected');
});

client.on('message', (channel, message) => {
    debug('sub channel ' + channel + ': ' + message);
});

client.subscribe('*');



