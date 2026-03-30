#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as tus from 'tus-js-client';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateShortId(length = 6) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node cli/megabin.js <path-to-file>");
  process.exit(1);
}

try {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = fileBuffer.length;

  // Generate AES-256-GCM Key and IV
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  console.log("🔒 Encrypting file locally...");
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // WebCrypto compatibility: append authTag to ciphertext
  const combinedBuffer = Buffer.concat([iv, encrypted, authTag]);
  
  // Base64 Text URL (the Data URI string) to natively upload as a text Blob
  const base64String = combinedBuffer.toString('base64');
  const dataUrl = `data:application/octet-stream;base64,${base64String}`;
  // We upload the dataUrl directly as the file payload.
  const payloadBuffer = Buffer.from(dataUrl, 'utf-8');

  const shortId = generateShortId(6);
  const ufileName = fileName + '.enc.txt';

  console.log("🚀 Uploading to Supabase via TUS (1MB Chunks)...");
  const upload = new tus.Upload(payloadBuffer, {
    endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
    retryDelays: [0, 3000, 5000, 10000],
    headers: {
      authorization: `Bearer ${supabaseKey}`,
      'x-upsert': 'true',
    },
    metadata: {
      bucketName: 'megabin-uploads',
      objectName: `${shortId}-${ufileName}`,
      contentType: 'text/plain',
    },
    chunkSize: 1 * 1024 * 1024, // 1MB chunks to evade DPI payload signatures
    onError: function(error) {
      console.error("\n❌ Upload failed:", error.message);
      process.exit(1);
    },
    onProgress: function(bytesUploaded, bytesTotal) {
      const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      process.stdout.write(`\rUpload progress: ${percentage}%`);
    },
    onSuccess: async function() {
      console.log("\n✅ Storage upload complete. Registering file metadata...");
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from('files').insert([{
        short_id: shortId,
        original_name: fileName,
        mime_type: 'application/octet-stream', 
        size_bytes: fileSize,
        storage_path: `${shortId}-${ufileName}`,
        expires_at: expiresAt.toISOString()
      }]);

      if (error) {
         console.error("❌ DB Insert Failed:", error);
         process.exit(1);
      }

      const keyHex = key.toString('hex');
      console.log("\n🎉 Upload Successful!");
      console.log(`🔗 Link: https://gridspeed.pro/${shortId}#${keyHex}`);
      console.log("🔐 This link contains the master decryption key in the hash.");
    }
  });

  upload.start();
} catch (err) {
  console.error("❌ Execution Error:", err.message);
  process.exit(1);
}
