//src/lib/partners/agent-utils.ts
import { createClient } from '@/lib/supabase/client';

export interface Agent {
  id: string;
  full_name: string;
  username: string;
  phone_number: string | null;
  is_active: boolean;
  is_free_slot: boolean;
  created_at: string;
}

export async function fetchAgents(storeId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('delivery_agents')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Agent[];
}

// Logic to call your Edge Functions
export async function createAgent(agentData: any) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke('create-agent', {
    body: agentData,
  });
  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data;
}

export async function updateAgent(agentData: any) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke('update-agent', {
    body: agentData,
  });
  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data;
}

export async function deleteAgent(agentId: string, storeId: string) {
    const supabase = createClient() as any;
    // Changed from .update({ is_active: false }) to .delete() for a hard delete
    const { error } = await supabase
        .from('delivery_agents')
        .delete()
        .eq('id', agentId)
        .eq('store_id', storeId);
    
    if (error) throw error;
}

export async function checkUsernameAvailability(username: string) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke('check-username', {
    body: { username },
  });
  if (error) throw error;
  // The edge function returns { isAvailable: boolean, reason: string }
  return data.isAvailable; 
}