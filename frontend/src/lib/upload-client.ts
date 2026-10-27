// Browser helper for /api/upload; resolves to the public URL of the stored file
export async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.fullUrl) {
    throw new Error(data.error || `Upload failed (HTTP ${res.status})`);
  }
  return data.fullUrl;
}
