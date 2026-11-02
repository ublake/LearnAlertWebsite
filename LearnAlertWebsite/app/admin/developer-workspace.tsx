'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AdminAPIError, adminAPI } from './admin-client';

type Developer = {
  id: string;
  author_id: string;
  handle: string;
  created_at: number;
  profile_completed: number;
  is_developer: number;
  developer_anki_uploads: number;
  restriction_status?: string;
  until_at?: number;
};
type Access = { isDeveloper: boolean; allowAnkiUploads: boolean };
type RoleFilter = 'all' | 'developer';
type RowError = { message: string; stale: boolean };
const accessFor = (user: Developer): Access => ({ isDeveloper: Boolean(user.is_developer), allowAnkiUploads: Boolean(user.developer_anki_uploads) });
const effectiveAccessFor = (user: Developer): Access => ({ ...accessFor(user), allowAnkiUploads: Boolean(user.is_developer && user.developer_anki_uploads) });
const sameAccess = (left: Access, right: Access) => left.isDeveloper === right.isDeveloper && left.allowAnkiUploads === right.allowAnkiUploads;
const date = (seconds?: number) => seconds ? new Date(seconds * 1000).toLocaleString() : '—';

export function DeveloperWorkspace({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [users, setUsers] = useState<Developer[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [pages, setPages] = useState([0]);
  const [next, setNext] = useState<number | null>(null);
  const [listStale, setListStale] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Access>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, RowError>>({});
  const [saving, setSaving] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const sequence = useRef(0);
  const listRequest = useRef<AbortController | null>(null);
  const saveRequests = useRef(new Map<string, AbortController>());
  const mounted = useRef(true);
  const dirty = Object.keys(drafts).length > 0;
  const offset = pages[pages.length - 1];

  useEffect(() => {
    mounted.current = true;
    const requests = saveRequests.current;
    return () => { mounted.current = false; for (const request of requests.values()) request.abort(); };
  }, []);
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);

  useEffect(() => {
    const current = ++sequence.current;
    const controller = new AbortController();
    listRequest.current = controller;
    setLoading(true); setError('');
    void adminAPI<{ items: Developer[]; nextOffset: number | null }>(`developers?q=${encodeURIComponent(query)}&offset=${offset}&role=${role}`, { signal: controller.signal }).then(page => {
      if (controller.signal.aborted || current !== sequence.current) return;
      setUsers(page.items); setNext(page.nextOffset ?? null); setListStale(false); setDrafts({}); setRowErrors({});
    }).catch(cause => {
      if (!controller.signal.aborted && current === sequence.current) setError(cause instanceof Error ? cause.message : 'Could not load users.');
    }).finally(() => {
      if (!controller.signal.aborted && current === sequence.current) setLoading(false);
    });
    return () => { controller.abort(); sequence.current++; };
  }, [query, offset, role, refreshVersion]);

  function canLeaveDrafts() {
    return saving.length === 0 && (!dirty || window.confirm('Discard unsaved developer role changes?'));
  }
  function cancelList() { sequence.current++; listRequest.current?.abort(); }
  function changeView() {
    cancelList(); setUsers([]); setNext(null); setListStale(false); setDrafts({}); setRowErrors({}); setNotice('');
  }
  function searchUsers(event: FormEvent) {
    event.preventDefault();
    if (!canLeaveDrafts()) return;
    changeView(); setQuery(search.trim()); setPages([0]); setRefreshVersion(value => value + 1);
  }
  function filterUsers(value: RoleFilter) {
    if (value === role || !canLeaveDrafts()) return;
    changeView(); setRole(value); setPages([0]);
  }
  function refresh() {
    if (!canLeaveDrafts()) return;
    cancelList(); setNotice(''); setRefreshVersion(value => value + 1);
  }
  function changePage(direction: 'previous' | 'next') {
    if (listStale || !canLeaveDrafts() || (direction === 'next' && next === null)) return;
    changeView(); setPages(previous => direction === 'previous' ? previous.slice(0, -1) : [...previous, next!]);
  }
  function edit(user: Developer, change: Partial<Access>) {
    const original = accessFor(user);
    const updated = { ...(drafts[user.id] || effectiveAccessFor(user)), ...change };
    if (!updated.isDeveloper) updated.allowAnkiUploads = false;
    setDrafts(previous => {
      const result = { ...previous };
      if (sameAccess(original, updated)) delete result[user.id]; else result[user.id] = updated;
      return result;
    });
    setNotice('');
  }
  async function save(user: Developer) {
    const draft = drafts[user.id];
    if (!draft || loading || saveRequests.current.has(user.id) || rowErrors[user.id]?.stale) return;
    const original = accessFor(user);
    const controller = new AbortController();
    saveRequests.current.set(user.id, controller);
    setSaving(previous => [...previous, user.id]); setNotice('');
    setRowErrors(previous => { const result = { ...previous }; delete result[user.id]; return result; });
    try {
      const result = await adminAPI<{ success: boolean; user: { id: string; handle: string; isDeveloper: boolean; allowAnkiUploads: boolean } }>('developers/update', {
        method: 'POST', signal: controller.signal,
        body: JSON.stringify({ id: user.id, isDeveloper: draft.isDeveloper, allowAnkiUploads: draft.allowAnkiUploads, expectedIsDeveloper: original.isDeveloper, expectedAllowAnkiUploads: original.allowAnkiUploads }),
      });
      if (!mounted.current || controller.signal.aborted) return;
      const updated = result.user;
      setUsers(previous => previous.map(value => value.id === user.id ? { ...value, is_developer: Number(updated.isDeveloper), developer_anki_uploads: Number(updated.allowAnkiUploads) } : value).filter(value => role !== 'developer' || Boolean(value.is_developer)));
      if (role === 'developer' && !updated.isDeveloper) setListStale(true);
      setDrafts(previous => { const remaining = { ...previous }; delete remaining[user.id]; return remaining; });
      setNotice(`Saved developer access for ${updated.handle || user.id}.`);
    } catch (cause) {
      if (!mounted.current || controller.signal.aborted) return;
      setRowErrors(previous => ({ ...previous, [user.id]: { message: cause instanceof Error ? cause.message : 'Could not save developer access.', stale: cause instanceof AdminAPIError && cause.status === 409 } }));
    } finally {
      saveRequests.current.delete(user.id);
      if (mounted.current) setSaving(previous => previous.filter(id => id !== user.id));
    }
  }

  return <section className="developer-workspace" aria-labelledby="developer-workspace-title">
    <header className="developer-heading"><div><h1 id="developer-workspace-title">Developer role</h1><p>Manage Developer access and Anki uploads. This role does not grant access to the admin site.</p></div><small>{dirty ? `${Object.keys(drafts).length} unsaved` : 'Changes require Save'}</small></header>
    <form className="admin-tools developer-tools" onSubmit={searchUsers}>
      <input type="search" aria-label="Search users by username" placeholder="Search username" value={search} onChange={event => setSearch(event.target.value)} maxLength={120} disabled={saving.length > 0} />
      <button disabled={saving.length > 0}>Search</button>
      <select aria-label="Developer role filter" value={role} onChange={event => filterUsers(event.target.value as RoleFilter)} disabled={saving.length > 0}><option value="all">All users</option><option value="developer">Developers</option></select>
      <button type="button" onClick={refresh} disabled={loading || saving.length > 0}>Refresh</button>
      {loading && <small role="status">Loading…</small>}
    </form>
    {error && <div role="alert" className="admin-message admin-error">{error}</div>}
    {notice && <p role="status" className="developer-notice">{notice}</p>}
    {listStale && <p role="status" className="developer-list-note">Refresh to update this list before changing pages.</p>}
    <div className="admin-table developer-table" aria-busy={loading}>
      <table><thead><tr><th scope="col">Profile</th><th scope="col">Created</th><th scope="col">Developer role</th><th scope="col">Anki uploads</th><th scope="col">Changes</th></tr></thead>
        <tbody>{users.map(user => {
          const access = drafts[user.id] || effectiveAccessFor(user);
          const rowBusy = loading || saving.includes(user.id);
          const rowError = rowErrors[user.id];
          const restricted = user.restriction_status === 'banned' || (user.restriction_status === 'suspended' && (user.until_at || 0) > Date.now() / 1000);
          return <tr key={user.id} className={drafts[user.id] ? 'developer-row-dirty' : undefined}>
            <td><strong>{user.handle || 'No username'}</strong><small>{user.profile_completed ? 'Profile complete' : 'Setup pending'}{restricted ? ` · ${user.restriction_status}${user.until_at ? ` until ${date(user.until_at)}` : ''}` : ''}</small><code>{user.id}</code></td>
            <td><time dateTime={new Date(user.created_at * 1000).toISOString()}>{date(user.created_at)}</time></td>
            <td><label className="developer-toggle"><input type="checkbox" role="switch" aria-label={`Developer role for ${user.handle || user.id}`} checked={access.isDeveloper} disabled={rowBusy} onChange={event => edit(user, { isDeveloper: event.target.checked })} /><span>{access.isDeveloper ? 'On' : 'Off'}</span></label></td>
            <td><label className="developer-toggle"><input type="checkbox" role="switch" aria-label={`Anki uploads for ${user.handle || user.id}`} checked={access.allowAnkiUploads} disabled={rowBusy || !access.isDeveloper} onChange={event => edit(user, { allowAnkiUploads: event.target.checked })} /><span>{access.allowAnkiUploads ? 'Allowed' : 'Off'}</span></label></td>
            <td><div className="actions"><button onClick={() => void save(user)} disabled={!drafts[user.id] || rowBusy || rowError?.stale}>{saving.includes(user.id) ? 'Saving…' : 'Save'}</button>{drafts[user.id] && <small>Unsaved</small>}</div>{rowError && <p role="alert" className="developer-row-error">{rowError.stale && <strong>Refresh needed. </strong>}{rowError.message}</p>}</td>
          </tr>;
        })}</tbody>
      </table>
      {!users.length && <p className="admin-empty">{loading ? 'Loading users…' : error ? 'Users unavailable.' : 'No users found.'}</p>}
    </div>
    <div className="admin-paging"><button disabled={loading || listStale || saving.length > 0 || pages.length === 1} onClick={() => changePage('previous')}>Previous</button><small>Page {pages.length}</small><button disabled={loading || listStale || saving.length > 0 || next === null} onClick={() => changePage('next')}>Next</button></div>
  </section>;
}
