'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  ArrowRight, 
  Video, 
  FolderOpen, 
  FileText, 
  Mail, 
  MapPin, 
  PhoneCall, 
  Sparkles 
} from 'lucide-react';
import { H1, H2, Subtitle, Body } from '@/features/shared/ui/Typography';
import { Button } from '@/features/shared/ui/Button';
import { Card, CardContent } from '@/features/shared/ui/Card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal selection:bg-brand-accent/15 selection:text-brand-accent">
      
      {/* 1. Header/Logo Bar */}
      <header className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between border-b border-brand-stone-soft/40">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-md bg-brand-accent flex items-center justify-center text-brand-cream shadow-xs">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-brand-charcoal">
            PsySphere
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard?role=teacher">
            <span className="text-xs font-medium font-sans text-brand-charcoal-muted hover:text-brand-charcoal cursor-pointer">
              Educator Gate
            </span>
          </Link>
          <span className="text-brand-stone-soft font-light text-sm">/</span>
          <Link href="/dashboard?role=student">
            <span className="text-xs font-medium font-sans text-brand-charcoal-muted hover:text-brand-charcoal cursor-pointer">
              Student Gate
            </span>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-beige text-brand-accent text-xs font-semibold font-sans">
            <Sparkles className="h-3.5 w-3.5" /> Class 11 & Class 12 Psychology Workspace
          </div>
          
          <H1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-brand-charcoal">
            The focused coaching space for Psychology students.
          </H1>
          
          <Subtitle className="text-base md:text-lg text-brand-charcoal-muted max-w-2xl mx-auto font-light leading-relaxed">
            Replace unorganized WhatsApp group chats, scattered Google Drive folders, and loose links with a singular, elegant academic ecosystem.
          </Subtitle>

          {/* Gateways Actions */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link href="/dashboard?role=teacher" className="w-full">
              <Button variant="primary" className="w-full h-12 gap-2 text-sm justify-center font-sans">
                Enter as Teacher <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
            <Link href="/dashboard?role=student" className="w-full">
              <Button variant="outline" className="w-full h-12 gap-2 text-sm justify-center font-sans border-brand-stone-soft hover:bg-white bg-white">
                Enter as Student <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 3. Replacement Features List */}
        <section className="pt-24 pb-16 border-t border-brand-stone-soft/50 mt-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <H2 className="text-2xl md:text-3xl">One workspace, replacing three tools.</H2>
            <Body className="text-xs text-brand-charcoal-muted mt-2">
              Clean interfaces built entirely to maximize focus, avoid notifications, and streamline lessons.
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-brand-stone-soft/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-md bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-brand-charcoal">Live Lectures & Sync</h3>
                  <p className="text-xs text-brand-charcoal-muted mt-2 leading-relaxed font-light">
                    Replaces scattered Google Meet links. Scheduled lectures slates are built into the workspace, allowing one-click virtual sync.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-brand-stone-soft/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-md bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-brand-charcoal">Study Vault & Blueprints</h3>
                  <p className="text-xs text-brand-charcoal-muted mt-2 leading-relaxed font-light">
                    Replaces unorganized Google Drive folders. Search and filter high-quality handwritten notes, practice booklets, and blueprints.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-brand-stone-soft/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-md bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-brand-charcoal">Assignments Ledger</h3>
                  <p className="text-xs text-brand-charcoal-muted mt-2 leading-relaxed font-light">
                    Replaces WhatsApp submission threads. Students submit homework essays directly to the workspace, where teachers grade them cleanly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. About & Purpose */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t border-brand-stone-soft/50">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-brand-accent bg-brand-beige px-2.5 py-1 rounded">Our Purpose</span>
            <H2 className="text-2xl font-medium">Crafted for Psychology Educators</H2>
            <Body className="text-xs text-brand-charcoal-muted leading-relaxed font-light">
              PsySphere is built for premium psychology institutes catering to high school students (Class 11 and Class 12 CBSE / ISC). We understand that psychology education requires heavy reading, essay-based assessments, and frequent concepts-clarity. By providing a beautiful, distraction-free interface, students digest educational blueprints with ease.
            </Body>
          </div>

          <div className="space-y-4 bg-brand-cream/50 border border-brand-stone-soft p-6 rounded-lg self-center">
            <h4 className="font-serif text-sm font-semibold text-brand-charcoal">Workspace Design Goal</h4>
            <p className="text-xs text-brand-charcoal-muted leading-relaxed font-light">
              PsySphere limits interaction to what genuinely matters for your course. It avoids standard commercial EdTech gamification, noisy leaderboards, points systems, and advertisements. 
            </p>
          </div>
        </section>

        {/* 5. Contact Info Footer */}
        <footer className="pt-24 border-t border-brand-stone-soft/50 mt-20 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <div className="w-6 h-6 rounded bg-brand-accent flex items-center justify-center text-brand-cream">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-serif text-base font-semibold tracking-tight text-brand-charcoal">PsySphere</span>
              </div>
              <p className="text-xs text-brand-charcoal-muted font-light">Premium Psychology Academic Workspace</p>
            </div>

            <div className="space-y-2">
              <h5 className="font-serif text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Contact Institute</h5>
              <div className="space-y-1.5 text-xs text-brand-charcoal-muted font-light">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="h-3.5 w-3.5 text-brand-accent" /> info@psysphere.com
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <PhoneCall className="h-3.5 w-3.5 text-brand-accent" /> +91 98100 23456
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-serif text-xs font-semibold text-brand-charcoal uppercase tracking-wider">Location</h5>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-brand-charcoal-muted font-light">
                <MapPin className="h-3.5 w-3.5 text-brand-accent shrink-0" /> South Extension Part II, New Delhi, India
              </div>
            </div>
          </div>

          <div className="pt-12 text-center text-[10px] text-brand-charcoal-muted/65 border-t border-brand-stone-soft/30 mt-12 font-sans font-light">
            © {new Date().getFullYear()} PsySphere Education. Developed as a premium digital workspace. All Rights Reserved.
          </div>
        </footer>

      </main>

    </div>
  );
}
