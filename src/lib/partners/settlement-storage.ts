//src/lib/partners/settlement-storage.ts
import { SupabaseClient } from '@supabase/supabase-js'

export async function uploadSettlementProof(
  supabase: SupabaseClient,
  file: File,
  storeId: string
) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${storeId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('settlement-screenshots')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('settlement-screenshots')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error in uploadSettlementProof:', error)
    throw error
  }
}