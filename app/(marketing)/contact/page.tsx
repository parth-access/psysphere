import { Navbar } from '@/features/marketing/ui/Navbar';
import { Footer } from '@/features/marketing/ui/Footer';
import { Container } from '@/features/marketing/ui/Container';
import { H1, H2, Body } from '@/features/marketing/ui/Typography';
import { Button } from '@/features/marketing/ui/Button';
import { Mail, Calendar, MessageSquare, Clock, GraduationCap, Compass, Sparkles } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-canvas flex flex-col pt-32">
      <Navbar />
      
      <section className="py-24 flex-1" id="contact">
        <Container>
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-4">
                <Sparkles className="h-3 w-3" /> Connect With Us
              </div>
              <H1 className="mb-4">Get in Touch</H1>
              <p className="font-sans text-lg text-brand-text-muted max-w-2xl mx-auto">
                Whether you have questions about Class 11 & 12 Psychology, board exams, or CUET-UG preparation, we are here to counsel you and your child.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              {/* Left Column - Welcoming Context */}
              <div className="md:col-span-6 space-y-8">
                <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-sm space-y-6">
                  <h2 className="font-serif text-2xl font-semibold text-brand-text">How We Can Help You</h2>
                  <p className="font-sans text-brand-text-muted text-sm leading-relaxed">
                    At Saarthi Classes, learning is a collaborative and compassionate journey. We invite parents and students to ask any questions—whether big or small—regarding the curriculum or high-school preparation.
                  </p>
                  
                  <div className="space-y-6 pt-2">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <GraduationCap className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif font-semibold text-brand-text text-sm">Admissions Enquiries</h3>
                        <p className="text-xs text-brand-text-muted leading-relaxed">Understand our small batch system, fee schedules, and how we curate study cohorts for optimal learning.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <Compass className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif font-semibold text-brand-text text-sm">Course Counselling</h3>
                        <p className="text-xs text-brand-text-muted leading-relaxed">Confused about choosing Psychology as an elective or how to balance board prep with CUET-UG? Let&apos;s guide you.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif font-semibold text-brand-text text-sm">Expected Response Time</h3>
                        <p className="text-xs text-brand-text-muted leading-relaxed">We aim to respond to every query or general question submitted via our form within 12 to 24 hours.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                  <p className="text-xs text-brand-text leading-relaxed font-sans italic text-center">
                    &quot;Education should feel supportive. Feel free to reach out via the form to schedule a visual demo or discuss study strategies for your child.&quot; — Dravina Gupta
                  </p>
                </div>
              </div>

              {/* Right Column - Actions & Direct Info */}
              <div className="md:col-span-6 space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-sm">
                  <h2 className="font-serif text-xl font-semibold text-brand-text mb-2">Send an Enquiry</h2>
                  <p className="text-sm text-brand-text-muted mb-6">Please fill out the form below and our admissions team will get back to you shortly.</p>
                  
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-brand-text">First Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" placeholder="John" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-brand-text">Last Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" placeholder="Doe" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-text">Email Address</label>
                      <input type="email" className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" placeholder="john@example.com" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-brand-text">Your Message</label>
                      <textarea rows={4} className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none" placeholder="How can we help you?"></textarea>
                    </div>
                    
                    <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 mt-2">
                      <MessageSquare className="h-4 w-4" /> Send Message
                    </Button>
                  </form>
                </div>
                
                <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-sm space-y-4">
                  <h2 className="font-serif text-xl font-semibold text-brand-text mb-2">Prefer a Demo?</h2>
                  <p className="text-sm text-brand-text-muted mb-4">Book a free session to experience our teaching methodology firsthand.</p>
                  <Button href="/book-demo" variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" /> Book a Free Demo Class
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
