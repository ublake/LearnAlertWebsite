'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { adminAPI, uploadCatalogMedia } from './admin-client';
import { JSONInspector, OptionalCardFields } from './catalog-inspector';
import { atPath, blankCard, blankDocument, countDocument, documentTree, duplicateDocument, duplicateNode, friendly, removeAt, replaceAt, templateFor, type CatalogKind, type CatalogRecord, type CatalogSummary, type JSONObject, type JSONValue, type NodePath, type TreeNode } from './catalog-model';

type Validation = { valid?: boolean; errors?: (string | { path?: string; message?: string })[]; warnings?: (string | { path?: string; message?: string })[] };
const stamp = (time?: number) => time ? new Date(time < 1e12 ? time * 1000 : time).toLocaleString() : 'Never';
const samePath = (a: NodePath, b: NodePath) => JSON.stringify(a) === JSON.stringify(b);
function download(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}
function TreeRow({ node, selected, search, depth = 0, onSelect }: { node: TreeNode; selected: NodePath; search: string; depth?: number; onSelect: (path: NodePath) => void }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const matches = (value: TreeNode): boolean => !search || `${value.label} ${value.type} ${value.detail || ''}`.toLowerCase().includes(search) || value.children.some(matches);
  if (!matches(node)) return null;
  return <div className="catalog-tree-node"><div className={`catalog-tree-row${samePath(node.path, selected) ? ' is-selected' : ''}`} style={{ paddingLeft: 7 + depth * 13 }}>
    <button className="catalog-tree-expand" title={expanded ? 'Collapse' : 'Expand'} disabled={!node.children.length} onClick={() => setExpanded(!expanded)} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.label}`}>{node.children.length ? expanded || search ? '⌄' : '›' : '·'}</button>
    <button className="catalog-tree-label" onClick={() => onSelect(node.path)} aria-current={samePath(node.path, selected) ? 'true' : undefined}><span className={`catalog-node-kind kind-${node.type.toLowerCase().replace(' ', '-')}`}>{node.type}</span><span>{node.label}</span>{node.children.length > 0 && <small>{node.children.length}</small>}</button>
  </div>{(expanded || search) && node.children.map(child => <TreeRow key={JSON.stringify(child.path)} node={child} selected={selected} search={search} depth={depth + 1} onSelect={onSelect} />)}</div>;
}

export function CatalogWorkspace({ kind, onDirtyChange }: { kind: CatalogKind; onDirtyChange: (dirty: boolean) => void }) {
  const [items, setItems] = useState<CatalogSummary[]>([]);
  const [record, setRecord] = useState<CatalogRecord | null>(null);
  const [document, setDocument] = useState<JSONObject | null>(null);
  const [path, setPath] = useState<NodePath>([]);
  const [sortOrder, setSortOrder] = useState('0');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [outlineSearch, setOutlineSearch] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState<'fields' | 'json' | 'preview'>('fields');
  const [json, setJSON] = useState('');
  const [jsonScope, setJSONScope] = useState<'selection' | 'document'>('selection');
  const [validation, setValidation] = useState<Validation | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [history, setHistory] = useState<{ revision: number; action?: string; actor?: string; createdAt?: number }[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [mediaProgress, setMediaProgress] = useState('');
  const [mediaTarget, setMediaTarget] = useState('promptImageName');
  const [uploaded, setUploaded] = useState<{ id: string; name: string }[]>([]);
  const importInput = useRef<HTMLInputElement>(null);
  const requestSequence = useRef(0);
  const title = kind === 'course' ? 'Courses' : 'Exam & certification prep';
  const loadItems = useCallback(async () => {
    const data = await adminAPI<{ items: CatalogSummary[] }>(`catalog?kind=${kind}`);
    setItems(data.items || []);
  }, [kind]);
  useEffect(() => { setBusy(true); void loadItems().catch(e => setError((e as Error).message)).finally(() => setBusy(false)); }, [loadItems]);
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  useEffect(() => { const timer = window.setInterval(() => { if (!dirty && !busy && window.document.visibilityState === 'visible') void loadItems().catch(() => {}); }, 30000); return () => window.clearInterval(timer); }, [dirty, busy, loadItems]);
  const selected = document ? atPath(document, path) : null;
  const selectedObject = selected && !Array.isArray(selected) && typeof selected === 'object' ? selected : null;
  const tree = useMemo(() => document ? documentTree(document, kind) : null, [document, kind]);
  const counts = useMemo(() => document ? countDocument(document) : null, [document]);
  const visible = items.filter(item => (filter === 'all' || item.status === filter) && `${item.title || item.name || item.id} ${item.id}`.toLowerCase().includes(search.toLowerCase()));
  function canLeave() { return !dirty || window.confirm('Discard unsaved changes? Download JSON first if you want to keep a local copy.'); }
  function accept(data: CatalogRecord) { setRecord(data); setDocument(data.document); setSortOrder(String(data.sortOrder ?? 0)); setPath([]); setDirty(false); setEditor('fields'); setValidation(null); setHistory(null); setPendingDelete(false); setConflict(false); setUploaded([]); }
  async function open(id: string, force = false) {
    if (!force && !canLeave()) return;
    const sequence = ++requestSequence.current;
    setBusy(true); setError(''); setNotice('');
    try { const result = await adminAPI<{ item: CatalogRecord }>(`catalog/${id}`); if (sequence === requestSequence.current) accept(result.item); }
    catch (e) { setError((e as Error).message); } finally { if (sequence === requestSequence.current) setBusy(false); }
  }
  function change(next: JSONValue, target = path) {
    if (!document) return;
    setDocument(replaceAt(document, target, next) as JSONObject); setDirty(true); setValidation(null); setNotice('');
  }
  function select(next: NodePath) {
    if (editor === 'json' && json !== JSON.stringify(jsonScope === 'document' ? document : selected, null, 2) && !window.confirm('Discard unapplied JSON edits?')) return;
    setPath(next); setEditor('fields'); setPendingDelete(false);
  }
  async function create(source?: JSONObject, sourceCatalogID?: string) {
    if (!canLeave()) return;
    setBusy(true); setError('');
    try { const document = source || blankDocument(kind); const result = await adminAPI<{ item: CatalogRecord }>('catalog', { method: 'POST', body: JSON.stringify({ id: document.id, kind, document, sortOrder: Math.max(-10, ...items.map(item => item.sortOrder ?? 0)) + 10, ...(sourceCatalogID ? { sourceCatalogID } : {}) }) }); accept(result.item); await loadItems(); setNotice('Draft created. It is not visible in the app until published.'); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  function draftWithJSON() {
    if (!document || editor !== 'json') return document;
    const parsed = JSON.parse(json) as JSONValue;
    if (jsonScope === 'document' && (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))) throw new Error('The complete document must be one JSON object.');
    return (jsonScope === 'document' ? parsed : replaceAt(document, path, parsed)) as JSONObject;
  }
  async function validateDraft() {
    if (!record) return;
    setBusy(true); setError('');
    try { const next = draftWithJSON(); const result = await adminAPI<Validation>('catalog/validate', { method: 'POST', body: JSON.stringify({ kind, document: next }) }); setValidation(result); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function save(publish = false) {
    if (!record) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const next = draftWithJSON();
      if (!sortOrder.trim() || !Number.isFinite(Number(sortOrder))) throw new Error('Enter a finite number for the catalog order. Lower numbers appear first.');
      const saved = await adminAPI<{ item: CatalogRecord }>(`catalog/${record.id}`, { method: 'PUT', body: JSON.stringify({ document: next, sortOrder: Number(sortOrder), expectedRevision: record.revision }) });
      accept(saved.item);
      if (publish) {
        const live = await adminAPI<{ item: CatalogRecord }>(`catalog/${record.id}/publish`, { method: 'POST', body: JSON.stringify({ expectedRevision: saved.item.revision }) });
        accept(live.item);
      }
      await loadItems(); setNotice(publish ? 'Published. The app receives this version when it refreshes its catalog.' : 'Draft saved. The published version stays live until you publish.');
    } catch (e) { const message = (e as Error).message; setError(message); setConflict(/revision|conflict|changed|409/i.test(message)); } finally { setBusy(false); }
  }
  async function lifecycle(action: 'archive' | 'delete') {
    if (!record) return;
    if (dirty && !canLeave()) return;
    if (!window.confirm(action === 'delete' ? 'Delete this entry from the catalog? It can be restored from the Archived filter. Existing device-local copies remain.' : 'Archive this entry? It will no longer be offered in the app. Existing device-local copies remain.')) return;
    setBusy(true); setError('');
    try {
      const result = await adminAPI<{ item?: CatalogRecord }>(`catalog/${record.id}${action === 'archive' ? '/archive' : ''}`, { method: action === 'archive' ? 'POST' : 'DELETE', body: JSON.stringify({ expectedRevision: record.revision }) });
      if (result.item) accept(result.item); else { setRecord(null); setDocument(null); setDirty(false); }
      await loadItems(); setNotice(action === 'delete' ? 'Entry removed from the catalog. It is available under Archived.' : 'Entry archived.');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function restore(revision?: number) {
    if (!record || !canLeave()) return;
    if (!window.confirm(revision ? `Restore revision ${revision} into a new draft? Publish it separately when ready.` : 'Restore this entry as a draft?')) return;
    setBusy(true); setError('');
    try { const result = await adminAPI<{ item: CatalogRecord }>(`catalog/${record.id}/restore`, { method: 'POST', body: JSON.stringify({ expectedRevision: record.revision, revision }) }); accept(result.item); await loadItems(); setNotice('Restored as a draft. Publish when ready.'); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function revisions() {
    if (!record) return;
    setBusy(true); setError('');
    try { const result = await adminAPI<{ items: NonNullable<typeof history> }>(`catalog/${record.id}/history`); setHistory(result.items); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  function add(field: string) {
    if (!selectedObject) return;
    const next = { ...selectedObject };
    if (field === 'guideTopics' || field === 'guidePresentation') {
      const unitID = String(selectedObject.id);
      const map = (document?.[field === 'guideTopics' ? 'guides' : 'guidePresentation'] || {}) as JSONObject;
      if (field === 'guidePresentation') { change({ ...map, [unitID]: templateFor(field) }, ['guidePresentation']); setPath(['guidePresentation', unitID]); }
      else { const topics = Array.isArray(map[unitID]) ? [...map[unitID]] : []; topics.push(templateFor(field)); change({ ...map, [unitID]: topics }, ['guides']); setPath(['guides', unitID, topics.length - 1]); }
      return;
    }
    if (field === 'checkpointQuiz') { next[field] = templateFor(field); change(next); setPath([...path, field]); return; }
    const list = Array.isArray(next[field]) ? [...next[field]] : [];
    const item = field === 'cards' || field === 'questions' ? blankCard(kind === 'course') : templateFor(field);
    if (field === 'units') item.unitNumber = list.length + 1;
    if (field === 'lessons') item.lessonNumber = list.length + 1;
    list.push(item); next[field] = list; change(next); setPath([...path, field, list.length - 1]);
  }
  function move(delta: number) {
    if (!document || typeof path.at(-1) !== 'number') return;
    const parentPath = path.slice(0, -1), values = atPath(document, parentPath);
    if (!Array.isArray(values)) return;
    const index = Number(path.at(-1)), to = index + delta;
    if (to < 0 || to >= values.length) return;
    const next = [...values]; [next[index], next[to]] = [next[to], next[index]];
    // Sequence numbers follow the displayed order; stable content IDs are preserved.
    const normalized = next.map((item, i) => item && typeof item === 'object' && !Array.isArray(item) ? { ...item, ...('unitNumber' in item ? { unitNumber: i + 1 } : {}), ...('lessonNumber' in item ? { lessonNumber: i + 1 } : {}) } : item);
    change(normalized, parentPath); setPath([...parentPath, to]);
  }
  function duplicate() {
    if (!document || !selectedObject) return;
    if (!path.length) {
      const copy = duplicateDocument(document);
      if (kind === 'course') copy.title = `${document.title} (copy)`;
      else copy.name = `${document.name} (copy)`;
      void create(copy, record?.id); return;
    }
    const parentPath = path.slice(0, -1), parent = atPath(document, parentPath);
    const copy = duplicateNode(selectedObject) as JSONObject;
    if (Array.isArray(parent)) {
      const index = Number(path.at(-1));
      const next = [...parent]; next.splice(index + 1, 0, copy);
      next.forEach((item, i) => { if (item && typeof item === 'object' && !Array.isArray(item)) { if ('unitNumber' in item) next[i] = { ...item, unitNumber: i + 1 }; if ('lessonNumber' in item) next[i] = { ...item, lessonNumber: i + 1 }; } });
      let root = replaceAt(document, parentPath, next) as JSONObject;
      if ('unitNumber' in selectedObject) {
        for (const field of ['guides','guidePresentation']) {
          const map = document[field] as JSONObject | undefined;
          if (map?.[String(selectedObject.id)]) root = { ...root, [field]: { ...map, [String(copy.id)]: duplicateNode(map[String(selectedObject.id)]) } };
        }
      }
      setDocument(root); setDirty(true); setPath([...parentPath, index + 1]);
    } else if (String(path.at(-1)) === 'checkpointQuiz') {
      const units = document.units as JSONObject[];
      const unitIndex = Number(path[1]);
      const lessons = units[unitIndex]?.lessons as JSONObject[] || [];
      copy.nodeType = 'checkpoint'; copy.cards = copy.questions || []; delete copy.questions;
      copy.lessonNumber = lessons.length + 1; copy.subtitle = copy.summary || ''; copy.estimatedMinutes = 5;
      const next = { ...units[unitIndex], lessons: [...lessons, copy] };
      change(next, ['units', unitIndex]); setPath(['units', unitIndex, 'lessons', lessons.length]);
    }
  }
  async function importJSON(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try { const parsed = JSON.parse(await file.text()); const source = parsed.document || parsed; if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('Import one complete course or exam deck JSON object.'); await create(source); }
    catch (e) { setError((e as Error).message); }
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files || [])]; event.target.value = ''; if (!record || !files.length) return;
    setBusy(true); setError('');
    try { const results: { id: string; name: string }[] = []; for (const [index, file] of files.entries()) { setMediaProgress(`Uploading ${index + 1}/${files.length}: ${file.name}`); results.push({ id: await uploadCatalogMedia(record.id, file), name: file.name }); } setUploaded(current => [...current, ...results]); if (results.length === 1 && selectedObject) change({ ...selectedObject, [mediaTarget]: results[0].id }); setNotice(results.length === 1 ? `Attached to ${mediaTarget}. Save the draft to keep this change.` : 'Media uploaded. Copy IDs into the relevant media fields.'); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); setMediaProgress(''); }
  }
  const parent = document && path.length ? atPath(document, path.slice(0, -1)) : null;
  const selectedIndex = typeof path.at(-1) === 'number' ? Number(path.at(-1)) : -1;
  const canAdd = selectedObject ? !path.length ? kind === 'course' ? ['units'] : ['cards'] : 'unitNumber' in selectedObject ? ['lessons','guideTopics', ...(!((document?.guidePresentation as JSONObject | undefined)?.[String(selectedObject.id)]) ? ['guidePresentation'] : []), ...(!selectedObject.checkpointQuiz ? ['checkpointQuiz'] : [])] : 'lessonNumber' in selectedObject ? ['cards'] : 'passingScoreThreshold' in selectedObject ? ['questions'] : [] : [];
  return <section className="catalog-workspace" aria-label={title}>
    <aside className="catalog-browser"><div className="catalog-pane-heading"><strong>{title}</strong><span>{items.length}</span></div><div className="catalog-browser-actions"><button disabled={busy} onClick={() => void create()}>＋ New {kind === 'course' ? 'course' : 'deck'}</button><button disabled={busy} onClick={() => importInput.current?.click()}>Import JSON</button><input type="file" ref={importInput} accept=".json,application/json" hidden onChange={e => void importJSON(e)} /></div>
      <div className="catalog-search"><input aria-label={`Search ${title}`} placeholder="Filter catalog…" value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Publication status" value={filter} onChange={e => setFilter(e.target.value)}>{['all','draft','published','archived'].map(option => <option key={option} value={option}>{friendly(option)}</option>)}</select></div>
      <div className="catalog-list">{visible.map(item => <button disabled={busy} key={item.id} className={record?.id === item.id ? 'is-selected' : ''} onClick={() => void open(item.id)}><span className="catalog-item-title">{item.title || item.name || item.id}</span><span className="catalog-item-meta"><span className={`catalog-status status-${item.status}`}>{item.status}</span><span>r{item.revision} · {item.cardCount ?? '—'} cards</span></span></button>)}{!visible.length && <p className="catalog-empty">{busy ? 'Loading catalog…' : 'No entries match.'}</p>}</div>
      <div className="catalog-browser-footer"><button disabled={busy} onClick={() => { void loadItems().catch(e => setError((e as Error).message)); }}>↻ Refresh</button><button onClick={() => setShowHelp(!showHelp)}>AI format & help</button></div>
    </aside>
    <div className="catalog-main">
      {error && <div className="admin-message admin-error" role="alert">{error}{conflict && <div className="actions"><button onClick={() => document && download(`${record?.id}-unsaved.json`, draftWithJSON())}>Download my changes</button><button onClick={() => { setDirty(false); if (record) void open(record.id, true); }}>Reload current version</button></div>}</div>}
      {(notice || mediaProgress) && <p className="catalog-notice" role="status">{mediaProgress || notice}</p>}
      {showHelp && <CatalogHelp kind={kind} onClose={() => setShowHelp(false)} />}
      {record && document && tree ? <>
        <header className="catalog-document-header"><div><h2>{String(document.title || document.name || 'Untitled')}</h2><div className="catalog-document-meta"><span className={`catalog-status status-${record.status}`}>{record.status}</span><code>{record.id}</code><span>Draft r{record.revision}</span><span>Live {record.publishedRevision ? `r${record.publishedRevision}` : '—'}</span>{dirty && <b>Unsaved</b>}</div></div><div className="actions"><button disabled={busy} onClick={() => void validateDraft()}>Validate</button><button disabled={busy || !dirty} onClick={() => void save()}>Save draft</button><button className="catalog-primary" disabled={busy} onClick={() => { if (window.confirm('Publish this draft to the app catalog? It becomes the live version for everyone.')) void save(true); }}>Publish</button><details className="catalog-menu"><summary aria-label="Entry actions">•••</summary><div><button onClick={() => download(`${record.id}.json`, draftWithJSON())}>Export JSON</button><button disabled={busy || editor === 'json'} onClick={duplicate}>Duplicate entry</button><button disabled={busy} onClick={() => void revisions()}>Revision history</button><button disabled={busy || record.status === 'archived'} onClick={() => void lifecycle('archive')}>Archive</button>{['archived','deleted'].includes(record.status) && <button disabled={busy} onClick={() => void restore()}>Restore to draft</button>}</div></details></div></header>
        <div className="catalog-metrics"><label className="catalog-order" title="Lower numbers appear first in the app catalog. Save draft to apply.">Order<input aria-label="Catalog order" type="number" step="any" disabled={busy} value={sortOrder} onChange={e => { setSortOrder(e.target.value); setDirty(true); setNotice(''); }} /></label><span>{counts?.units} units</span><span>{counts?.lessons} lessons</span><span>{counts?.cards} cards</span><span>{counts?.guides} guides</span><span className="catalog-metrics-date">Saved {stamp(record.updatedAt)}</span></div>
        {validation && <div className={`catalog-validation${validation.valid === false || validation.errors?.length ? ' has-errors' : ''}`} role="status"><strong>{validation.valid === false || validation.errors?.length ? 'Needs attention' : 'Validation passed'}</strong>{[...(validation.errors || []), ...(validation.warnings || [])].map((issue, index) => <p key={index}>{typeof issue === 'string' ? issue : `${issue.path || ''}: ${issue.message || ''}`}</p>)}</div>}
        {history && <div className="catalog-history"><div className="catalog-pane-heading"><strong>Revision history</strong><button onClick={() => setHistory(null)}>×</button></div>{history.map(entry => <div key={entry.revision}><b>r{entry.revision}</b><span>{entry.action}</span><span>{entry.actor}</span><time>{stamp(entry.createdAt)}</time><button disabled={busy} onClick={async () => { setError(''); try { const result = await adminAPI<{ item: CatalogRecord }>(`catalog/${record.id}?revision=${entry.revision}`); download(`${record.id}-r${entry.revision}.json`, result.item.document); } catch (e) { setError((e as Error).message); } }}>Export</button><button disabled={busy} onClick={() => void restore(entry.revision)}>Restore to draft</button></div>)}</div>}
        <div className="catalog-editor-split"><aside className="catalog-outline"><div className="catalog-pane-heading"><strong>Outline</strong><span>Click to edit</span></div><input aria-label="Search outline" placeholder="Find a unit, lesson, card…" value={outlineSearch} onChange={e => setOutlineSearch(e.target.value)} /><div className="catalog-tree"><TreeRow node={tree} selected={path} search={outlineSearch.toLowerCase()} onSelect={select} /></div></aside>
          <div className="catalog-inspector"><div className="catalog-selection-heading"><div><small>{path.length ? path.map(part => typeof part === 'number' ? part + 1 : friendly(part)).join(' / ') : 'Course / deck details'}</small><h3>{String(selectedObject?.title || selectedObject?.name || selectedObject?.question || (path[0] === 'guides' ? 'Guide' : 'Details')).slice(0, 160)}</h3></div><div className="actions">{canAdd.map(field => <button disabled={busy || editor === 'json'} key={field} onClick={() => add(field)}>＋ {field === 'checkpointQuiz' ? 'Checkpoint' : field === 'guideTopics' ? 'Guide' : field === 'guidePresentation' ? 'Guide display' : friendly(field.replace(/s$/, ''))}</button>)}{path.length > 0 && <><button aria-label="Move selected item up" disabled={busy || editor === 'json' || !Array.isArray(parent) || selectedIndex <= 0} onClick={() => move(-1)}>↑</button><button aria-label="Move selected item down" disabled={busy || editor === 'json' || !Array.isArray(parent) || selectedIndex >= parent.length - 1} onClick={() => move(1)}>↓</button><button disabled={busy || editor === 'json' || !Array.isArray(parent) && path.at(-1) !== 'checkpointQuiz'} onClick={duplicate}>Duplicate</button><button disabled={busy || editor === 'json'} className="admin-danger" onClick={() => setPendingDelete(true)}>Delete</button></>}</div></div>
          {pendingDelete && <div className="admin-confirm"><strong>Remove this {path[0] === 'guides' ? 'guide' : 'item'} and everything inside it?</strong><span>The change stays in this draft until you save and publish.</span><button className="admin-danger" onClick={() => { let next = removeAt(document, path) as JSONObject; if (selectedObject && 'unitNumber' in selectedObject) for (const field of ['guides','guidePresentation']) { const map = document[field]; if (map && typeof map === 'object' && !Array.isArray(map)) next = { ...next, [field]: Object.fromEntries(Object.entries(map).filter(([key]) => key !== selectedObject.id)) }; } setDocument(next); setDirty(true); setPath(path[0] === 'guides' || path[0] === 'guidePresentation' ? [] : path.slice(0, -2)); setPendingDelete(false); }}>Remove from draft</button><button onClick={() => setPendingDelete(false)}>Keep</button></div>}
          <div className="catalog-editor-tabs"><button aria-current={editor === 'fields' ? 'page' : undefined} onClick={() => { if (editor === 'json') { try { const next = draftWithJSON(); if (next) { setDocument(next); setDirty(true); } } catch (e) { setError((e as Error).message); return; } } setEditor('fields'); }}>Fields</button><button aria-current={editor === 'json' ? 'page' : undefined} disabled={editor === 'json'} onClick={() => { setJSON(JSON.stringify(jsonScope === 'document' ? document : selected, null, 2)); setEditor('json'); }}>JSON</button>{selectedObject && 'cardType' in selectedObject && <button aria-current={editor === 'preview' ? 'page' : undefined} onClick={() => { if (editor === 'json') { try { const next = draftWithJSON(); if (next) { setDocument(next); setDirty(true); } } catch (e) { setError((e as Error).message); return; } } setEditor('preview'); }}>Preview</button>}<span>All fields are preserved</span></div>
          <fieldset disabled={busy} className="catalog-inspector-body">{editor === 'fields' && selected && <><JSONInspector key={JSON.stringify(path)} value={selected} onChange={change} /><OptionalCardFields value={selectedObject || {}} onChange={change} /></>}
            {editor === 'json' && <><div className="catalog-json-toolbar"><select aria-label="JSON scope" value={jsonScope} onChange={e => { if (json !== JSON.stringify(jsonScope === 'document' ? document : selected, null, 2) && !window.confirm('Discard unapplied JSON edits before changing scope?')) return; const scope = e.target.value as typeof jsonScope; setJSONScope(scope); setJSON(JSON.stringify(scope === 'document' ? document : selected, null, 2)); }}><option value="selection">Selected item</option><option value="document">Complete document</option></select><button type="button" onClick={() => { try { setJSON(JSON.stringify(JSON.parse(json), null, 2)); setError(''); } catch (e) { setError((e as Error).message); } }}>Format JSON</button><small>Save draft applies this JSON. Unknown fields stay intact.</small></div><textarea className="admin-json catalog-json" aria-label="Catalog JSON" spellCheck={false} value={json} onChange={e => { setJSON(e.target.value); setDirty(true); }} /></>}
            {editor === 'preview' && selectedObject && <CatalogCardPreview card={selectedObject} />}
            {selectedObject && 'cardType' in selectedObject && editor !== 'json' && <details className="catalog-media"><summary>Images & audio</summary><div className="actions"><select aria-label="Attachment target field" value={mediaTarget} onChange={e => setMediaTarget(e.target.value)}>{['promptImageName','answerImageName','promptAudioName'].map(field => <option key={field} value={field}>{friendly(field)}</option>)}</select><label className="admin-upload-button">Upload files<input type="file" accept=".png,.jpg,.jpeg,.mp3,.m4a,.wav" multiple onChange={e => void upload(e)} /></label></div><small>One file attaches to the selected target. For choices and other fields, use the returned media IDs in JSON. Bundled image names remain supported.</small>{uploaded.map(file => <div className="catalog-uploaded" key={file.id}><span>{file.name}</span><code>{file.id}</code><button onClick={() => void navigator.clipboard.writeText(file.id).catch(() => setError('Select and copy the media ID manually.'))}>Copy ID</button></div>)}</details>}
          </fieldset></div>
        </div>
      </> : <div className="catalog-welcome"><span>▤</span><h2>Your app catalog, in one workspace.</h2><p>Select an entry to edit its full structure, or start with a blank draft. Saving and publishing are separate actions.</p><div className="actions"><button disabled={busy} onClick={() => void create()}>＋ New {kind === 'course' ? 'course' : 'exam deck'}</button><button onClick={() => setShowHelp(true)}>AI JSON format</button></div></div>}
    </div>
  </section>;
}

function CatalogCardPreview({ card }: { card: JSONObject }) {
  const imageURL = (name: string) => /^catalog:[a-f0-9-]{36}$/i.test(name) ? `/admin/api/catalog/media/${name.slice(8)}` : name.startsWith('https://') ? name : null;
  const fields = (card.fieldMedia || {}) as JSONObject;
  function media(key: string, image?: JSONValue, audio?: JSONValue) {
    const field = fields[key] && typeof fields[key] === 'object' && !Array.isArray(fields[key]) ? fields[key] as JSONObject : {};
    const imageName = String(field.image || field.imageID || image || ''), audioName = String(field.audio || field.audioID || audio || '');
    return <>{imageName && (imageURL(imageName) ? <img src={imageURL(imageName)!} alt={friendly(key)} /> : <code>Bundled image: {imageName}</code>)}{audioName && (imageURL(audioName) ? <audio controls preload="none" src={imageURL(audioName)!} aria-label={`${friendly(key)} audio`} /> : <code>Bundled audio: {audioName}</code>)}</>;
  }
  const activity = card.activity && typeof card.activity === 'object' && !Array.isArray(card.activity) ? card.activity as JSONObject : null;
  const exercise = activity?.exercise && typeof activity.exercise === 'object' && !Array.isArray(activity.exercise) ? activity.exercise as JSONObject : null;
  if (exercise && ['pictureChoice', 'wordBank', 'exposure'].includes(String(exercise.format))) {
    const pictures = Array.isArray(exercise.pictures) ? exercise.pictures as JSONObject[] : [];
    const tiles = Array.isArray(exercise.tiles) ? exercise.tiles as JSONObject[] : [];
    return <article className="catalog-card-preview">
      <small>Practice preview · {String(exercise.format)}</small><h3>{String(card.question || '')}</h3>
      {exercise.format === 'pictureChoice' && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:12}}>
        {pictures.map(picture => <div key={String(picture.id)} style={{padding:12,border:'1px solid currentColor',borderRadius:14}}>
          {imageURL(String(picture.image)) ? <img src={imageURL(String(picture.image))!} alt={String(picture.description)} style={{objectFit:'contain',height:124,width:'100%',background:'transparent'}}/> : <p>Missing uploaded picture reference</p>}
          <p>{String(picture.description)}</p>{picture.id === exercise.correctChoiceID && <small>Correct choice</small>}
        </div>)}
      </div>}
      {exercise.format === 'wordBank' && <><p>Tap words to build a sentence in the app.</p><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{tiles.map(tile => <span key={String(tile.id)} style={{padding:'10px 14px',border:'1px solid currentColor',borderRadius:12}}>{String(tile.text)}</span>)}</div></>}
      {exercise.format === 'exposure' && <>{media('prompt', card.promptImageName)}<p>{String(card.correctAnswer || '')}</p><p>{String(card.hint || '')}</p></>}
      {activity?.rule && <details><summary>Optional Why?</summary><p>{String(activity.rule)}</p></details>}
      <details><summary>Reviewed answer and links</summary><p>{String(card.correctAnswer)}</p><pre>{JSON.stringify({vocabularyIDs:exercise.vocabularyIDs,conceptIDs:exercise.conceptIDs,acceptedOrders:exercise.acceptedOrders},null,2)}</pre></details>
      <small>Author preview; native interaction and accessibility still require device verification.</small>
    </article>;
  }
  return <article className="catalog-card-preview"><small>{String(card.cardType || 'Card')}</small>{media('prompt', card.promptImageName, card.promptAudioName)}<h3>{String(card.question || '')}</h3>{card.speechText && <p>🔊 {String(card.speechText)}</p>}{Array.isArray(card.options) && card.options.length > 0 && <ol>{card.options.map((option, index) => <li key={index} className={index === card.correctOptionIndex || option === card.correctAnswer ? 'is-correct' : ''}>{media(`option:${index}`, Array.isArray(card.optionImageNames) ? card.optionImageNames[index] : undefined)}{String(option)}{(index === card.correctOptionIndex || option === card.correctAnswer) && <b> ✓</b>}</li>)}</ol>}{Array.isArray(card.matchingLeftItems) && card.matchingLeftItems.length > 0 && <dl>{card.matchingLeftItems.map((left, index) => <div key={index}><dt>{media(`left:${index}`)}{String(left)}</dt><dd>{media(`right:${index}`)}{String((card.matchingRightItems as JSONValue[] || [])[index] || '')}</dd></div>)}</dl>}<div className="catalog-preview-answer"><small>Answer</small>{media('answer', card.answerImageName)}<p>{String(card.correctAnswer || '')}</p></div>{card.hint && <p><small>Hint</small> {String(card.hint)}</p>}{media('hint')}{card.explanation && <p>{String(card.explanation)}</p>}{card.grammarNote && <p>{String(card.grammarNote)}</p>}{card.vocabularyItem && typeof card.vocabularyItem === 'object' && <dl>{Object.entries(card.vocabularyItem).map(([key,value]) => value ? <div key={key}><dt>{friendly(key)}</dt><dd>{String(value)}</dd></div> : null)}</dl>}<small>Content preview. The app supplies its own interactive layout.</small></article>;
}
function CatalogHelp({ kind, onClose }: { kind: CatalogKind; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const prompt = `Build a LearnAlert ${kind === 'course' ? 'course' : 'exam deck'} using the attached exported document and admin-catalog-format.md. Return one complete JSON document, without markdown. Preserve existing content IDs, guide unit-ID keys, required fields and unknown properties. Use new unique IDs for additions. Course activities, checkpoints, guides, vocabulary, accepted answers and media must follow the downloadable JSON schema. Do not claim assets exist; reference only supplied bundled names or uploaded catalog:UUID media IDs. Keep questions accurate, clear and varied. Validate locally against the schema. This will be imported as a draft for review, never auto-published.`;
  return <div className="catalog-help"><header><h3>Build with AI, edit every detail</h3><button onClick={onClose}>×</button></header><p>Export an existing entry as the source of truth. Ask your AI to keep existing IDs unchanged, add new unique IDs for new items, and return the complete JSON document. Import creates a separate draft; paste into Complete document JSON to update an existing entry.</p><div className="actions"><a className="admin-link" href={`/admin-${kind}-template.json`} download>Complete example</a><button onClick={() => download(`learnalert-${kind}-blank.json`, blankDocument(kind))}>Blank draft</button><button onClick={() => void navigator.clipboard.writeText(prompt).then(() => setCopied(true)).catch(() => setCopied(false))}>{copied ? 'Copied AI prompt' : 'Copy AI prompt'}</button><a className="admin-link" href="/admin-catalog-format.md" download>Format guide & AI instructions</a><a className="admin-link" href="/admin-catalog-schema.json" download>JSON schema</a></div><details><summary>AI prompt & editing guide</summary><pre>{prompt}</pre><p>Course metadata → units → section guides, lessons and checkpoints → questions, answer choices, vocabulary details, accepted answers, audio, images and interactive activity metadata. Exams use deck metadata and cards. The structured inspector exposes every JSON property, and lets you add optional fields. Nested content is selected in the outline. Reorder with the arrow buttons; duplicate creates fresh IDs.</p><p>Save draft preserves the current live revision. Validate checks the app contract. Publish makes the saved content live. Archive removes it from the offered catalog. Revision checks prevent one editor silently overwriting another.</p></details></div>;
}
