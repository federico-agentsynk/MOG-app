import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveUserId, readUserId } from '@/lib/apiUser';

const toClient = (row) => ({
  date:       row.date,
  neck:       row.neck,
  chest:      row.chest,
  armsFlexed: row.arms_flexed,
  shoulders:  row.shoulders,
  waist:      row.waist,
});

export async function GET(req) {
  const userId = readUserId(req);
  if (!userId) return NextResponse.json([]);

  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data.map(toClient));
}

export async function POST(req) {
  const { userId, stamp } = resolveUserId(req);
  const body = await req.json();

  const { error } = await supabase.from('body_metrics').upsert(
    {
      user_id:     userId,
      date:        body.date,
      neck:        body.neck       || null,
      chest:       body.chest      || null,
      arms_flexed: body.armsFlexed || null,
      shoulders:   body.shoulders  || null,
      waist:       body.waist      || null,
    },
    { onConflict: 'user_id,date' },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return stamp(NextResponse.json({ ok: true }));
}
