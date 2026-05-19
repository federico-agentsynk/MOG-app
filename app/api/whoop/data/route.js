import { NextResponse } from 'next/server';
import { fetchRecovery, fetchSleep } from '@/lib/whoop';

export async function GET(request) {
  const userId = request.cookies.get('mog_user_id')?.value;
  if (!userId) {
    return NextResponse.json({ connected: false });
  }

  try {
    const [rec, sleep] = await Promise.all([
      fetchRecovery(userId),
      fetchSleep(userId),
    ]);

    const recovery = rec?.score_state === 'SCORED'
      ? {
          score: Math.round(rec.score.recovery_score),
          hrv:   Math.round(rec.score.hrv_rmssd_milli),
          rhr:   Math.round(rec.score.resting_heart_rate),
        }
      : null;

    const sleepData = sleep?.score_state === 'SCORED'
      ? {
          deepSleep:   sleep.score.stage_summary.total_slow_wave_sleep_time_milli,
          remSleep:    sleep.score.stage_summary.total_rem_sleep_time_milli,
          totalInBed:  sleep.score.stage_summary.total_in_bed_time_milli,
          performance: Math.round(sleep.score.sleep_performance_percentage),
          efficiency:  Math.round(sleep.score.sleep_efficiency_percentage),
        }
      : null;

    return NextResponse.json({ connected: true, recovery, sleep: sleepData });
  } catch (err) {
    // If the error is "not connected" the token row doesn't exist
    if (err.message.includes('not connected')) {
      return NextResponse.json({ connected: false });
    }
    // Token exists but data fetch failed — still show as connected
    console.error('[WHOOP data]', err.message);
    return NextResponse.json({ connected: true, error: 'Data temporarily unavailable' });
  }
}
