import eventsource from 'eventsource';
import PocketBase from 'pocketbase';

global.EventSource = eventsource;

const pb = new PocketBase(process.env.NEXT_PUBLIC_DB_CLIENT_URL || '/');

pb.autoCancellation(false);

export { pb };
