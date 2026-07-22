import { MOCK_SUPPORT_CONTACTS } from "@/features/student/mock/data";
import { Mail, Phone, MessageSquare, MapPin, ExternalLink, HelpCircle } from "lucide-react";

export default function SupportPage() {
  const getSupportIcon = (type: string) => {
    switch(type) {
      case 'Email': return <Mail className="w-5 h-5" />;
      case 'Phone': return <Phone className="w-5 h-5" />;
      case 'WhatsApp': return <MessageSquare className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Support Center</h1>
        <p className="text-sm text-gray-500 mt-1">We&apos;re here to help. Reach out to us through any of these channels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_SUPPORT_CONTACTS.map(contact => (
          <div key={contact.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-6 hover:border-brand-primary/30 transition-all flex flex-col h-full text-center items-center">
            <div className="w-12 h-12 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center mb-4">
              {getSupportIcon(contact.type)}
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{contact.type}</h3>
            <p className="text-sm font-semibold text-brand-primary mb-3">{contact.value}</p>
            <p className="text-xs text-gray-500 mt-auto">{contact.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Institute Address</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              PsySphere Institute of Psychology<br/>
              123 Knowledge Avenue, Phase 1<br/>
              New Delhi, India 110001
            </p>
            <button className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5">
              View on Map
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Frequently Asked Questions</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Check our detailed FAQ section for quick answers about admission, fees, and syllabus.
            </p>
            <button className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5">
              Read FAQs
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
