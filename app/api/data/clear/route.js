import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { readUserId } from '@/lib/apiUser';

export async function DELETE(req) {
  const userId = readUserId(req);
  if (!userId) return NextResponse.json({ ok: true });
  await Promise.all([
    supabase.from('workouts').delete().eq('user_id', userId),
    supabase.from('weight_log').delete().eq('user_id', userId),
    supabase.from('body_metrics').delete().eq('user_id', userId),
    supabase.from('daily_protocol').delete().eq('user_id', userId),
    supabase.from('weekly_habits').delete().eq('user_id', userId),
    supabase.from('user_settings').delete().eq('user_id', userId),
    supabase.from('progress_photos').delete().eq('user_id', userId),
  ]);
  return NextResponse.json({ ok: true });
}
