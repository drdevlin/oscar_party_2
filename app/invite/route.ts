import { headers } from 'next/headers';
import { password, username } from '@/lib/db';
import { createInviteToken } from '@/lib/jwt';
import { pb } from '@/lib/pb.server';

const secret = process.env.INVITE_SECRET;
if (!secret) throw new Error('Invite secret not found.');
 
export async function GET() {
  const headersList = await headers();
  const apikey = headersList.get('apikey');

  if (apikey !== secret) return new Response(null, { status: 401 });

  const [token, code] = await createInviteToken();
  await pb.admins.authWithPassword(username, password);
  const created = await pb.collection('invites').create({ token });
 
  return new Response(`${created.id}-${code}`, { status: 200 });
};
