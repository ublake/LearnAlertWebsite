export async function adminAPI<T = { success: boolean }>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/admin/api/${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers }, cache: 'no-store' });
  return responseJSON<T>(response);
}
async function responseJSON<T>(response: Response): Promise<T> {
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Your admin session expired. Reload to sign in again.');
  const data = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || 'Request failed.');
  return data;
}
export async function uploadAdminMedia(deckId: string, file: File): Promise<string> {
  const extension = file.name.split('.').at(-1)?.toLowerCase();
  const contentType = ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav' } as Record<string, string>)[extension || ''];
  if (!contentType) throw new Error('Use PNG/JPEG images or MP3/M4A/WAV audio.');
  if (file.size > (contentType.startsWith('image/') ? 10 : 20) * 1024 * 1024) throw new Error(`${file.name} exceeds the ${contentType.startsWith('image/') ? 10 : 20} MB file limit.`);
  const response = await fetch(`/admin/api/decks/${deckId}/media`, { method: 'POST', headers: { 'Content-Type': contentType }, body: file });
  return (await responseJSON<{ id: string }>(response)).id;
}
