'use client';

import { useRef, useState } from 'react';
import { uploadFile } from '@/lib/upload-client';

interface ImageUploadButtonProps {
  onUploaded: (url: string) => void;
  label?: string;
}

// Picks an image from the computer, uploads it and hands back its URL
export default function ImageUploadButton({ onUploaded, label = 'Otpremi sliku' }: ImageUploadButtonProps) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      onUploaded(await uploadFile(file));
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Greška pri otpremanju slike');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={uploading}
        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
      >
        {uploading ? 'Otpremanje...' : label}
      </button>
    </>
  );
}
