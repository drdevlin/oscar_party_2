'use server'

import { revalidateTag } from 'next/cache';
import { pb } from '@/lib/pb.server';

import type { SelectionRecord } from '@/lib/types';

const username = process.env.DB_USERNAME!;
const password = process.env.DB_PASSWORD!;

export const upsertSelection = async (selection: Partial<SelectionRecord>) => {
  await pb.admins.authWithPassword(username, password);
  if (selection.id) {
    await pb.collection('selections').update(selection.id, selection);
    revalidateTag('selections');
    return;
  }
  await pb.collection('selections').create(selection);
  revalidateTag('selections');
};
