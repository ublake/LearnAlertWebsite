'use client';

import { useState, type FormEvent, type TouchEvent } from 'react';

export type FieldMedia = { imageID?: string | null; audioID?: string | null };
export type EditableCard = {
  id: string; question: string; correctAnswer: string; cardType: string;
  hint?: string; sectionName?: string; options?: string[];
  matchingLeftItems?: string[]; matchingRightItems?: string[];
  promptImageID?: string | null; answerImageID?: string | null; promptAudioID?: string | null;
  optionImageIDs?: (string | null)[]; fieldMedia?: Record<string, FieldMedia>; correctOptionIndex?: number | null;
};
export type EditableDeck = {
  id: string; name: string; description: string; category_tag: string;
  color_hex: string; deck_type: string; download_count: number; revision: number;
  created_at: number; updated_at: number; published_at?: number;
  cards: EditableCard[]; status: string; admin_created: number; review_status?: string; admin_note?: string | null;
};
export function cardMedia(card: EditableCard, key: string): FieldMedia {
  if (card.fieldMedia?.[key]) return card.fieldMedia[key];
  if (key === 'prompt') return { imageID: card.promptImageID, audioID: card.promptAudioID };
  if (key === 'answer') return { imageID: card.answerImageID };
  if (key.startsWith('option:')) return { imageID: card.optionImageIDs?.[Number(key.split(':')[1])] };
  return {};
}
function MediaField({ label, value, media, onText, onMedia, onUpload, imageOnly = false }: {
  label: string; value: string; media: FieldMedia; onText: (text: string) => void;
  onMedia: (patch: FieldMedia) => void; onUpload: (file: File, kind: 'imageID' | 'audioID') => void; imageOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  function end(event: TouchEvent) {
    if (!start) return;
    const touch = event.changedTouches[0];
    if (start.x - touch.clientX > 35 && Math.abs(start.y - touch.clientY) < 30) setOpen(true);
    setStart(null);
  }
  return <div className="admin-media-field">
    <div className="admin-media-label"><label>{label}</label><button type="button" aria-label={`Attachments for ${label}`} aria-expanded={open} onClick={() => setOpen(!open)}>＋ Attach</button></div>
    {!imageOnly && <textarea aria-label={label} rows={1} maxLength={label === 'Hint' ? 2000 : label === 'Answer' ? 10000 : 5000} placeholder="Text, image or audio" value={value} onChange={e => onText(e.target.value)} onTouchStart={e => setStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })} onTouchEnd={end} />}
    {(open || imageOnly) && <div className="admin-media-tools"><label>Image<input type="file" accept=".png,.jpg,.jpeg" onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0], 'imageID'); e.target.value = ''; }} /></label>{!imageOnly && <label>Audio<input type="file" accept=".mp3,.m4a,.wav" onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0], 'audioID'); e.target.value = ''; }} /></label>}</div>}
    {media.imageID && <div className="admin-media-preview"><img src={`/admin/api/media/${media.imageID}`} alt={label} /><button type="button" onClick={() => onMedia({ imageID: null })} aria-label={`Remove ${label} image`}>×</button></div>}
    {media.audioID && <div className="admin-media-preview"><audio controls preload="none" src={`/admin/api/media/${media.audioID}`} /><button type="button" onClick={() => onMedia({ audioID: null })} aria-label={`Remove ${label} audio`}>×</button></div>}
  </div>;
}
export function DeckEditor({ deck, onSave, onClose, onUpload, onPublish }: { deck: EditableDeck; onSave: (body: Record<string, unknown>) => Promise<void>; onClose: () => void; onUpload: (file: File) => Promise<string>; onPublish?: (body: Record<string, unknown>) => Promise<void> }) {
  const [name, setName] = useState(deck.name), [description, setDescription] = useState(deck.description);
  const [adminNote, setAdminNote] = useState(deck.admin_note || ''), [category, setCategory] = useState(deck.category_tag);
  const [color, setColor] = useState(deck.color_hex), [type, setType] = useState(deck.deck_type), [downloads, setDownloads] = useState(deck.download_count);
  const [cards, setCards] = useState(deck.cards), [json, setJSON] = useState(JSON.stringify(deck.cards, null, 2));
  const [advanced, setAdvanced] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState(''), [dirty, setDirty] = useState(false), [uploading, setUploading] = useState(false);
  const [hints, setHints] = useState(new Set(deck.cards.filter(card => card.hint || cardMedia(card, 'hint').imageID || cardMedia(card, 'hint').audioID).map(card => card.id)));
  const types = ['tap_reveal', 'vocabulary', 'multiple_choice', 'matching', 'fill_blank', 'images'];
  function edit(index: number, patch: Partial<EditableCard>) { setCards(current => current.map((card, i) => i === index ? { ...card, ...patch } : card)); setDirty(true); }
  function changeCardType(index: number, cardType: string) {
    const card = cards[index];
    const all = { ...card.fieldMedia, prompt: cardMedia(card, 'prompt'), answer: cardMedia(card, 'answer') };
    const keep = Object.fromEntries(Object.entries(all).filter(([key]) => key === 'prompt' || key === 'hint' && cardType !== 'images' || key === 'answer' && !['multiple_choice','matching'].includes(cardType)).map(([key, media]) => [key, cardType === 'images' ? { imageID: media.imageID } : media]));
    edit(index, { cardType, question: cardType === 'images' ? '' : card.question, correctAnswer: cardType === 'images' ? '' : card.correctAnswer,
      hint: cardType === 'images' ? '' : card.hint, fieldMedia: keep, answerImageID: keep.answer?.imageID ?? null,
      promptAudioID: cardType === 'images' ? null : card.promptAudioID,
      options: cardType === 'multiple_choice' ? ['', ''] : [], optionImageIDs: [], correctOptionIndex: cardType === 'multiple_choice' ? 0 : null,
      matchingLeftItems: cardType === 'matching' ? ['', ''] : [], matchingRightItems: cardType === 'matching' ? ['', ''] : [] });
  }
  function setMedia(index: number, key: string, patch: FieldMedia) {
    setCards(current => current.map((card, i) => {
      if (i !== index) return card;
      const media = { ...cardMedia(card, key), ...patch };
      const next = { ...card, fieldMedia: { ...card.fieldMedia, [key]: media } };
      if (key === 'prompt') { next.promptImageID = media.imageID; next.promptAudioID = media.audioID; }
      if (key === 'answer') next.answerImageID = media.imageID;
      if (key.startsWith('option:')) { next.optionImageIDs = [...(card.optionImageIDs ?? [])]; while (next.optionImageIDs.length <= Number(key.split(':')[1])) next.optionImageIDs.push(null); next.optionImageIDs[Number(key.split(':')[1])] = media.imageID ?? null; }
      return next;
    })); setDirty(true);
  }
  async function attachment(index: number, key: string, file: File, kind: 'imageID' | 'audioID') {
    setUploading(true); setError('');
    try { setMedia(index, key, { [kind]: await onUpload(file) }); } catch (e) { setError((e as Error).message); } finally { setUploading(false); }
  }
  function mode() {
    setError('');
    if (!advanced) { setJSON(JSON.stringify(cards, null, 2)); setAdvanced(true); }
    else { try {
      const parsed: unknown = JSON.parse(json);
      if (!Array.isArray(parsed) || parsed.some(card => !card || typeof card.id !== 'string' || typeof card.cardType !== 'string' || ['question','correctAnswer','hint'].some(key => card[key] !== undefined && typeof card[key] !== 'string'))) throw new Error('Use a JSON array of cards. Text fields may be empty when an image or audio is attached.');
      setCards(parsed); setAdvanced(false);
    } catch (e) { setError((e as Error).message); } }
  }
  async function submit(publish: boolean) {
    setSaving(true); setError('');
    try { await (publish && onPublish ? onPublish : onSave)({ name, description, categoryTag: category, colorHex: color, deckType: type, downloadCount: downloads, adminNote, cards: advanced ? JSON.parse(json) : cards, expectedRevision: deck.revision }); }
    catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  }
  const field = (label: string, value: string, setter: (value: string) => void, max: number) => <label>{label}<input value={value} maxLength={max} required onChange={e => { setter(e.target.value); setDirty(true); }} /></label>;
  const mediaField = (card: EditableCard, index: number, key: string, label: string, value: string, onText: (text: string) => void, imageOnly = false) => <MediaField key={key} label={label} value={value} media={cardMedia(card, key)} onText={onText} onMedia={patch => setMedia(index, key, patch)} onUpload={(file, kind) => { void attachment(index, key, file, kind); }} imageOnly={imageOnly} />;
  function choices(index: number, count: number, matching: boolean) {
    const card = cards[index];
    const allowed = new Set(['prompt', 'answer', 'hint', ...Array.from({ length: count }, (_, i) => matching ? [`left:${i}`, `right:${i}`] : [`option:${i}`]).flat()]);
    const resized = (items: string[] = []) => Array.from({ length: count }, (_, i) => items[i] ?? '');
    edit(index, { ...(matching ? { matchingLeftItems: resized(card.matchingLeftItems), matchingRightItems: resized(card.matchingRightItems) } : { options: resized(card.options), optionImageIDs: (card.optionImageIDs ?? []).slice(0, count), correctOptionIndex: Math.min(card.correctOptionIndex ?? Math.max(0, card.options?.indexOf(card.correctAnswer) ?? 0), count - 1) }), fieldMedia: Object.fromEntries(Object.entries(card.fieldMedia ?? {}).filter(([key]) => allowed.has(key))) });
  }
  return <section className="admin-detail" aria-label="Edit deck"><form onSubmit={(event: FormEvent) => { event.preventDefault(); void submit(false); }}>
    <header><h2>{deck.status === 'draft' ? 'Draft deck' : 'Edit deck'}</h2><div className="actions"><button type="submit" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save changes'}</button>{onPublish && <button type="button" disabled={saving || uploading} onClick={() => void submit(true)}>Publish deck</button>}<button type="button" disabled={saving || uploading} onClick={() => { if (!dirty || window.confirm('Discard unsaved deck changes?')) onClose(); }}>Cancel editing</button></div></header>
    {error && <p role="alert" className="admin-message admin-error">{error}</p>}{uploading && <p role="status">Uploading attachment…</p>}
    <fieldset disabled={saving || uploading}><div className="admin-editor-grid">
      {field('Name', name, setName, 120)}{field('Category', category, setCategory, 60)}{field('Deck type', type, setType, 40)}
      <label>Color<input type="color" value={color} onChange={e => { setColor(e.target.value); setDirty(true); }} /></label>
      <label>Downloads<input type="number" min={0} max={2147483647} step={1} required value={downloads} onChange={e => { setDownloads(Number(e.target.value)); setDirty(true); }} /></label>
    </div><label className="admin-editor-label">Description<textarea value={description} maxLength={2000} rows={2} onChange={e => { setDescription(e.target.value); setDirty(true); }} /></label>
    <details><summary>Note to author</summary><textarea aria-label="Note to author" value={adminNote} maxLength={1000} rows={2} onChange={e => { setAdminNote(e.target.value); setDirty(true); }} /></details>
    <header><h2>Cards ({advanced ? 'JSON' : cards.length})</h2><button type="button" onClick={mode}>{advanced ? 'Card editor' : 'Edit JSON'}</button></header>
    {advanced ? <textarea aria-label="Card data" className="admin-json" rows={22} value={json} spellCheck={false} onChange={e => { setJSON(e.target.value); setDirty(true); }} /> : <>
      {cards.map((card, index) => <article className="admin-card" key={card.id}>
        <header><strong>Card {index + 1}</strong><button type="button" className="admin-danger" onClick={() => { setCards(current => current.filter((_, i) => i !== index)); setDirty(true); }}>Remove card</button></header>
        <div className="admin-editor-grid"><label>Card type<select value={card.cardType} onChange={e => changeCardType(index, e.target.value)}>{types.map(value => <option key={value}>{value}</option>)}</select></label><label>Section<input value={card.sectionName ?? ''} maxLength={120} onChange={e => edit(index, { sectionName: e.target.value })} /></label></div>
        {mediaField(card, index, 'prompt', card.cardType === 'images' ? 'Front image' : 'Question', card.question ?? '', value => edit(index, { question: value }), card.cardType === 'images')}
        {card.cardType === 'multiple_choice' ? <>
          <div className="admin-media-label"><strong>Choices</strong><select aria-label="Choice count" value={card.options?.length || 2} onChange={e => choices(index, Number(e.target.value), false)}>{[2,3,4].map(n => <option key={n}>{n}</option>)}</select></div>
          {(card.options ?? ['', '']).map((text, n) => <div className="admin-choice-field" key={n}><input type="radio" name={`correct-${card.id}`} aria-label={`Choice ${n + 1} is correct`} checked={(card.correctOptionIndex ?? card.options?.indexOf(card.correctAnswer)) === n} onChange={() => edit(index, { correctOptionIndex: n, correctAnswer: card.options?.[n] ?? '' })} />{mediaField(card, index, `option:${n}`, `Choice ${n + 1}`, text, value => { const options = [...(card.options ?? ['', ''])]; options[n] = value; edit(index, { options }); })}</div>)}
        </> : card.cardType === 'matching' ? <>
          <div className="admin-media-label"><strong>Pairs</strong><input aria-label="Pair count" type="number" min={2} max={20} value={card.matchingLeftItems?.length || 2} onChange={e => { const count = Number(e.target.value); if (count >= 2 && count <= 20) choices(index, count, true); }} /></div>
          {(card.matchingLeftItems ?? ['', '']).map((text, n) => <div className="admin-editor-grid" key={n}>{mediaField(card, index, `left:${n}`, `Left ${n + 1}`, text, value => { const items = [...(card.matchingLeftItems ?? ['', ''])]; items[n] = value; edit(index, { matchingLeftItems: items }); })}{mediaField(card, index, `right:${n}`, `Right ${n + 1}`, card.matchingRightItems?.[n] ?? '', value => { const items = [...(card.matchingRightItems ?? ['', ''])]; items[n] = value; edit(index, { matchingRightItems: items }); })}</div>)}
        </> : mediaField(card, index, 'answer', card.cardType === 'images' ? 'Back image (optional)' : 'Answer', card.correctAnswer ?? '', value => edit(index, { correctAnswer: value }), card.cardType === 'images')}
        {card.cardType !== 'images' && <><label className="admin-hint-toggle"><input type="checkbox" checked={hints.has(card.id)} onChange={e => { const next = new Set(hints); if (e.target.checked) next.add(card.id); else { next.delete(card.id); edit(index, { hint: '' }); setMedia(index, 'hint', { imageID: null, audioID: null }); } setHints(next); }} />Hint</label>{hints.has(card.id) && mediaField(card, index, 'hint', 'Hint', card.hint ?? '', value => edit(index, { hint: value }))}</>}
      </article>)}
      <button type="button" onClick={() => { setCards(current => [...current, { id: crypto.randomUUID(), cardType: 'tap_reveal', question: '', correctAnswer: '' }]); setDirty(true); }} disabled={cards.length >= 500}>Add card</button>
    </>}
    </fieldset><div className="admin-editor-save"><button type="submit" disabled={saving || uploading}>Save changes</button>{onPublish && <button type="button" disabled={saving || uploading} onClick={() => void submit(true)}>Publish deck</button>}</div>
  </form></section>;
}
