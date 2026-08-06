import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { SessionInsert } from '@/types/session';
import { formatPhone } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { rows }: { rows: Partial<SessionInsert>[] } = await request.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
    }

    // Validate and clean each row
    const valid: SessionInsert[] = [];
    let errors = 0;

    for (const row of rows) {
      if (!row.client_name || !row.date) {
        errors++;
        continue;
      }
      valid.push({
        client_name: row.client_name,
        client_phone: formatPhone(row.client_phone),
        date: row.date,
        location: row.location ?? '',
        time: row.time ?? null,
        session_type: row.session_type ?? 'جلسة تصوير',
        price_text: row.price_text ?? null,
        price_numeric: row.price_numeric ?? null,
        notes: row.notes ?? null,
        status: row.status ?? 'confirmed',
      });
    }

    if (valid.length === 0) {
      return NextResponse.json({ error: 'No valid rows to import', inserted: 0, errors }, { status: 422 });
    }

    // Batch insert in chunks of 50
    const CHUNK = 50;
    let inserted = 0;
    for (let i = 0; i < valid.length; i += CHUNK) {
      const chunk = valid.slice(i, i + CHUNK);
      const { error, count } = await supabase.from('sessions').insert(chunk);
      if (error) {
        errors += chunk.length;
      } else {
        inserted += chunk.length;
      }
    }

    return NextResponse.json({ inserted, errors }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/admin/import]', err);
    return NextResponse.json({ error: 'Internal error', inserted: 0, errors: 0 }, { status: 500 });
  }
}
