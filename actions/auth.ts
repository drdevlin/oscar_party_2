'use server'

import { cookies } from 'next/headers';
import { pbkdf2Sync } from 'crypto';
import { pb } from '@/lib/pb.server';
import { iterations, length, digest, split } from '@/lib/crypto';
import { endSession, extractInviteCode, startSession } from '@/lib/jwt';
import { OscarError } from '@/lib/types';

import type { Invite, Player, RequestState } from '@/lib/types';

export const signin = async (playerId: string, state: RequestState, formData: FormData): Promise<RequestState> => {
  const pinGiven = [
    formData.get('pin0') || '',
    formData.get('pin1') || '',
    formData.get('pin2') || '',
    formData.get('pin3') || '',
  ].join('');
  if (pinGiven.length < 4) return [OscarError.PinMissing, null];

  const player = await pb.collection('players').getOne(playerId) as Player;
  const [salt, storedHash] = player.pin?.split(split) || []; 

  const hash = pbkdf2Sync(pinGiven, salt, iterations, length, digest).toString(`hex`);
  if (storedHash !== hash) return [OscarError.PinMismatch, null];
  
  const cookieStore = await cookies();
  startSession(playerId, cookieStore);

  return [null, true];
};

export const signout = async (): Promise<RequestState> => {
  const cookieStore = await cookies();
  endSession(cookieStore);

  return [null, true];
};

export const checkInvitation = async (invite: string): Promise<boolean> => {
  try {
    const [id, code] = invite.split('::');
    if (!id) return false;
    if (!code) return false;

    const stored = await pb.collection('invites').getOne(id) as Invite;
    if (!stored) return false;

    const storedCode = await extractInviteCode(stored.token);
    if (!storedCode) return false;

    return storedCode === code;
  } catch (error) {
    console.error(error);
    return false;
  }
};
