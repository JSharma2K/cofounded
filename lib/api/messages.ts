import { supabase } from '../supabase';
import type { Message } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export async function getMessages(matchId: number): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(matchId: number, senderId: string, body: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      body,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToMessages(
  matchId: number,
  onMessage: (message: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`room-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
}

