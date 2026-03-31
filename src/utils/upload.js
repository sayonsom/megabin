import { supabase } from '../lib/supabase';
import * as tus from 'tus-js-client';
import { generateShortId } from './hash';

export async function uploadFile(file, originalMeta, onProgress, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const shortId = generateShortId(6);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';
      
      const ufileName = originalMeta?.name || file.name || 'upload.bin';
      const ufileType = originalMeta?.type || file.type || 'application/octet-stream';
      const ufileSize = originalMeta?.size || file.size;
      
      let delays = [0, 3000, 5000, 10000, 20000];
      let tChunkSize = 256 * 1024;
      
      if (options.retryAlgorithm === 'aggressive') {
        delays = [0, 1000, 1500, 2000, 3000, 3000, 3000, 5000, 5000, 10000];
      } else if (options.retryAlgorithm === 'corporate_firewall') {
        delays = [0, 5000, 15000, 30000, 60000, 120000];
        tChunkSize = 64 * 1024; // Smaller chunks
      }

      const upload = new tus.Upload(file, {
        endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
        retryDelays: delays,
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
        chunkSize: tChunkSize,
        onError: function (error) {
          reject(error);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          if (onProgress) onProgress(percentage);
        },
        onSuccess: async function () {
          const storagePath = `${shortId}-${ufileName}`;
          
          let expiresAt = new Date();
          if (options.pinFile) {
            expiresAt.setFullYear(expiresAt.getFullYear() + 100);
          } else {
            expiresAt.setDate(expiresAt.getDate() + 7);
          }

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

export async function uploadFileStealth(file, originalMeta, onProgress, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const shortId = generateShortId(6);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  
  const ufileName = originalMeta?.name || file.name || 'upload.bin';
  const ufileType = originalMeta?.type || file.type || 'application/octet-stream';
  const ufileSize = originalMeta?.size || file.size;
  const storagePath = `${shortId}-${ufileName}`;
  const bucket = 'megabin-uploads';

  const toB64 = (str) => btoa(unescape(encodeURIComponent(str)));

  const initRes = await fetch(`${supabaseUrl}/storage/v1/upload/resumable`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token || anonKey}`,
      'Tus-Resumable': '1.0.0',
      'Upload-Length': ufileSize.toString(),
      'Upload-Metadata': `bucketName ${toB64(bucket)},objectName ${toB64(storagePath)},contentType ${toB64(ufileType)},cacheControl ${toB64('3600')}`,
      'x-upsert': 'true'
    }
  });

  if (!initRes.ok) throw new Error('Failed to initialize stealth upload');
  
  let location = initRes.headers.get('location');
  if (!location) throw new Error('No upload location returned');
  if (location.startsWith('/')) {
    location = `${supabaseUrl}${location}`;
  }

  let offset = 0;

  while (offset < ufileSize) {
    const minChunk = 64 * 1024;
    const maxChunk = 256 * 1024;
    let chunkSize = Math.floor(Math.random() * (maxChunk - minChunk + 1)) + minChunk;
    
    if (offset + chunkSize > ufileSize) {
      chunkSize = ufileSize - offset;
    }

    const chunk = file.slice(offset, offset + chunkSize);

    const patchRes = await fetch(location, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session?.access_token || anonKey}`,
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': offset.toString(),
        'Content-Type': 'application/offset+octet-stream'
      },
      body: chunk
    });

    if (!patchRes.ok) {
      throw new Error(`Stealth upload intercepted or failed at offset ${offset}`);
    }

    offset = parseInt(patchRes.headers.get('upload-offset') || (offset + chunkSize).toString(), 10);
    
    if (onProgress) {
      onProgress(((offset / ufileSize) * 100).toFixed(2));
    }

    if (offset < ufileSize) {
      const delay = Math.floor(Math.random() * 1500) + 500;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  let expiresAt = new Date();
  if (options.pinFile) {
    expiresAt.setFullYear(expiresAt.getFullYear() + 100);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  const { data, error } = await supabase
    .from('files')
    .insert([{ short_id: shortId, original_name: ufileName, mime_type: ufileType, size_bytes: ufileSize, storage_path: storagePath, expires_at: expiresAt.toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
