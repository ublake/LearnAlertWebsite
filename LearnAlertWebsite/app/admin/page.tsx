import type { Metadata } from 'next';
import { AdminDashboard } from './workspace';
import './admin.css';

export const metadata: Metadata = { title: 'LearnAlert Admin', robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminDashboard />; }
