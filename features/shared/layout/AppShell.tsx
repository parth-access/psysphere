'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home,
  Presentation,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  Menu, 
  X, 
  Search, 
  Bell, 
  ChevronRight, 
  LogOut, 
  User, 
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { signOutAction } from "@/src/domains/auth/actions";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  role?: 'teacher' | 'student' | 'all';
}

interface AppShellProps {
  children: React.ReactNode;
  activeId: string;
  onActiveIdChange: (id: string) => void;
  userRole: 'teacher' | 'student' | 'admin';
}

export const navigationItems: NavItem[] = [
  { id: 'overview', label: 'Home', icon: Home, role: 'all' },
  { id: 'classes', label: "Today's Schedule", icon: Presentation, badge: 'Live', role: 'all' },
  { id: 'assignments', label: 'Assignments', icon: ClipboardCheck, badge: '3', role: 'all' },
  { id: 'materials', label: 'Resources', icon: BookOpen, role: 'all' },
  { id: 'grading', label: 'Grading Desk', icon: GraduationCap, role: 'teacher' },
];

export const AppShell = ({
  children,
  activeId,
  onActiveIdChange,
  userRole,
}: AppShellProps) => {
  const handleSignOut = async () => {
    await signOutAction();
  };
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Raycast-style academic command-search state
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [commandSearch, setCommandSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const commandItems = React.useMemo(() => [
    { id: 'c1', title: 'Intelligence Theories & Attributes', subtitle: 'Class 12 • Chapter 1 • Live Discussion', category: 'Classes & Live Sync', action: 'classes' },
    { id: 'c2', title: 'Methods of Enquiry in Psychology', subtitle: 'Class 11 • Chapter 2 • Homework', category: 'Classes & Live Sync', action: 'classes' },
    { id: 'c3', title: 'Syllabus Review & Lesson Mapping', subtitle: 'Class 11 • Introductory Track', category: 'Classes & Live Sync', action: 'classes' },
    { id: 'c4', title: 'Cognitive Appraisal Styles Discussion', subtitle: 'Class 12 • Unit 3 Practice', category: 'Classes & Live Sync', action: 'classes' },
    
    { id: 's1', title: 'Pranav Sharma', subtitle: 'Class 12 • Roll 18 • Study Streak: 8 Days', category: 'Student Directory', action: 'overview' },
    { id: 's2', title: 'Ishita Kapoor', subtitle: 'Class 12 • Roll 09 • Fully Graded', category: 'Student Directory', action: 'overview' },
    { id: 's3', title: 'Kabir Mehta', subtitle: 'Class 11 • Roll 12 • Submission Reviewing', category: 'Student Directory', action: 'overview' },
    { id: 's4', title: 'Ananya Sen', subtitle: 'Class 12 • Roll 04 • On Track', category: 'Student Directory', action: 'overview' },
    
    { id: 'a1', title: 'Personality Assessment Writeup', subtitle: 'Class 12 Assignment • Due July 15', category: 'Assignments Ledger', action: 'assignments' },
    { id: 'a2', title: 'Stress Coping Strategies Case Study', subtitle: 'Class 12 • Graded 45/50 Marks', category: 'Assignments Ledger', action: 'assignments' },
    { id: 'a3', title: 'Methods of Enquiry Exercise Sheet', subtitle: 'Class 11 • Due July 19', category: 'Assignments Ledger', action: 'assignments' },
    
    { id: 'm1', title: 'Sensory, Attentional & Perceptual Processes', subtitle: 'Chapter 5 Handwritten Notes • 4.2 MB', category: 'Academic Resources', action: 'materials' },
    { id: 'm2', title: 'Methods of Enquiry in Psychology', subtitle: 'Chapter 2 Reference Sheet • 1.8 MB', category: 'Academic Resources', action: 'materials' },
    { id: 'm3', title: 'Variations in Psychological Attributes', subtitle: 'Chapter 1 Blueprint Guide • 3.1 MB', category: 'Academic Resources', action: 'materials' },
    
    { id: 'p1', title: 'Spearman Two-Factor Theory', subtitle: 'Psychology Topic • General (g) & Specific (s) factors', category: 'Psychology Core Topics', action: 'materials' },
    { id: 'p2', title: 'Freudian Structural Mind Model', subtitle: 'Psychology Topic • Id, Ego, Superego balance', category: 'Psychology Core Topics', action: 'materials' },
    { id: 'p3', title: 'Zeigarnik Retention Effect', subtitle: 'Psychology Topic • Higher memory of incomplete tasks', category: 'Psychology Core Topics', action: 'materials' }
  ], []);

  const filteredCommands = React.useMemo(() => {
    if (!commandSearch) return commandItems;
    return commandItems.filter(cmd => 
      cmd.title.toLowerCase().includes(commandSearch.toLowerCase()) ||
      cmd.subtitle.toLowerCase().includes(commandSearch.toLowerCase()) ||
      cmd.category.toLowerCase().includes(commandSearch.toLowerCase())
    );
  }, [commandSearch, commandItems]);

  // Handle hotkeys
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(open => !open);
        setCommandSearch('');
        setSelectedIndex(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard navigation within results
  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(idx => (idx + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(idx => (idx - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        triggerCommand(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandOpen(false);
    }
  };

  const triggerCommand = (cmd: typeof commandItems[0]) => {
    onActiveIdChange(cmd.action);
    setIsCommandOpen(false);
  };

  const activeItem = navigationItems.find((item) => item.id === activeId) || navigationItems[0];

  const filteredNavItems = navigationItems.filter(
    (item) => !item.role || item.role === 'all' || item.role === userRole
  );

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal flex">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-brand-stone-soft bg-brand-cream shrink-0">
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-brand-stone-soft/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-charcoal flex items-center justify-center text-white font-serif italic text-lg rounded-xs">
              P
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-brand-charcoal">
              PsySphere
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 space-y-1.5 py-6">
          <div className="text-[10px] uppercase tracking-widest text-brand-charcoal-muted px-4 py-2 font-semibold">
            Academic
          </div>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => onActiveIdChange(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-sm font-sans rounded-xs transition-all group cursor-pointer text-left',
                  isActive
                    ? 'bg-brand-beige text-brand-charcoal font-medium shadow-xs'
                    : 'text-brand-sage hover:text-brand-charcoal hover:bg-brand-beige/50'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn('h-4 w-4 shrink-0 opacity-70', isActive ? 'text-brand-charcoal opacity-100' : 'text-brand-sage group-hover:text-brand-charcoal')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-xs font-semibold',
                    isActive ? 'bg-brand-charcoal text-white' : 'bg-brand-beige text-brand-charcoal'
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Workspace Companion Context Widget */}
        <div className="px-6 py-4 border-t border-brand-stone-soft/40 space-y-3 font-sans bg-brand-cream/80">
          <div className="text-[9px] uppercase tracking-widest text-brand-charcoal-muted font-bold">COMPANION DESK</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[11px]">
            <div className="space-y-0.5">
              <span className="text-[9px] text-brand-charcoal-muted/70 block uppercase font-mono">Academic Term</span>
              <span className="text-brand-charcoal font-medium">Week 7 • Sem II</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-brand-charcoal-muted/70 block uppercase font-mono">Current period</span>
              <span className="text-brand-charcoal font-medium">Period 4 (12-A)</span>
            </div>
            <div className="space-y-0.5 col-span-2 pt-1.5 border-t border-brand-stone-soft/30 flex items-center justify-between">
              <span className="text-[9px] text-brand-charcoal-muted block uppercase font-mono">Current Streak</span>
              <span className="text-brand-charcoal font-semibold flex items-center gap-1 text-[11px]">
                {userRole === 'teacher' ? '12 Days 🔥' : '8 Days 🔥'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer with user context as in design */}
        <div className="p-6 border-t border-brand-stone-soft/60 bg-brand-cream">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-beige border border-brand-stone-soft/85 flex items-center justify-center text-[10px] font-bold text-brand-charcoal">
              {userRole === 'teacher' ? 'DG' : 'PS'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-brand-charcoal truncate">
                {userRole === 'teacher' ? 'Dravina Gupta' : 'Pranav Sharma'}
              </p>
              <p className="text-[10px] text-brand-charcoal-muted truncate">
                {userRole === 'teacher' ? 'Lead Educator' : 'Student Access'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-brand-charcoal-muted hover:text-brand-charcoal hover:bg-brand-beige/50 rounded-xs cursor-pointer text-left transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header/Navigation bar */}
        <header className="h-16 bg-white/50 border-b border-brand-stone-soft flex items-center justify-between px-6 md:px-8 z-10 backdrop-blur-xs">
          
          {/* Left Side: Mobile Hamburger & Breadcrumbs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1.5 rounded-xs text-brand-charcoal hover:bg-brand-beige/40 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb component matching design precisely */}
            <div className="hidden sm:flex items-center space-x-2 text-[13px] font-sans text-brand-charcoal-muted">
              <span>PsySphere</span>
              <span className="opacity-40">/</span>
              <span className="hover:text-brand-charcoal cursor-pointer capitalize text-brand-sage font-medium">{userRole} Workspace</span>
              <span className="opacity-40">/</span>
              <span className="text-brand-charcoal font-semibold">{activeItem.label}</span>
            </div>
            
            {/* Small identifier for extremely narrow viewports */}
            <span className="sm:hidden font-serif text-sm font-medium text-brand-charcoal truncate max-w-[120px]">
              {activeItem.label}
            </span>
          </div>

          {/* Right Side: Search, Notifications & Profile */}
          <div className="flex items-center space-x-4">
            {/* Search inputs styled as sleek "btn-subtle" with input */}
            <div className="relative hidden lg:block w-52 xl:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-charcoal-muted" />
              <input
                type="text"
                placeholder="Search Workspace (⌘K)..."
                readOnly
                onClick={() => {
                  setIsCommandOpen(true);
                  setCommandSearch('');
                  setSelectedIndex(0);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-stone-soft rounded-xs focus:outline-none hover:border-brand-charcoal font-sans text-brand-charcoal placeholder:text-brand-charcoal-muted/60 shadow-2xs transition-all cursor-pointer"
              />
            </div>

            {/* Notification button and drop placeholder */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-brand-sage hover:text-brand-charcoal hover:bg-brand-beige/30 border border-brand-stone-soft rounded-xs cursor-pointer transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-charcoal rounded-full border border-white" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setShowNotifications(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-brand-stone-soft rounded-xs shadow-lg p-4 z-30"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-brand-stone-soft/50 mb-2">
                        <span className="text-xs font-semibold text-brand-charcoal">Notifications</span>
                        <button className="text-[10px] text-brand-charcoal hover:underline font-medium">Mark all read</button>
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto pt-1">
                        <div className="text-left p-2 rounded-xs hover:bg-brand-cream transition-colors">
                          <p className="text-xs font-medium text-brand-charcoal">New Lecture Added</p>
                          <p className="text-[10px] text-brand-charcoal-muted mt-0.5 font-light">Chapter 4: Psychological Disorders lecture link has been updated.</p>
                          <span className="text-[9px] text-brand-charcoal-muted/60 mt-1 block">10 mins ago</span>
                        </div>
                        <div className="text-left p-2 rounded-xs hover:bg-brand-cream transition-colors">
                          <p className="text-xs font-medium text-brand-charcoal">Grading Complete</p>
                          <p className="text-[10px] text-brand-charcoal-muted mt-0.5 font-light">Assignment 3 marks are now updated in the Ledger.</p>
                          <span className="text-[9px] text-brand-charcoal-muted/60 mt-1 block">3 hours ago</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-brand-beige border border-brand-stone-soft flex items-center justify-center text-[10px] font-bold text-brand-charcoal select-none">
                {userRole === 'teacher' ? 'AS' : 'PS'}
              </div>
            </div>
            
          </div>
        </header>

        {/* 3. Main content body panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* 4. Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Slider container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-brand-cream z-50 md:hidden flex flex-col border-r border-brand-stone-soft shadow-xl"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-brand-stone-soft/60 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand-charcoal flex items-center justify-center text-white font-serif italic text-lg rounded-xs">
                    P
                  </div>
                  <span className="font-serif text-lg font-semibold tracking-tight text-brand-charcoal">
                    PsySphere
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-xs text-brand-charcoal hover:bg-brand-beige"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Identity Banner */}
              <div className="p-4 bg-brand-cream border-b border-brand-stone-soft/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-brand-beige flex items-center justify-center font-serif text-xs font-semibold text-brand-charcoal">
                    {userRole === 'teacher' ? 'DG' : 'PS'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-brand-charcoal truncate">
                      {userRole === 'teacher' ? 'Dravina Gupta' : 'Pranav Sharma'}
                    </p>
                    <p className="text-[10px] text-brand-charcoal-muted uppercase">
                      {userRole} • Class 12
                    </p>
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-3 space-y-1 py-4">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onActiveIdChange(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm font-medium font-sans rounded-xs transition-colors text-left',
                        isActive
                          ? 'bg-brand-beige text-brand-charcoal font-semibold'
                          : 'text-brand-sage hover:text-brand-charcoal hover:bg-brand-beige/50'
                      )}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={cn('h-4.5 w-4.5 shrink-0 opacity-70', isActive ? 'text-brand-charcoal opacity-100' : 'text-brand-sage')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] bg-brand-beige text-brand-charcoal px-1.5 py-0.5 rounded-xs font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-brand-stone-soft/60">
                <button
                  onClick={async () => {
                    setIsMobileOpen(false);
                    await handleSignOut();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-brand-charcoal-muted hover:text-brand-charcoal hover:bg-brand-beige/50 rounded-xs cursor-pointer text-left transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Switch Access / Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. Raycast-style Academic Command Search Modal */}
      <AnimatePresence>
        {isCommandOpen && (
          <>
            {/* Dark Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandOpen(false)}
              className="fixed inset-0 bg-brand-charcoal/20 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            >
              {/* Central Raycast Console Card */}
              <motion.div
                initial={{ scale: 0.96, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 15 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl bg-white border border-[#E7E0D8] rounded-md shadow-2xl overflow-hidden flex flex-col h-[420px] font-sans"
              >
                {/* Search Bar Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-brand-stone-soft/50 shrink-0">
                  <Search className="h-4.5 w-4.5 text-brand-charcoal-muted" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search classes, directory, notes, study topics..."
                    value={commandSearch}
                    onChange={(e) => {
                      setCommandSearch(e.target.value);
                      setSelectedIndex(0);
                    }}
                    onKeyDown={handleCommandKeyDown}
                    className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 text-brand-charcoal placeholder:text-brand-charcoal-muted/50"
                  />
                  <div className="text-[10px] bg-brand-beige border border-brand-stone-soft text-brand-charcoal px-2 py-0.5 rounded-xs font-mono select-none font-bold">
                    ESC
                  </div>
                </div>

                {/* Categorized Live Results Section */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 select-none">
                  {filteredCommands.length > 0 ? (
                    (() => {
                      // Group commands by category
                      const categories: { [key: string]: typeof commandItems } = {};
                      filteredCommands.forEach(cmd => {
                        if (!categories[cmd.category]) {
                          categories[cmd.category] = [];
                        }
                        categories[cmd.category].push(cmd);
                      });

                      let absoluteIndex = 0;

                      return Object.entries(categories).map(([category, items]) => (
                        <div key={category} className="space-y-1">
                          <div className="text-[9px] font-bold text-brand-charcoal-muted uppercase tracking-widest px-3 py-1.5 font-mono">
                            {category}
                          </div>
                          <div className="space-y-0.5">
                            {items.map((cmd) => {
                              const currIndex = absoluteIndex;
                              absoluteIndex++;
                              const isSelected = currIndex === selectedIndex;
                              
                              return (
                                <div
                                  key={cmd.id}
                                  onClick={() => triggerCommand(cmd)}
                                  onMouseEnter={() => setSelectedIndex(currIndex)}
                                  className={cn(
                                    "flex items-center justify-between px-3.5 py-2.5 rounded-xs cursor-pointer transition-colors text-left",
                                    isSelected 
                                      ? "bg-[#F5F2EC] text-brand-charcoal border-l-2 border-brand-charcoal" 
                                      : "hover:bg-[#FAF8F5] text-brand-charcoal-muted"
                                  )}
                                >
                                  <div className="min-w-0 pr-4">
                                    <p className={cn("text-xs font-semibold truncate", isSelected ? "text-brand-charcoal" : "text-brand-charcoal-muted")}>
                                      {cmd.title}
                                    </p>
                                    <p className="text-[10px] text-brand-charcoal-muted/70 mt-0.5 truncate font-light">
                                      {cmd.subtitle}
                                    </p>
                                  </div>
                                  <div className="shrink-0 flex items-center gap-1.5">
                                    {isSelected && (
                                      <span className="text-[9px] text-brand-charcoal-muted uppercase tracking-widest font-mono font-bold flex items-center gap-1">
                                        Open <span className="border border-brand-stone-soft px-1 rounded-sm">↵</span>
                                      </span>
                                    )}
                                    <Badge variant="neutral" className="text-[8px] py-0 px-1.5 border-transparent bg-brand-cream text-brand-charcoal select-none uppercase tracking-wider">
                                      {cmd.action}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <p className="text-sm font-semibold text-brand-charcoal">No results match &quot;{commandSearch}&quot;</p>
                      <p className="text-xs text-brand-charcoal-muted mt-1 max-w-xs font-light leading-relaxed">
                        Try looking for key topics like &quot;Spearman&quot;, student names like &quot;Pranav&quot; or chapter guides.
                      </p>
                    </div>
                  )}
                </div>

                {/* Command Footer */}
                <div className="px-4 py-2 bg-brand-cream/40 border-t border-brand-stone-soft/30 shrink-0 flex items-center justify-between text-[10px] text-brand-charcoal-muted font-mono select-none">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="border border-brand-stone-soft bg-white px-1 py-0.2 rounded-sm font-bold">↑↓</span> Navigate</span>
                    <span className="flex items-center gap-1"><span className="border border-brand-stone-soft bg-white px-1 py-0.2 rounded-sm font-bold">↵</span> Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Raycast Command Console</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
