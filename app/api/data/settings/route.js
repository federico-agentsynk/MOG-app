import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveUserId, readUserId } from '@/lib/apiUser';

const DEFAULTS = {
  currentWeight:   147,
  targetWeight:    165,
  goalDate:        '2026-10-10',
  morningTime:     '08:00',
  checkinTime:     '20:00',
  nighttimeTime:   '22:00',
  notifyMorning:   false,
  notifyCheckin:   false,
  notifyNighttime: false,
  notifyWorkout:   false,
  notifyWeighIn:   false,
};

const toClient = (row) => ({
  currentWeight:   row.current_weight   ?? DEFAULTS.currentWeight,
  targetWeight:    row.target_weight    ?? DEFAULTS.targetWeight,
  goalDate:        row.goal_date        ?? DEFAULTS.goalDate,
  morningTime:     row.morning_time     ?? DEFAULTS.morningTime,
  checkinTime:     row.checkin_time     ?? DEFAULTS.checkinTime,
  nighttimeTime:   row.nighttime_time   ?? DEFAULTS.nighttimeTime,
  notifyMorning:   row.notify_morning   ?? DEFAULTS.notifyMorning,
  notifyCheckin:   row.notify_checkin   ?? DEFAULTS.notifyCheckin,
  notifyNighttime: row.notify_nighttime ?? DEFAULTS.notifyNighttime,
  notifyWorkout:   row.notify_workout   ?? DEFAULTS.notifyWorkout,
  notifyWeighIn:   row.notify_weigh_in  ?? DEFAULTS.notifyWeighIn,
});

export async function GET(req) {
  const userId = readUserId(req);
  if (!userId) return NextResponse.json(DEFAULTS);
  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return NextResponse.json(data ? toClient(data) : DEFAULTS);
}

export async function POST(req) {
  const { userId, stamp } = resolveUserId(req);
  const s = await req.json();
  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id:          userId,
      current_weight:   s.currentWeight,
      target_weight:    s.targetWeight,
      goal_date:        s.goalDate,
      morning_time:     s.morningTime,
      checkin_time:     s.checkinTime,
      nighttime_time:   s.nighttimeTime,
      notify_morning:   s.notifyMorning,
      notify_checkin:   s.notifyCheckin,
      notify_nighttime: s.notifyNighttime,
      notify_workout:   s.notifyWorkout,
      notify_weigh_in:  s.notifyWeighIn,
      updated_at:       new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return stamp(NextResponse.json({ ok: true }));
}
