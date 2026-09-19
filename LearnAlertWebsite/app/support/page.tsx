import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme-toggle';
import { FeedbackForm } from './feedback-form';

export const metadata: Metadata = {
  title: 'Support — LearnAlert',
  description: 'Get help with LearnAlert, report a problem, or share your feedback.',
  alternates: { canonical: 'https://learnalertapp.com/support' },
};

export default function Support() {
  return <div className="legal-page">
    <header className="nav">
      <a className="brand" href="/"><img src="/LearnAlertLogo.png" alt="" width="34" height="34" />LearnAlert</a>
      <ThemeToggle />
    </header>
    <main className="legal support">
      <p className="eyebrow"><span /> HERE TO HELP</p>
      <h1>Support &amp; feedback</h1>
      <p className="support-lede">Have a question, found a bug, or have an idea for LearnAlert? We&rsquo;d love to hear from you.</p>
      <FeedbackForm />
      <p className="support-contact">You can also email us directly at <a href="mailto:contact@learnalertapp.com">contact@learnalertapp.com</a>.</p>
    </main>
    <footer><span>LearnAlert</span><span className="footer-links"><a className="footer-link" href="/privacy-policy">Privacy Policy</a><a className="footer-link" href="/terms">Terms &amp; Conditions</a><a className="footer-link" href="/">Back to home</a></span></footer>
  </div>;
}
