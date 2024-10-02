import eventsource from 'eventsource';
import PocketBase from 'pocketbase';

global.EventSource = eventsource;

const pb = new PocketBase('/');

pb.autoCancellation(false);

export { pb };
