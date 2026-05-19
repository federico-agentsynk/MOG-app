import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveUserId, readUserId } from '@/lib/apiUser';

export async function GET(req) {
  const userId = readUserId(req);
  if (!userId) return NextResponse.json([]);

  const { data, error } = await supabase
    .from('weight_log')
    .select('date, weight')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const { userId, stamp } = resolveUserId(req);
  const { date, weight } = await req.json();

  const { error } = await supabase
    .from('weight_log')
    .upsert({ user_id: userId, date, weight }, { onConflict: 'user_id,date' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return stamp(NextResponse.json({ ok: true }));
}
