import { supabase } from '../lib/supabase';
import * as tus from 'tus-js-client';
import { generateShortId } from './hash';

export async function uploadFile(file, originalMeta, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const shortId = generateShortId(6);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';
      
      const ufileName = originalMeta?.name || file.name || 'upload.bin';
      const ufileType = originalMeta?.type || file.type || 'application/octet-stream';
      const ufileSize = originalMeta?.size || file.size;
      
      const upload = new tus.Upload(file, {
        endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token || anonKey}`,
          'x-upsert': 'true', 
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true, 
        metadata: {
          bucketName: 'megabin-uploads',
          objectName: `${shortId}-${ufileName}`,
          contentType: file.type || 'application/octet-stream',
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024, 
        onError: function (error) {
          reject(error);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          if (onProgress) onProgress(percentage);
        },
        onSuccess: async function () {
          const storagePath = `${shortId}-${ufileName}`;
          
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          const { data, error } = await supabase
            .from('files')
            .insert([
              {
                short_id: shortId,
                original_name: ufileName,
                mime_type: ufileType,
                size_bytes: ufileSize,
                storage_path: storagePath,
                expires_at: expiresAt.toISOString(),
              }
            ])
            .select()
            .single();

          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        },
      });

      upload.findPreviousUploads().then(function (previousUploads) {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    } catch (err) {
      reject(err);
    }
  });
}
