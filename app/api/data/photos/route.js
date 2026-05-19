import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveUserId, readUserId } from '@/lib/apiUser';

export async function GET(req) {
  const userId = readUserId(req);
  if (!userId) return NextResponse.json([]);
  const { data, error } = await supabase
    .from('progress_photos')
    .select('id, date, uri')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(20);
  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const { userId, stamp } = resolveUserId(req);
  const { date, uri } = await req.json();
  const { error } = await supabase.from('progress_photos').insert({ user_id: userId, date, uri });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return stamp(NextResponse.json({ ok: true }));
}
