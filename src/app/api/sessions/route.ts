import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('sessions')
      .select('id, client_name, client_phone, date, location, time, session_type, status')
      .neq('status', 'cancelled')
      .order('date', { ascending: true });

    if (error) {
      console.error('[GET /api/sessions]', error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[GET /api/sessions] unexpected error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
