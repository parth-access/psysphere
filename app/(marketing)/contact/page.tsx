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
              <div className="md:col-span-7 space-y-8">
                <div className="bg-white p-8 rounded-[32px] border border-brand-border shadow-sm space-y-6">
                  <h2 className="font-serif text-2xl font-semibold text-brand-text">How We Can Help You</h2>
                  <p className="font-sans text-brand-text-muted text-sm leading-relaxed">
                    At PsySphere, learning is a collaborative and compassionate journey. We invite parents and students to ask any questions—whether big or small—regarding the curriculum or high-school preparation.
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
                        <p className="text-xs text-brand-text-muted leading-relaxed">We respond to every query, enrollment request, or general question within 12 to 24 hours.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                  <p className="text-xs text-brand-text leading-relaxed font-sans italic text-center">
                    &quot;Education should feel supportive. Feel free to reach out to schedule a visual demo or discuss study strategies for your child.&quot; — Dravina Gupta
                  </p>
                </div>
              </div>

              {/* Right Column - Actions & Direct Info */}
              <div className="md:col-span-5 bg-white p-8 rounded-[32px] border border-brand-border shadow-sm space-y-8">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-brand-text mb-4">Direct Action</h2>
                  <div className="flex flex-col gap-4">
                    <Button href="/book-demo" variant="primary" className="w-full flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" /> Book a Free Demo Class
                    </Button>
                    
                    <Button href="mailto:psysphereclasses@gmail.com?subject=Inquiry%20about%20PsySphere" variant="secondary" className="w-full flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" /> Email Dravina Gupta
                    </Button>
                  </div>
                </div>

                <div className="border-t border-brand-border pt-6 space-y-4">
                  <h3 className="font-serif text-sm font-semibold text-brand-text uppercase tracking-wider">Contact Information</h3>
                  <div>
                    <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold mb-1">Direct Email</span>
                    <a href="mailto:psysphereclasses@gmail.com?subject=Inquiry%20about%20PsySphere" className="font-serif font-semibold text-brand-primary hover:underline text-base">
                      psysphereclasses@gmail.com
                    </a>
                  </div>
                  <div>
                    <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold mb-1">Timings</span>
                    <span className="text-xs font-sans text-brand-text font-medium">Monday to Saturday • 10:00 AM to 7:00 PM (IST)</span>
                  </div>
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
