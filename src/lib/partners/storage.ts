//src/lib/partners/storage.ts
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Uploads a banner image to Supabase storage and deletes the old one if it exists.
 * @param supabase - The Supabase client instance
 * @param file - The image file to upload
 * @param storeId - The ID of the store (used for naming the file)
 * @param oldUrl - The existing banner URL to be deleted
 */
export async function uploadStoreBanner(
  supabase: SupabaseClient,
  file: File,
  storeId: string,
  oldUrl?: string
) {
  try {
    // 1. Delete old image if it exists to save storage
    if (oldUrl) {
      const oldPath = oldUrl.split('/').pop() // Extract filename from URL
      if (oldPath) {
        await supabase.storage
          .from('partner-banners')
          .remove([`banners/${oldPath}`])
      }
    }

    // 2. Upload new image
    const fileExt = file.name.split('.').pop()
    const fileName = `${storeId}-${Math.random()}.${fileExt}`
    const filePath = `banners/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('partner-banners')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 3. Get Public URL
    const { data } = supabase.storage
      .from('partner-banners')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error in uploadStoreBanner:', error)
    throw error
  }
}