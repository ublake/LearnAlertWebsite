'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function FeedbackForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function openEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailSubject = `LearnAlert feedback: ${subject.trim()}`;
    window.location.href = `mailto:contact@learnalertapp.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(message.trim())}`;
  }

  return <form className="support-form" onSubmit={openEmail}>
    <div className="support-field">
      <label htmlFor="feedback-subject">Subject</label>
      <Input id="feedback-subject" name="subject" placeholder="What’s on your mind?" required maxLength={100} value={subject} onChange={event => setSubject(event.target.value)} />
    </div>
    <div className="support-field">
      <label htmlFor="feedback-message">Your message</label>
      <Textarea id="feedback-message" name="message" placeholder="Tell us a little more…" required maxLength={1500} rows={6} value={message} onChange={event => setMessage(event.target.value)} />
    </div>
    <p id="feedback-email-note" className="support-note">This opens your email app with your message ready to review and send.</p>
    <Button type="submit" className="support-submit" aria-describedby="feedback-email-note" disabled={!subject.trim() || !message.trim()}>Continue to email <span aria-hidden="true">↗</span></Button>
  </form>;
}
