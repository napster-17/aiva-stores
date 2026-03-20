//src/lib/partners/product-upload.ts
import { SupabaseClient } from '@supabase/supabase-js'

export async function uploadProductImage(
  supabase: SupabaseClient,
  file: File,
  storeId: string
) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `store/${storeId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
}