'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminAPI } from './admin-client';
import { CatalogWorkspace } from './catalog-workspace';
import { CommunityWorkspace } from './dashboard';
import { DeveloperWorkspace } from './developer-workspace';

type Section = 'course' | 'community' | 'moderation' | 'developer';
export function AdminDashboard() {
  const [section, setSection] = useState<Section>('community');
  const [dirty, setDirty] = useState(false);
  const [actor, setActor] = useState('');
  const [light, setLight] = useState(false);
  const updateDirty = useCallback((value: boolean) => setDirty(value), []);
  useEffect(() => { void adminAPI<{ actor: string }>('overview').then(data => setActor(data.actor)).catch(() => {}); }, []);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  function switchSection(value: Section) { if (value === section) return; if (dirty && !window.confirm('Discard unsaved changes before changing workspaces?')) return; setDirty(false); setSection(value); }
  return <main className={`admin admin-console${light ? ' admin-light' : ''}`}>
    <header className="admin-console-header"><a href="/admin" className="admin-brand" aria-label="LearnAlert admin"><img src="/LearnAlertLogo.png" alt="" width={23} height={23} /><strong>LearnAlert</strong><span>Content studio</span></a><nav aria-label="Workspaces">{([['community','Shared decks'],['course','Language decks'],['moderation','Moderation'],['developer','Developer role']] as const).map(([value, label]) => <button key={value} aria-current={section === value ? 'page' : undefined} onClick={() => switchSection(value)}>{label}</button>)}</nav><div className="admin-user"><span>{actor}</span><button aria-label={`Use ${light ? 'dark' : 'light'} appearance`} onClick={() => setLight(!light)}>{light ? '☾' : '☀'}</button><a className="admin-link" href="/cdn-cgi/access/logout" onClick={event => { if (dirty && !window.confirm('Discard unsaved changes and sign out?')) event.preventDefault(); }}>Sign out</a></div></header>
    <div className="admin-console-body">{section === 'course' ? <CatalogWorkspace key={section} kind={section} onDirtyChange={updateDirty} /> : section === 'developer' ? <DeveloperWorkspace key={section} onDirtyChange={updateDirty} /> : <CommunityWorkspace key={section} scope={section} onDirtyChange={updateDirty} />}</div>
  </main>;
}
