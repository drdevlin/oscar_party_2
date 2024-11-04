'use server'

import { revalidateTag } from 'next/cache';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { pb } from '@/lib/pb.server';
import { OscarError } from '@/lib/types';
import { startSession } from '@/lib/jwt';
import { iterations, length, digest, split } from '@/lib/crypto';
import { username, password } from '@/lib/db';

import type { Player, RequestState } from '@/lib/types';
import { cookies } from 'next/headers';

export const createPlayer = async (state: RequestState, formData: FormData): Promise<RequestState> => {
  const avatar = formData.get('avatar');
  if (!avatar || avatar instanceof File) return [OscarError.AvatarMissing, null];

  const name = formData.get('name');
  if (!name || name instanceof File) return [OscarError.NameMissing, null];

  const pinGiven = [
    formData.get('pin0') || '',
    formData.get('pin1') || '',
    formData.get('pin2') || '',
    formData.get('pin3') || '',
  ].join('');
  if (pinGiven.length < 4) return [OscarError.PinMissing, null];

  const confirm = [
    formData.get('confirm0') || '',
    formData.get('confirm1') || '',
    formData.get('confirm2') || '',
    formData.get('confirm3') || '',
  ].join('');
  if (confirm.length < 4) return [OscarError.ConfirmationMissing, null];
  if (pinGiven !== confirm) return [OscarError.PinMismatch, null];

  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(pinGiven, salt, iterations, length, digest).toString(`hex`);
  const pin = salt + split + hash;

  const player: Omit<Player, 'id'> = {
    avatar,
    name,
    pin,
  };

  await pb.admins.authWithPassword(username, password);
  const created = await pb.collection('players').create(player);
  
  const cookieStore = await cookies();
  startSession(created.id, cookieStore);

  revalidateTag('players');
  return [null, true];
};


