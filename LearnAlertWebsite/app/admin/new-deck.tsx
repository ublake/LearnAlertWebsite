'use client';
import { useEffect, useState } from 'react';
import { adminAPI, uploadAdminMedia } from './admin-client';

import { example, instructions } from './deck-format';
import { FormatGuide } from './format-guide';

export function NewDeck({ onCreated }: { onCreated: (id: string) => Promise<void> }) {
  const [mode, setMode] = useState<'manual' | 'import'>('manual');
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('official');
  const [authors, setAuthors] = useState<{ id: string; handle: string }[]>([]);
  const [json, setJSON] = useState(JSON.stringify(example, null, 2));
  const [files, setFiles] = useState<File[]>([]);
  const [draft, setDraft] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => { void adminAPI<{ items: { id: string; handle: string }[] }>('profiles').then(page => setAuthors(page.items)).catch(e => setError((e as Error).message)); }, []);
  async function create() {
    setError(''); setBusy(true);
    try {
      if (mode === 'manual') {
        const result = await adminAPI<{ id: string }>('decks', { method: 'POST', body: JSON.stringify({ name, ownerId: owner }) });
        await onCreated(result.id); return;
      }
      const raw = JSON.parse(json);
      if (!raw || typeof raw !== 'object' || !Array.isArray(raw.cards)) throw new Error('Import one deck object with a cards array.');
      const needed = new Map<string, 'image' | 'audio'>();
      const placeholders: Record<string, string> = {};
      const available = new Map<string, File>();
      for (const file of files) {
        if (available.has(file.name)) throw new Error(`Duplicate filename: ${file.name}`);
        available.set(file.name, file);
      }
      function reference(value: unknown, kind: 'image' | 'audio'): string | null {
        if (value == null || value === '') return null;
        if (typeof value !== 'string' || /[\\/]/.test(value)) throw new Error('Media references must be filenames, not URLs or paths.');
        if (needed.has(value) && needed.get(value) !== kind) throw new Error(`${value} is used as both an image and audio.`);
        needed.set(value, kind);
        const file = available.get(value);
        if (!uploaded[value] && !file) throw new Error(`Upload the referenced file: ${value}`);
        if (file && !(kind === 'image' ? /\.(png|jpe?g)$/i : /\.(mp3|m4a|wav)$/i).test(file.name)) throw new Error(`${value} must be ${kind === 'image' ? 'PNG or JPEG' : 'MP3, M4A or WAV'}.`);
        return placeholders[value] ||= uploaded[value] || crypto.randomUUID();
      }
      const cards = raw.cards.map((card: Record<string, unknown>, i: number) => {
        if (!card || typeof card !== 'object') throw new Error(`Card ${i + 1} must be an object.`);
        if (card.promptImageID || card.promptAudioID || card.optionImageIDs) throw new Error('For imports use promptImage, promptAudio and optionImages filenames, rather than media IDs.');
        if (card.optionImages !== undefined && !Array.isArray(card.optionImages)) throw new Error('optionImages must be an array in the same order as options.');
        return { ...card, id: card.id ?? `card-${i+1}`, promptImageID: reference(card.promptImage, 'image'), promptAudioID: reference(card.promptAudio, 'audio'), optionImageIDs: (card.optionImages as unknown[] || []).map(value => reference(value, 'image')) };
      });
      const payload = { ...raw, cards, downloadCount: 0 };
      setProgress('Validating deck…');
      await adminAPI('decks/validate', { method: 'POST', body: JSON.stringify(payload) });
      let id = draft;
      if (!id) { id = (await adminAPI<{ id: string }>('decks', { method: 'POST', body: JSON.stringify({ ...raw, ownerId: owner }) })).id; setDraft(id); }
      const actual = { ...uploaded };
      let count = 0;
      for (const [filename] of needed) {
        setProgress(`Uploading ${++count}/${needed.size}: ${filename}`);
        if (!actual[filename]) { actual[filename] = await uploadAdminMedia(id, available.get(filename)!); setUploaded({ ...actual }); }
      }
      const converted = cards.map((card: Record<string, unknown>) => ({ ...card, promptImageID: card.promptImage ? actual[String(card.promptImage)] : null, promptAudioID: card.promptAudio ? actual[String(card.promptAudio)] : null, optionImageIDs: ((card.optionImages as (string | null)[]) || []).map(value => value ? actual[value] : null) }));
      const current = await adminAPI<{ deck: { revision: number } }>(`decks/${id}`);
      setProgress('Saving draft…');
      await adminAPI(`decks/${id}`, { method: 'PUT', body: JSON.stringify({ ...payload, cards: converted, expectedRevision: current.deck.revision }) });
      await onCreated(id);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); setProgress(''); }
  }
  return <section className="admin-detail" aria-label="New deck"><h2>New deck</h2>
    <nav aria-label="Creation method"><button disabled={busy || Boolean(draft)} aria-current={mode === 'manual' ? 'page' : undefined} onClick={() => setMode('manual')}>Blank deck</button><button disabled={busy} aria-current={mode === 'import' ? 'page' : undefined} onClick={() => setMode('import')}>Import JSON</button></nav>
    <fieldset disabled={busy}><label className="admin-editor-label">Author<select value={owner} disabled={Boolean(draft)} onChange={e => setOwner(e.target.value)}><option value="official">LearnAlert official (@learnalert)</option>{authors.map(author => <option key={author.id} value={author.id}>{author.handle}</option>)}</select></label>
    {mode === 'manual' ? <label className="admin-editor-label">Deck name<input value={name} maxLength={120} onChange={e => setName(e.target.value)} /></label> : <>
      <label className="admin-editor-label">Deck JSON<textarea className="admin-json" rows={16} value={json} spellCheck={false} onChange={e => setJSON(e.target.value)} /></label>
      <label className="admin-editor-label">Image / audio files<input type="file" multiple accept=".png,.jpg,.jpeg,.mp3,.m4a,.wav" onChange={e => setFiles(Array.from(e.target.files || []))} /></label>
      {files.length > 0 && <p><small>{files.map(file => file.name).join(', ')}</small></p>}
    </>}
    <button disabled={busy || (mode === 'manual' && !name.trim())} onClick={() => void create()}>{busy ? progress || 'Creating…' : draft ? 'Continue import' : 'Create draft'}</button></fieldset>
    {error && <p role="alert" className="admin-message admin-error">{error}</p>}
    {draft && <p><small>Draft saved. Failed imports can be continued here or opened from Decks.</small></p>}
    <details className="admin-format"><summary>Format documentation & AI prompt</summary>
      <div className="actions"><a className="admin-link" href="/admin-deck-template.json" download>Download JSON template</a><a className="admin-link" href="/admin-deck-format.md" download>Download format guide</a><button onClick={() => { void navigator.clipboard.writeText(instructions).then(() => setCopied(true)).catch(() => setError('Copy the prompt below manually.')); }}>{copied ? 'Copied' : 'Copy AI prompt'}</button></div>
      <FormatGuide />
    </details>
  </section>;
}
