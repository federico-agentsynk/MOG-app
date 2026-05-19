import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveUserId, readUserId } from '@/lib/apiUser';

async function getWeekState(userId, weekKey) {
  const { data } = await supabase
    .from('weekly_habits')
    .select('day_key, habit_id, completed')
    .eq('user_id', userId)
    .eq('week_key', weekKey);

  const state = {};
  for (const row of data ?? []) {
    if (!row.completed) continue;
    if (!state[row.day_key]) state[row.day_key] = {};
    state[row.day_key][row.habit_id] = true;
  }
  return state;
}

export async function GET(req) {
  const userId  = readUserId(req);
  const weekKey = new URL(req.url).searchParams.get('week');
  if (!userId || !weekKey) return NextResponse.json({});
  return NextResponse.json(await getWeekState(userId, weekKey));
}

export async function POST(req) {
  const { userId, stamp } = resolveUserId(req);
  const { weekKey, dayKey, habitId } = await req.json();

  const current   = await getWeekState(userId, weekKey);
  const nowDone   = !current[dayKey]?.[habitId];

  const { error } = await supabase.from('weekly_habits').upsert(
    { user_id: userId, week_key: weekKey, day_key: dayKey, habit_id: habitId, completed: nowDone },
    { onConflict: 'user_id,week_key,day_key,habit_id' },
  );

  if (error) return stamp(NextResponse.json({ error: error.message }, { status: 500 }));

  const newState = JSON.parse(JSON.stringify(current));
  if (nowDone) {
    if (!newState[dayKey]) newState[dayKey] = {};
    newState[dayKey][habitId] = true;
  } else {
    delete newState[dayKey]?.[habitId];
  }
  return stamp(NextResponse.json(newState));
}
