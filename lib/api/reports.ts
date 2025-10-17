import { supabase } from '../supabase';
import type { ReportForm } from '../../utils/schemas';

export async function submitReport(
  reporterId: string,
  targetId: string,
  data: ReportForm
) {
  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    target_id: targetId,
    reason: data.reason,
    details: data.details,
  });

  if (error) throw error;
}

