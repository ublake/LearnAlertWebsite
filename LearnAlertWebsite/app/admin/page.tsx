import type { Metadata } from 'next';
import { AdminDashboard } from './dashboard';
import './admin.css';

export const metadata: Metadata = { title: 'LearnAlert Admin', robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminDashboard />; }
