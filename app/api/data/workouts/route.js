import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveUserId, readUserId } from '@/lib/apiUser';

export async function GET(req) {
  const userId = readUserId(req);
  if (!userId) return NextResponse.json([]);

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const { userId, stamp } = resolveUserId(req);
  const body = await req.json();

  const { error } = await supabase.from('workouts').insert({
    id:        body.id,
    user_id:   userId,
    type:      body.type,
    date:      body.date,
    exercises: body.exercises,
    prs:       body.prs ?? 0,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return stamp(NextResponse.json({ ok: true }));
}
