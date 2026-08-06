export type SessionStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  client_name: string;
  client_phone: string | null;
  date: string; // ISO date string YYYY-MM-DD
  location: string;
  time: string | null; // null means TBD
  session_type: string;
  price_text: string | null; // free-text override (e.g. "230 + 20")
  price_numeric: number | null;
  notes: string | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export type SessionInsert = Omit<Session, 'id' | 'created_at' | 'updated_at'>;
export type SessionUpdate = Partial<SessionInsert>;

/** Public-facing session (price fields omitted) */
export type PublicSession = Omit<Session, 'price_text' | 'price_numeric' | 'notes'>;

export const STATUS_LABELS: Record<SessionStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<SessionStatus, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};
