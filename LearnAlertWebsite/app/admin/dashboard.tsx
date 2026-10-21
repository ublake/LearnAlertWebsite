'use client';
import { AdminCardPreview } from './card-preview';

import { adminAPI as api, uploadAdminMedia } from './admin-client';
import { NewDeck } from './new-deck';
import { DeckEditor, type EditableDeck } from './deck-editor';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

type Row = { id?: string; author_id?: string; restriction_status?: string; restriction_reason?: string; restriction_revision?: number; until_at?: number; name?: string; handle?: string; description?: string; category_tag?: string; status?: string; admin_hidden?: number; admin_note?: string; admin_action?: string; admin_updated_at?: number; review_status?: string; review_message?: string; submitted_at?: number; reviewed_at?: number; revision?: number; admin_created?: number; card_count?: number; download_count?: number; report_count?: number; created_at: number; updated_at?: number; published_at?: number; deck_count?: number; profile_completed?: number; deck_id?: string; user_id?: string; reason?: string; owner_handle?: string; reporter_handle?: string; resolved_at?: number; actor?: string; action?: string; target?: string; details?: string };
type Overview = { actor: string; decks: { total: number; published: number; hidden: number }; profiles: number; reports: number; pendingReviews: number };
type Card = import('./deck-editor').EditableCard;
type Deck = Row & { cards: Card[] };
type Pending = { title: string; path: string; method: string; body: Record<string, unknown>; username?: string; destructive?: boolean; effect?: string; reviewReason?: boolean; authorNote?: boolean; restrictionReason?: boolean; suspension?: boolean };
const tabs = ['decks', 'reviews', 'profiles', 'reports', 'restrictions', 'audit'] as const;
type Tab = typeof tabs[number];
const date = (seconds?: number) => seconds ? new Date(seconds * 1000).toLocaleString() : '—';

export function CommunityWorkspace({ scope, onDirtyChange }: { scope: 'community' | 'moderation'; onDirtyChange: (dirty: boolean) => void }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [tab, setTab] = useState<Tab>(scope === 'community' ? 'decks' : 'reviews');
  const [visibilityFilter, setVisibilityFilter] = useState<'public' | 'all'>('public');
  const [editorDirty, setEditorDirty] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState('pending');
  const [reviewReason, setReviewReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [restrictionReason, setRestrictionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [resolved, setResolved] = useState(false);
  const [offset, setOffset] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EditableDeck | null>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [username, setUsername] = useState('');
  const sequence = useRef(0);

  const load = useCallback(async () => {
    const current = ++sequence.current;
    setBusy(true); setError('');
    try {
      const [summary, page] = await Promise.all([api<Overview>('overview'), api<{ items: Row[]; nextOffset: number | null }>(`${tab}?offset=${offset}&q=${encodeURIComponent(query)}&resolved=${resolved}&status=${reviewFilter}&publicOnly=${tab === 'decks' && visibilityFilter === 'public'}`)]);
      if (current !== sequence.current) return;
      setOverview(summary); setRows(page.items); setNext(page.nextOffset);
    } catch (e) { if (current === sequence.current) setError((e as Error).message); }
    finally { if (current === sequence.current) setBusy(false); }
  }, [tab, offset, query, resolved, reviewFilter, visibilityFilter]);
  useEffect(() => { void load(); return () => { sequence.current++; }; }, [load]);

  useEffect(() => { onDirtyChange(editorDirty); return () => onDirtyChange(false); }, [editorDirty, onDirtyChange]);
  useEffect(() => { const timer = window.setInterval(() => { if (!editing && !creating && !pending && !busy && document.visibilityState === 'visible') void load(); }, 30000); return () => window.clearInterval(timer); }, [load, editing, creating, pending, busy]);
  function changeTab(value: Tab) { if (editorDirty && !window.confirm('Discard unsaved deck changes?')) return; setCreating(false); setTab(value); setOffset(0); setQuery(''); setSearch(''); setRows([]); setDeck(null); setPending(null); setNotice(''); }
  function searchRows(e: FormEvent) { e.preventDefault(); setOffset(0); setQuery(search.trim()); }
  async function preview(id: string, edit = false) {
    setBusy(true); setError(''); setDeck(null);
    try { const result = await api<{ deck: Deck & EditableDeck }>(`decks/${id}`); if (edit) { setEditing(result.deck); setPending(null); } else setDeck(result.deck); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  function visibility(row: Row) {
    const id = row.id || row.deck_id; setAdminNote('');
    setPending({ title: row.admin_hidden ? `Restore “${row.name}” to its previous visibility?` : `Hide “${row.name}” from the community?`, path: `decks/${id}`, method: 'PATCH', body: { hidden: !row.admin_hidden, expectedRevision: row.revision }, authorNote: true });
  }
  function deleteItem(row: Row, kind: 'deck' | 'profile' | 'report') {
    const common = { destructive: true, method: 'POST' };
    if (kind === 'deck') setAdminNote('');
    if (kind === 'deck') setPending({ ...common, title: `Delete “${row.name}”?`, path: `decks/${row.id || row.deck_id}`, method: 'DELETE', body: { expectedRevision: row.revision }, authorNote: true, effect: 'Removes the community copy and its media. Cannot be restored. The author will see a Removed notice and your optional note. Already downloaded copies stay on users’ devices.' });
    if (kind === 'profile') setPending({ ...common, title: `Delete ${row.handle}?`, path: 'profiles/delete', body: { id: row.id }, effect: `Removes this profile, its ${row.deck_count ?? 0} community decks, reports, and sign-in sessions. Cannot be restored. Personal decks on their device stay intact. They can create a new profile by signing in again.` });
    if (kind === 'report') setPending({ ...common, title: `Delete this report for “${row.name}”?`, path: 'reports/delete', body: { deckId: row.deck_id, userId: row.user_id, createdAt: row.created_at }, effect: 'Permanently removes this report. The deck and profiles stay intact.' });
  }
  function decision(row: Row, action: 'approve' | 'reject') {
    setReviewReason(''); setPending({ title: `${action === 'approve' ? 'Approve' : 'Reject'} “${row.name}”?`, path: `decks/${row.id}/review`, method: 'POST', body: { decision: action, expectedRevision: row.revision }, reviewReason: action === 'reject', effect: action === 'approve' ? 'Makes this submission available in the public community library, unless it is hidden.' : 'Keeps the deck private and shows your reason to the author.' });
  }
  function restrict(row: Row, action: 'suspend' | 'ban' | 'restore') {
    setRestrictionReason(''); setSuspensionDays(7);
    setPending({ title: `${action === 'restore' ? 'Restore access for' : action === 'ban' ? 'Ban' : 'Suspend'} ${row.handle}?`, path: 'profiles/restrict', method: 'POST', body: { authorID: row.author_id || row.id, action, expectedRevision: row.restriction_revision ?? row.revision ?? 0 }, restrictionReason: action !== 'restore', suspension: action === 'suspend', effect: action === 'restore' ? 'Restores community access and the account’s previously approved visible decks.' : 'Blocks community account actions and hides all its public decks. Survives profile deletion. Personal device-local copies stay intact.' });
  }
  async function confirm() {
    if (!pending) return;
    setBusy(true); setError('');
    try {
      await api(pending.path, { method: pending.method, body: JSON.stringify({ ...pending.body, ...(pending.username !== undefined ? { username } : {}), ...(pending.reviewReason ? { reason: reviewReason } : {}), ...(pending.authorNote ? { adminNote } : {}), ...(pending.restrictionReason ? { reason: restrictionReason } : {}), ...(pending.suspension ? { until: Math.floor(Date.now() / 1000) + suspensionDays * 86400 } : {}) }) });
      setPending(null); setNotice(pending.destructive ? 'Deleted.' : 'Saved.'); setDeck(null); await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  const scopedTabs = scope === 'community' ? tabs.filter(value => ['decks','profiles'].includes(value)) : tabs.filter(value => !['decks','profiles'].includes(value));
  const displayedRows = rows;
  return <section className="community-workspace">
    <section className="admin-stats" aria-label="Community totals">
      {[['Published decks', overview?.decks.published], ['Hidden decks', overview?.decks.hidden], ['Profiles', overview?.profiles], ['Open reports', overview?.reports], ['Pending reviews', overview?.pendingReviews]].map(([label, value]) => <article key={String(label)}><small>{label}</small><strong>{value ?? '—'}</strong></article>)}
    </section>
    <nav aria-label="Admin sections">{scopedTabs.map(value => <button key={value} aria-current={!creating && tab === value ? 'page' : undefined} onClick={() => changeTab(value)} disabled={busy || Boolean(editing)}>{value[0].toUpperCase() + value.slice(1)}</button>)}{scope === 'community' && <button aria-current={creating ? 'page' : undefined} disabled={busy || Boolean(editing)} onClick={() => { setCreating(true); setDeck(null); setPending(null); setNotice(''); }}>＋ New deck / import</button>}</nav>
    <form className="admin-tools" onSubmit={searchRows} hidden={Boolean(editing) || creating}>
      {tab === 'decks' && <select aria-label="Community visibility" value={visibilityFilter} onChange={e => { setVisibilityFilter(e.target.value as 'public' | 'all'); setOffset(0); }}><option value="public">Public app library</option><option value="all">All decks & drafts</option></select>}
      {tab !== 'audit' && <><input aria-label={`Search ${tab}`} placeholder={`Search ${tab}`} value={search} onChange={e => setSearch(e.target.value)} maxLength={120} /><button disabled={busy}>Search</button></>}
      {tab === 'reviews' && <select aria-label="Review status" value={reviewFilter} onChange={e => { setReviewFilter(e.target.value); setOffset(0); }}><option value="pending">Pending</option><option value="rejected">Rejected</option><option value="approved">Approved</option></select>}
      {tab === 'reports' && <select aria-label="Report status" value={String(resolved)} onChange={e => { setResolved(e.target.value === 'true'); setOffset(0); }}><option value="false">Open</option><option value="true">Resolved</option></select>}
      <button type="button" onClick={() => void load()} disabled={busy}>Refresh</button>
    </form>
    {tab === 'reviews' && !editing && <p className="admin-review-note">Review can take up to 3 days. Submissions remain private until you approve them. Author edits to an approved deck send it back to review.</p>}
    {error && <div role="alert" className="admin-message admin-error">{error}<p><a href="/admin">Reload / sign in</a></p></div>}
    {notice && <p role="status">{notice}</p>}
    {pending && <div className="admin-confirm" role="region" aria-label="Confirm action"><div><strong>{pending.title}</strong>{pending.effect && <p className="admin-delete-effect">{pending.effect}</p>}</div>{pending.restrictionReason && <label className="admin-editor-label">Moderation reason<textarea value={restrictionReason} maxLength={1000} rows={3} onChange={e => setRestrictionReason(e.target.value)} /></label>}{pending.suspension && <label className="admin-editor-label">Suspension days<input type="number" value={suspensionDays} min={1} max={365} step={1} onChange={e => setSuspensionDays(Number(e.target.value))} /></label>}{pending.authorNote && <label className="admin-editor-label">Note to author (optional)<textarea value={adminNote} maxLength={1000} rows={3} placeholder="e.g. Removed due to inappropriate content" onChange={e => setAdminNote(e.target.value)} /></label>}{pending.reviewReason && <label className="admin-editor-label">Rejection reason<textarea value={reviewReason} maxLength={1000} rows={3} onChange={e => setReviewReason(e.target.value)} /></label>}{pending.username !== undefined && <input aria-label="New username" value={username} onChange={e => setUsername(e.target.value)} maxLength={24} />}<button className={pending.destructive ? 'admin-danger' : undefined} onClick={() => void confirm()} disabled={busy || Boolean(pending.reviewReason && !reviewReason.trim()) || Boolean(pending.restrictionReason && !restrictionReason.trim()) || Boolean(pending.suspension && (!Number.isInteger(suspensionDays) || suspensionDays < 1 || suspensionDays > 365))}>{pending.destructive ? 'Delete permanently' : 'Confirm'}</button><button onClick={() => setPending(null)} disabled={busy}>Cancel</button></div>}
    <div className="admin-table" aria-busy={busy} hidden={Boolean(editing) || creating}>
      <table><thead><tr>{(tab === 'decks' ? ['Deck', 'Author', 'Status', 'Dates', 'Activity', 'Actions'] : tab === 'reviews' ? ['Submission', 'Author', 'Submitted', 'Review', 'Actions'] : tab === 'profiles' ? ['Profile', 'Created', 'Decks', 'Actions'] : tab === 'restrictions' ? ['Account', 'Restriction', 'Reason', 'Actions'] : tab === 'reports' ? ['Deck', 'Report', 'Filed', 'Actions'] : ['Time', 'Admin', 'Action', 'Details']).map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{displayedRows.map((row, index) => <tr key={row.id || `${row.deck_id}-${row.user_id}-${index}`}>
          {tab === 'decks' && <><td>{row.name}{row.admin_note && <small>Admin note: {row.admin_note}</small>}<small>{row.category_tag} · {row.card_count} cards</small></td><td>{row.handle}</td><td>{row.status === 'deleted' ? 'Deleted' : row.admin_hidden ? 'Hidden' : row.review_status === 'pending' ? 'Pending review' : row.review_status === 'rejected' ? 'Rejected' : row.status}</td><td><small>Created {date(row.created_at)}</small><small>Published {date(row.published_at)}</small><small>Updated {date(row.updated_at)}</small></td><td>{row.download_count} downloads<small>{row.report_count} open reports</small></td><td><div className="actions"><button onClick={() => void preview(row.id!)} disabled={busy}>Preview</button>{row.status !== 'deleted' && <><button onClick={() => void preview(row.id!, true)} disabled={busy}>Edit</button><button onClick={() => visibility(row)} disabled={busy}>{row.admin_hidden ? 'Restore' : 'Hide'}</button><button className="admin-danger" onClick={() => deleteItem(row, 'deck')} disabled={busy}>Delete</button></>}</div></td></>}
          {tab === 'reviews' && <><td>{row.name}<small>{row.card_count} cards</small></td><td>{row.handle}</td><td>{date(row.submitted_at)}</td><td>{row.review_status}{row.review_message && <small>{row.review_message}</small>}{row.reviewed_at && <small>Reviewed {date(row.reviewed_at)}</small>}</td><td><div className="actions"><button disabled={busy} onClick={() => void preview(row.id!)}>Preview</button><button disabled={busy} onClick={() => void preview(row.id!, true)}>Edit</button>{row.review_status === 'pending' && <><button disabled={busy} onClick={() => decision(row, 'approve')}>Approve</button><button disabled={busy} className="admin-danger" onClick={() => decision(row, 'reject')}>Reject</button></>}</div></td></>}
          {tab === 'profiles' && <><td>{row.handle}<small>{row.profile_completed ? 'Complete' : 'Setup pending'}</small>{row.restriction_status === 'banned' || (row.restriction_status === 'suspended' && (row.until_at || 0) > Date.now() / 1000) ? <small>{row.restriction_status}{row.until_at ? ` until ${date(row.until_at)}` : ''}</small> : null}</td><td>{date(row.created_at)}</td><td>{row.deck_count}</td><td><div className="actions"><button disabled={busy} onClick={() => { setUsername(row.handle?.replace(/^@/, '') || ''); setPending({ title: `Rename ${row.handle}`, path: 'profiles/update', method: 'POST', body: { id: row.id }, username: row.handle }); }}>Rename</button><button disabled={busy} onClick={() => restrict(row, 'suspend')}>Suspend</button><button className="admin-danger" disabled={busy} onClick={() => restrict(row, 'ban')}>Ban</button>{row.restriction_status && row.restriction_status !== 'active' && <button disabled={busy} onClick={() => restrict(row, 'restore')}>Restore access</button>}<button className="admin-danger" disabled={busy} onClick={() => deleteItem(row, 'profile')}>Delete</button></div></td></>}
          {tab === 'reports' && <><td>{row.name}<small>{row.owner_handle} · {row.admin_hidden ? 'Hidden' : row.review_status === 'pending' ? 'Pending review' : row.review_status === 'rejected' ? 'Rejected' : row.status}</small></td><td>{row.reason}<small>Reported by {row.reporter_handle}</small></td><td>{date(row.created_at)}{row.resolved_at && <small>Resolved {date(row.resolved_at)}</small>}</td><td><div className="actions"><button disabled={busy} onClick={() => void preview(row.deck_id!)}>Preview</button>{row.status !== 'deleted' && <button disabled={busy} onClick={() => visibility(row)}>{row.admin_hidden ? 'Restore' : 'Hide'}</button>}{!resolved && <button disabled={busy} onClick={() => setPending({ title: 'Mark this report resolved?', path: 'reports/resolve', method: 'POST', body: { deckId: row.deck_id, userId: row.user_id, createdAt: row.created_at } })}>Resolve</button>}<button className="admin-danger" disabled={busy} onClick={() => deleteItem(row, 'report')}>Delete</button></div></td></>}
          {tab === 'restrictions' && <><td>{row.handle}</td><td>{row.status}{row.until_at && <small>Until {date(row.until_at)}</small>}<small>Updated {date(row.updated_at)}</small></td><td>{row.reason}</td><td><button disabled={busy} onClick={() => restrict(row, 'restore')}>Restore access</button></td></>}
          {tab === 'audit' && <><td>{date(row.created_at)}</td><td>{row.actor}</td><td>{row.action}<small>{row.target}</small></td><td><pre>{row.details}</pre></td></>}
        </tr>)}</tbody></table>
      {!displayedRows.length && <p className="admin-empty">{busy ? 'Loading…' : error ? 'Data unavailable.' : 'No results.'}</p>}
    </div>
    <div className="admin-paging" hidden={Boolean(editing) || creating}><button disabled={busy || offset === 0} onClick={() => setOffset(Math.max(0, offset - 50))}>Previous</button><small>Page {offset / 50 + 1}</small><button disabled={busy || next === null} onClick={() => setOffset(next!)}>Next</button></div>
    {creating && <NewDeck onDirtyChange={setEditorDirty} onCreated={async id => { setCreating(false); setTab('decks'); setNotice('Draft created.'); await preview(id, true); }} />}
    {editing && <DeckEditor onDirtyChange={setEditorDirty} key={editing.id} deck={editing} onUpload={file => uploadAdminMedia(editing.id, file)} onPublish={editing.status === 'draft' && editing.admin_created === 1 && !['pending','rejected'].includes(editing.review_status || '') ? async body => { await api(`decks/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) }); const current = await api<{ deck: EditableDeck }>(`decks/${editing.id}`); await api(`decks/${editing.id}/publish`, { method: 'POST', body: JSON.stringify({ expectedRevision: current.deck.revision }) }); setEditing(null); setNotice('Deck published.'); await load(); } : undefined} onClose={() => { setEditing(null); void load(); }} onSave={async body => { await api(`decks/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) }); setEditing(null); setNotice('Deck saved.'); await load(); }} />}
    {deck && <section className="admin-detail" aria-label="Deck preview"><header><h2>{deck.name}</h2><button onClick={() => setDeck(null)}>Close preview</button></header><p>{deck.description}</p>{deck.admin_note && <p className="admin-review-note">Note to author: {deck.admin_note}</p>}{deck.review_status && <p className="admin-review-note">Review: {deck.review_status} · Submitted {date(deck.submitted_at)}{deck.review_message ? ` · ${deck.review_message}` : ''}</p>}<small>{deck.handle} · {deck.cards.length} cards</small><p className="admin-dates"><small>Created {date(deck.created_at)} · Published {date(deck.published_at)} · Updated {date(deck.updated_at)}</small></p>{deck.cards.map((card, index) => <article className="admin-card" key={card.id || index}><small>Card {index + 1}</small><AdminCardPreview card={card} /></article>)}</section>}
  </section>;
}
