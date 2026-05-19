import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { readUserId } from '@/lib/apiUser';
import { DAILY_PROTOCOL } from '@/lib/data';

export async function GET(req) {
  const userId = readUserId(req);
  const days   = new URL(req.url).searchParams.get('days')?.split(',').filter(Boolean) ?? [];

  if (!userId || days.length === 0) return NextResponse.json({ compliance: 0 });

  const total = days.length * DAILY_PROTOCOL.length;
  if (total === 0) return NextResponse.json({ compliance: 0 });

  const { data } = await supabase
    .from('daily_protocol')
    .select('item_id')
    .eq('user_id', userId)
    .eq('completed', true)
    .in('date', days);

  const compliance = (data?.length ?? 0) / total;
  return NextResponse.json({ compliance });
}
