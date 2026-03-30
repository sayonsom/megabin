export async function generateEncryptionKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function importEncryptionKey(hexString) {
  const bytes = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  return await window.crypto.subtle.importKey(
    'raw',
    bytes,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFileToTextBlob(file, key) {
  const arrayBuffer = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  );

  const combinedPayload = new Blob([iv, encryptedBuffer]);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is a data URL (Base64)
      const textBlob = new Blob([reader.result], { type: 'text/plain' });
      // Inject original name to file object for TUS
      textBlob.name = file.name + '.enc.txt';
      resolve(textBlob);
    };
    reader.onerror = reject;
    reader.readAsDataURL(combinedPayload);
  });
}

export async function decryptTextBlobToFile(textString, key, originalType) {
  const response = await fetch(textString);
  const combinedBuffer = await response.arrayBuffer();
  
  const iv = combinedBuffer.slice(0, 12);
  const encryptedData = combinedBuffer.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    encryptedData
  );

  return new Blob([decryptedBuffer], { type: originalType || 'application/octet-stream' });
}
