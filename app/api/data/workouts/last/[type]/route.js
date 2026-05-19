import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { readUserId } from '@/lib/apiUser';

export async function GET(req, { params }) {
  const userId = readUserId(req);
  if (!userId) return NextResponse.json(null);

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('type', params.type)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json(null, { status: 500 });
  return NextResponse.json(data);
}
