import { createClient } from '@supabase/supabase-js';
import type { AuditRecord, EmailRecord, ToolAuditResult } from './types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side singleton — never expose to the browser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: ReturnType<typeof createClient<any>> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): ReturnType<typeof createClient<any>> {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

// ─── Audit helpers ────────────────────────────────────────────────────────────

export interface InsertAuditPayload {
  id: string;
  tool_results: ToolAuditResult[];
  total_spend: number;
  total_optimized_spend: number;
  total_savings: number;
  summary: string;
}

/**
 * Inserts a new audit record into the `audits` table.
 * Returns the inserted record or throws on error.
 */
export async function insertAudit(record: InsertAuditPayload): Promise<AuditRecord> {
  const client = getClient();
  const { data, error } = await client
    .from('audits')
    .insert(record)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insertAudit failed: ${error.message}`);
  }
  return data as AuditRecord;
}

/**
 * Updates the `summary` field of an existing audit record.
 */
export async function updateAuditSummary(id: string, summary: string): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from('audits')
    .update({ summary })
    .eq('id', id);

  if (error) {
    throw new Error(`Supabase updateAuditSummary failed: ${error.message}`);
  }
}

/**
 * Fetches a single audit record by its UUID.
 * Returns null if not found.
 */
export async function getAuditById(id: string): Promise<AuditRecord | null> {
  const client = getClient();
  const { data, error } = await client
    .from('audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // row not found
    throw new Error(`Supabase getAuditById failed: ${error.message}`);
  }
  return data as AuditRecord;
}

// ─── Email helpers ────────────────────────────────────────────────────────────

/**
 * Inserts a new email record into the `audit_emails` table.
 */
export async function insertAuditEmail(auditId: string, email: string): Promise<EmailRecord> {
  const client = getClient();
  const { data, error } = await client
    .from('audit_emails')
    .insert({ id: crypto.randomUUID(), audit_id: auditId, email })
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insertAuditEmail failed: ${error.message}`);
  }
  return data as EmailRecord;
}

/**
 * Checks whether an email has already been sent for a given audit.
 * Returns true if a duplicate exists.
 */
export async function checkDuplicateEmail(auditId: string, email: string): Promise<boolean> {
  const client = getClient();
  const { data, error } = await client
    .from('audit_emails')
    .select('id')
    .eq('audit_id', auditId)
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase checkDuplicateEmail failed: ${error.message}`);
  }
  return data !== null;
}
