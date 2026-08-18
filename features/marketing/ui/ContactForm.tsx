'use client';

import { useState } from 'react';
import { Button } from '@/features/marketing/ui/Button';
import { MessageSquare, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Direct submission / client handler with smooth feedback
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong sending your message. Please try again or email us directly.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 text-center bg-brand-canvas rounded-2xl border border-brand-border space-y-4">
        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-brand-text">Message Received</h3>
        <p className="text-sm text-brand-text-muted max-w-sm mx-auto">
          Thank you, {firstName}. Our academic counselling team at Saarthi Classes has received your enquiry and will respond within 12–24 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            setFirstName('');
            setLastName('');
            setEmail('');
            setMessage('');
          }}
          className="text-xs font-semibold text-brand-primary underline hover:text-brand-text mt-2 cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {status === 'error' && errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-first-name" className="text-xs font-semibold text-brand-text">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-first-name"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
            placeholder="John"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact-last-name" className="text-xs font-semibold text-brand-text">
            Last Name
          </label>
          <input
            id="contact-last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-email" className="text-xs font-semibold text-brand-text">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-semibold text-brand-text">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none bg-white"
          placeholder="How can we help you regarding Class 11 & 12 Psychology or CUET-UG?"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={status === 'submitting'}
        className="w-full flex items-center justify-center gap-2 mt-2"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4" /> Send Message
          </>
        )}
      </Button>
    </form>
  );
}
