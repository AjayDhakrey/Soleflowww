import { supabase, toValidOrgId } from '../lib/supabase';

// Store a durable object path. Signed URLs are renewed whenever catalog data loads.
export async function resolveDesignImage(image: string): Promise<string> {
  if (!supabase || !image) return image;
  const prefix = 'storage://design-images/';
  const legacy = image.match(/\/storage\/v1\/object\/(?:public|sign)\/design-images\/([^?]+)/);
  const path = image.startsWith(prefix) ? image.slice(prefix.length) : legacy ? decodeURIComponent(legacy[1]) : null;
  if (!path) return image;
  const { data, error } = await supabase.storage.from('design-images').createSignedUrl(path, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function currentStorageOrg(): Promise<string> {
  if (!supabase) return toValidOrgId(null);
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return toValidOrgId(null);
    const { data, error } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
    if (error || !data?.org_id) return toValidOrgId(null);
    return toValidOrgId(data.org_id);
  } catch {
    return toValidOrgId(null);
  }
}
