import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveUserId, readUserId } from '@/lib/apiUser';

async function getDayState(userId, date) {
  const { data } = await supabase
    .from('daily_protocol')
    .select('item_id, completed')
    .eq('user_id', userId)
    .eq('date', date);
  const state = {};
  for (const row of data ?? []) {
    if (row.completed) state[row.item_id] = true;
  }
  return state;
}

export async function GET(req) {
  const userId = readUserId(req);
  const date   = new URL(req.url).searchParams.get('date');
  if (!userId || !date) return NextResponse.json({});
  return NextResponse.json(await getDayState(userId, date));
}

export async function POST(req) {
  const { userId, stamp } = resolveUserId(req);
  const { date, itemId }  = await req.json();

  const current = await getDayState(userId, date);
  const nowDone = !current[itemId];

  const { error } = await supabase.from('daily_protocol').upsert(
    { user_id: userId, date, item_id: itemId, completed: nowDone },
    { onConflict: 'user_id,date,item_id' },
  );

  if (error) return stamp(NextResponse.json({ error: error.message }, { status: 500 }));

  const newState = { ...current, [itemId]: nowDone || undefined };
  if (!nowDone) delete newState[itemId];
  return stamp(NextResponse.json(newState));
}
