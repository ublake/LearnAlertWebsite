'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminAPI } from './admin-client';
import { CatalogWorkspace } from './catalog-workspace';
import { CommunityWorkspace } from './dashboard';

type Section = 'course' | 'exam' | 'community' | 'moderation';
export function AdminDashboard() {
  const [section, setSection] = useState<Section>('course');
  const [dirty, setDirty] = useState(false);
  const [actor, setActor] = useState('');
  const [light, setLight] = useState(false);
  const updateDirty = useCallback((value: boolean) => setDirty(value), []);
  useEffect(() => { void adminAPI<{ actor: string }>('overview').then(data => setActor(data.actor)).catch(() => {}); }, []);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  function switchSection(value: Section) { if (value === section) return; if (dirty && !window.confirm('Discard unsaved changes before changing workspaces?')) return; setDirty(false); setSection(value); }
  return <main className={`admin admin-console${light ? ' admin-light' : ''}`}>
    <header className="admin-console-header"><a href="/admin" className="admin-brand" aria-label="LearnAlert admin"><img src="/LearnAlertLogo.png" alt="" width={23} height={23} /><strong>LearnAlert</strong><span>Content studio</span></a><nav aria-label="Workspaces">{([['course','Languages'],['exam','Exam prep'],['community','Community'],['moderation','Moderation']] as const).map(([value, label]) => <button key={value} aria-current={section === value ? 'page' : undefined} onClick={() => switchSection(value)}>{label}</button>)}</nav><div className="admin-user"><span>{actor}</span><button aria-label={`Use ${light ? 'dark' : 'light'} appearance`} onClick={() => setLight(!light)}>{light ? '☾' : '☀'}</button><a className="admin-link" href="/cdn-cgi/access/logout" onClick={event => { if (dirty && !window.confirm('Discard unsaved changes and sign out?')) event.preventDefault(); }}>Sign out</a></div></header>
    <div className="admin-console-body">{section === 'course' || section === 'exam' ? <CatalogWorkspace key={section} kind={section} onDirtyChange={updateDirty} /> : <CommunityWorkspace key={section} scope={section} onDirtyChange={updateDirty} />}</div>
  </main>;
}
