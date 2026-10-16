'use client';

import { useState, type FormEvent } from 'react';

export type EditableCard = {
  id: string; question: string; correctAnswer: string; cardType: string;
  hint?: string; sectionName?: string; options?: string[];
  matchingLeftItems?: string[]; matchingRightItems?: string[];
  promptImageID?: string | null; answerImageID?: string | null; promptAudioID?: string | null;
  optionImageIDs?: (string | null)[];
};
export type EditableDeck = {
  id: string; name: string; description: string; category_tag: string;
  color_hex: string; deck_type: string; download_count: number; revision: number;
  created_at: number; updated_at: number; published_at?: number;
  cards: EditableCard[]; status: string; admin_created: number; review_status?: string; admin_note?: string | null;
};

export function DeckEditor({ deck, onSave, onClose, onUpload, onPublish }: { deck: EditableDeck; onSave: (body: Record<string, unknown>) => Promise<void>; onClose: () => void; onUpload: (file: File) => Promise<string>; onPublish?: (body: Record<string, unknown>) => Promise<void> }) {
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description);
  const [adminNote, setAdminNote] = useState(deck.admin_note || '');
  const [category, setCategory] = useState(deck.category_tag);
  const [color, setColor] = useState(deck.color_hex);
  const [type, setType] = useState(deck.deck_type);
  const [downloads, setDownloads] = useState(deck.download_count);
  const [cards, setCards] = useState(deck.cards);
  const [json, setJSON] = useState(JSON.stringify(deck.cards, null, 2));
  const [advanced, setAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const types = ['tap_reveal', 'vocabulary', 'multiple_choice', 'matching', 'fill_blank', 'images'];
  function edit(index: number, patch: Partial<EditableCard>) {
    setCards(current => current.map((card, i) => i === index ? { ...card, ...patch } : card)); setDirty(true);
  }
  function changeCardType(index: number, cardType: string) {
    edit(index, cardType === 'images'
      ? { cardType, question: '', correctAnswer: '', hint: '', options: [], matchingLeftItems: [], matchingRightItems: [], optionImageIDs: [], promptAudioID: null }
      : { cardType, answerImageID: null });
  }
  function close() { if (!dirty || window.confirm('Discard unsaved deck changes?')) onClose(); }
  function mode() {
    setError('');
    if (!advanced) { setJSON(JSON.stringify(cards, null, 2)); setAdvanced(true); }
    else {
      try {
        const parsed: unknown = JSON.parse(json);
        if (!Array.isArray(parsed) || parsed.some(card => !card || typeof card !== 'object' || typeof card.id !== 'string' || typeof card.cardType !== 'string' || typeof card.question !== 'string' || typeof card.correctAnswer !== 'string' || ['options', 'matchingLeftItems', 'matchingRightItems'].some(key => card[key] !== undefined && (!Array.isArray(card[key]) || card[key].some((value: unknown) => typeof value !== 'string'))) || ['hint', 'sectionName'].some(key => card[key] !== undefined && typeof card[key] !== 'string'))) throw new Error('Use a JSON array of cards with string id, cardType, question and correctAnswer fields. Choices and matching items must be arrays of text.');
        setCards(parsed); setAdvanced(false);
      } catch (e) { setError((e as Error).message); }
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); await submit(false);
  }
  async function submit(publish: boolean) {
    setError(''); setSaving(true);
    try {
      await (publish && onPublish ? onPublish : onSave)({ name, description, categoryTag: category, colorHex: color, deckType: type,
        downloadCount: downloads, adminNote, cards: advanced ? JSON.parse(json) : cards, expectedRevision: deck.revision });
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }
  async function attachment(index: number, file: File | undefined, kind: 'image' | 'audio', option?: number | 'back') {
    if (!file) return;
    setUploading(true); setError('');
    try {
      const id = await onUpload(file);
      if (typeof option === 'number') {
        const images = [...(cards[index].optionImageIDs || [])];
        while (images.length <= option) images.push(null);
        images[option] = id; edit(index, { optionImageIDs: images });
      } else if (option === 'back') edit(index, { answerImageID: id });
      else edit(index, kind === 'image' ? { promptImageID: id } : { promptAudioID: id });
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); }
  }
  const field = (label: string, value: string, setter: (value: string) => void, max: number) => <label>{label}<input value={value} maxLength={max} required={label !== 'Description'} onChange={e => { setter(e.target.value); setDirty(true); }} /></label>;
  return <section className="admin-detail" aria-label="Edit deck"><form onSubmit={save}>
    <header><h2>{deck.status === 'draft' ? 'Draft deck' : 'Edit deck'}</h2><div className="actions"><button type="submit" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save changes'}</button>{onPublish && <button type="button" disabled={saving || uploading} onClick={() => void submit(true)}>Publish deck</button>}<button type="button" disabled={saving || uploading} onClick={close}>Cancel editing</button></div></header>
    {error && <p role="alert" className="admin-message admin-error">{error}</p>}
    {uploading && <p role="status">Uploading attachment…</p>}
    <fieldset disabled={saving || uploading}><div className="admin-editor-grid">
      {field('Name', name, setName, 120)}{field('Category', category, setCategory, 60)}
      {field('Deck type', type, setType, 40)}<label>Color<input type="color" value={color} onChange={e => { setColor(e.target.value); setDirty(true); }} /></label>
      <label>Downloads<input type="number" min={0} max={2147483647} step={1} required value={downloads} onChange={e => { setDownloads(Number(e.target.value)); setDirty(true); }} /></label>
    </div><label className="admin-editor-label">Description<textarea value={description} maxLength={2000} rows={3} onChange={e => { setDescription(e.target.value); setDirty(true); }} /></label>
    <label className="admin-editor-label">Note to author (optional)<textarea value={adminNote} maxLength={1000} rows={3} placeholder="Explain your changes to the author" onChange={e => { setAdminNote(e.target.value); setDirty(true); }} /></label>
    <header><h2>Cards ({advanced ? 'JSON' : cards.length})</h2><button type="button" onClick={mode}>{advanced ? 'Card editor' : 'Edit JSON'}</button></header>
    {advanced ? <label className="admin-editor-label">Card data<textarea className="admin-json" rows={22} value={json} spellCheck={false} onChange={e => { setJSON(e.target.value); setDirty(true); }} /></label> : <>
      {cards.map((card, index) => <article className="admin-card" key={card.id}>
        <header><strong>Card {index + 1}</strong><button type="button" className="admin-danger" onClick={() => { setCards(current => current.filter((_, i) => i !== index)); setDirty(true); }}>Remove card</button></header>
        <div className="admin-editor-grid"><label>Card type<select value={card.cardType} onChange={e => changeCardType(index, e.target.value)}>{types.map(value => <option key={value}>{value}</option>)}</select></label><label>Section<input value={card.sectionName ?? ''} maxLength={120} onChange={e => edit(index, { sectionName: e.target.value })} /></label></div>
        {card.cardType !== 'images' && <><label className="admin-editor-label">Question<textarea value={card.question ?? ''} required maxLength={5000} rows={2} onChange={e => edit(index, { question: e.target.value })} /></label>
        <label className="admin-editor-label">Answer<textarea value={card.correctAnswer ?? ''} required={card.cardType !== 'matching'} maxLength={10000} rows={2} onChange={e => edit(index, { correctAnswer: e.target.value })} /></label>
        <label className="admin-editor-label">Hint<input value={card.hint ?? ''} maxLength={2000} onChange={e => edit(index, { hint: e.target.value })} /></label></>}
        {card.cardType === 'multiple_choice' && <label className="admin-editor-label">Choices (one per line)<textarea rows={4} value={(card.options ?? []).join('\n')} onChange={e => edit(index, { options: e.target.value.split('\n') })} /></label>}
        {card.cardType === 'matching' && <div className="admin-editor-grid"><label>Left items (one per line)<textarea rows={4} value={(card.matchingLeftItems ?? []).join('\n')} onChange={e => edit(index, { matchingLeftItems: e.target.value.split('\n') })} /></label><label>Right items (same order)<textarea rows={4} value={(card.matchingRightItems ?? []).join('\n')} onChange={e => edit(index, { matchingRightItems: e.target.value.split('\n') })} /></label></div>}
        <div className="admin-editor-grid"><label>{card.cardType === 'images' ? 'Front image' : 'Prompt image'}<input type="file" accept=".png,.jpg,.jpeg" onChange={e => { void attachment(index, e.target.files?.[0], 'image'); e.target.value = ''; }} /></label>{card.cardType !== 'images' && <label>Prompt audio<input type="file" accept=".mp3,.m4a,.wav" onChange={e => { void attachment(index, e.target.files?.[0], 'audio'); e.target.value = ''; }} /></label>}</div>
        {card.promptImageID && <img src={`/admin/api/media/${card.promptImageID}`} alt="Card prompt" />}{card.promptAudioID && <audio controls src={`/admin/api/media/${card.promptAudioID}`} />}
        {card.promptImageID && <button type="button" onClick={() => edit(index, { promptImageID: null })}>Remove image</button>}{card.promptAudioID && <button type="button" onClick={() => edit(index, { promptAudioID: null })}>Remove audio</button>}
        {card.cardType === 'images' && <><label className="admin-editor-label">Back image (optional)<input type="file" accept=".png,.jpg,.jpeg" onChange={e => { void attachment(index, e.target.files?.[0], 'image', 'back'); e.target.value = ''; }} /></label>{card.answerImageID && <><img src={`/admin/api/media/${card.answerImageID}`} alt="Card back" /><button type="button" onClick={() => edit(index, { answerImageID: null })}>Remove back image</button></>}</>}
        {card.cardType === 'multiple_choice' && card.options?.map((option, n) => <label className="admin-editor-label" key={n}>Choice {n + 1} image ({option})<input type="file" accept=".png,.jpg,.jpeg" onChange={e => { void attachment(index, e.target.files?.[0], 'image', n); e.target.value = ''; }} />{card.optionImageIDs?.[n] && <><img src={`/admin/api/media/${card.optionImageIDs[n]}`} alt={`Choice ${n + 1}`} /><button type="button" onClick={() => { const images = [...(card.optionImageIDs || [])]; images[n] = null; edit(index, { optionImageIDs: images }); }}>Remove choice image</button></>}</label>)}
      </article>)}
      <button type="button" onClick={() => { setCards(current => [...current, { id: crypto.randomUUID(), cardType: 'tap_reveal', question: '', correctAnswer: '' }]); setDirty(true); }} disabled={cards.length >= 500}>Add card</button>
    </>}
    </fieldset><div className="admin-editor-save"><button type="submit" disabled={saving || uploading}>Save changes</button>{onPublish && <button type="button" disabled={saving || uploading} onClick={() => void submit(true)}>Publish deck</button>}<button type="button" disabled={saving || uploading} onClick={close}>Cancel editing</button></div>
  </form></section>;
}
