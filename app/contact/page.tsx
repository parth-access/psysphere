import type { Metadata } from 'next';
import { Mail, Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { PublicShell, Eyebrow } from '@/features/joining/ui/PublicShell';
import { ContactForm } from '@/features/marketing/ui/ContactForm';
import { getSettings, telLink, whatsappLink } from '@/src/domains/settings/service';

export const metadata: Metadata = {
  title: 'Contact | Saarthi Classes',
  description: 'Questions about psychology batches, free workshops or fees? Email, call or WhatsApp Saarthi Classes.',
};

export default async function ContactPage() {
  const settings = await getSettings();
  const channels = [
    { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: whatsappLink(settings), external: true },
    { icon: Phone, label: 'Phone', value: settings.phone, href: telLink(settings.phone) },
    { icon: Mail, label: 'Email', value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
  ];
  return (
    <PublicShell>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <section className="flex flex-col gap-6">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="font-serif text-[44px] leading-[1] sm:text-[60px]">Talk to us</h1>
          <p className="text-lg text-ink-500">
            Questions about batches, workshops or fees? Parents and students are both welcome to reach out.
          </p>
          <ul className="flex flex-col gap-3">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-center gap-4 rounded-[28px] border border-line bg-surface p-4 hover:border-ink-300"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-900">
                    <c.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm text-ink-500">{c.label}</span>
                    <span className="font-semibold text-ink-900">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 text-[15px] text-ink-500">
            <p className="flex items-center gap-2"><Clock className="h-4 w-4" aria-hidden="true" />{settings.hours}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden="true" />{settings.address} · classes are online</p>
          </div>
        </section>
        <section aria-label="Send a message">
          <ContactForm />
        </section>
      </div>
    </PublicShell>
  );
}
