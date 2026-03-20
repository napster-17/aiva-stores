// src/lib/storage/uploadImage.ts
import { createClient } from "../supabase/client"

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (error) {
    console.error('Image upload error:', error.message)
    return null
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}
