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
  confirmed: 'مؤكد',
  pending: 'معلّق',
  completed: 'مكتمل',
  cancelled: 'ملغى',
};

export const STATUS_COLORS: Record<SessionStatus, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};
