import {supabase, isDemoModeActive} from '../lib/supabase';
import { currentStorageOrg } from './designImageUrl';
import { parseSupabaseError } from './apiError';

export const storageService = {
  async uploadDesignImage(file: File, fileName?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!supabase || isDemoModeActive) {
      return {
        success: true,
        url: URL.createObjectURL(file),
      };
    }

    try {
      const orgId = await currentStorageOrg();
      const cleanName = `${orgId}/${fileName || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`}`;
      const { data, error } = await supabase.storage
        .from('design-images')
        .upload(cleanName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw parseSupabaseError(error);

      return { success: true, url: 'storage://design-images/' + data.path };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to upload image' };
    }
  },

  async uploadPaymentReceipt(file: File, fileName?: string): Promise<{ success: boolean; path?: string; error?: string }> {
    if (!supabase || isDemoModeActive) {
      return {
        success: true,
        path: `local-${file.name}`,
      };
    }

    try {
      const orgId = await currentStorageOrg();
      const cleanName = `${orgId}/${fileName || `receipts/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`}`;
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .upload(cleanName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw parseSupabaseError(error);

      return {
        success: true,
        path: data.path,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to upload receipt' };
    }
  },
};
