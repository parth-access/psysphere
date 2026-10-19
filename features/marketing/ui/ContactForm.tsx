'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { contactAction, type ContactState } from '@/app/contact/actions';
import { Field, TextInput, inputClass, primaryButtonClass } from '@/features/joining/ui/Field';

const TOPICS = ['Joining a batch', 'Free workshops', 'Fees and payments', 'Something else'];

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(contactAction, { status: 'idle' });

  if (state.status === 'sent') {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-8">
        <CheckCircle2 className="h-8 w-8 text-sage-600" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold text-ink-900">Message sent</h2>
        <p className="text-ink-500">Thank you. We usually reply within a day.</p>
      </div>
    );
  }

  const errors = state.status === 'error' ? state.errors : {};
  return (
    <form action={action} noValidate className="relative flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" error={errors.name}>
          <TextInput name="name" autoComplete="name" required error={errors.name} />
        </Field>
        <Field label="Phone (optional)" name="phone" error={errors.phone}>
          <TextInput name="phone" type="tel" autoComplete="tel" error={errors.phone} />
        </Field>
      </div>
      <Field label="Email" name="email" error={errors.email}>
        <TextInput name="email" type="email" autoComplete="email" required error={errors.email} />
      </Field>
      <Field label="What’s it about?" name="topic" error={errors.topic}>
        <select id="topic" name="topic" defaultValue={TOPICS[0]} className={inputClass}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Message" name="message" error={errors.message}>
        <textarea id="message" name="message" rows={5} required aria-invalid={errors.message ? true : undefined} className={`${inputClass} py-3`} />
      </Field>
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === 'error' && state.message && (
        <p role="alert" className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">{state.message}</p>
      )}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
