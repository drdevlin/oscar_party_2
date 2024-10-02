import eventsource from 'eventsource';
import PocketBase from 'pocketbase';

global.EventSource = eventsource;

const pb = new PocketBase('http://127.0.0.1:8090');

export { pb };
