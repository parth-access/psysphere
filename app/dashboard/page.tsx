'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/features/shared/layout/AppShell';
import { H1, H2, H3, Subtitle, Body, Code } from '@/features/shared/ui/Typography';
import { Button } from '@/features/shared/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/features/shared/ui/Card';
import { Input, Textarea, Select } from '@/features/shared/ui/Input';
import { Badge } from '@/features/shared/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/features/shared/ui/Table';
import { Dialog } from '@/features/shared/ui/Dialog';
import { EmptyState } from '@/features/shared/ui/EmptyState';
import { LoadingState } from '@/features/shared/ui/LoadingState';
import { SearchBar } from '@/features/shared/ui/SearchBar';
import { Filters } from '@/features/shared/ui/Filters';
import { 
  Sparkles, 
  Plus, 
  HelpCircle, 
  FileCode, 
  ExternalLink, 
  SlidersHorizontal, 
  BookOpen, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Clock,
  ArrowRight,
  Quote,
  Users,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  GraduationCap
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<LoadingState mode="full" />}>
      <DashboardContent />
    </React.Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Resolve role from search parameters immediately to avoid setState inside useEffect
  const roleParam = searchParams.get('role');
  const role: 'teacher' | 'student' = (roleParam === 'student' || roleParam === 'teacher') ? roleParam : 'teacher';
  
  const setRole = (newRole: 'teacher' | 'student') => {
    router.push(`/dashboard?role=${newRole}`);
  };
  
  const [activeTab, setActiveTab] = React.useState('overview');
  
  // Interactive component states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isBtnLoading, setIsBtnLoading] = React.useState(false);
  const [searchVal, setSearchVal] = React.useState('');
  const [filterVal, setFilterVal] = React.useState('all');
  
  // Form input mock states
  const [formName, setFormName] = React.useState('');
  const [formChapter, setFormChapter] = React.useState('Ch 1');
  const [formText, setFormText] = React.useState('');

  const handleLogout = () => {
    // Return to the minimal landing page
    router.push('/');
  };

  // Demo actions
  const triggerButtonLoading = () => {
    setIsBtnLoading(true);
    setTimeout(() => setIsBtnLoading(false), 2000);
  };

  return (
    <AppShell
      activeId={activeTab}
      onActiveIdChange={setActiveTab}
      userRole={role}
      onLogout={handleLogout}
    >
      <SuspendedDashboardContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isBtnLoading={isBtnLoading}
        triggerButtonLoading={triggerButtonLoading}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        filterVal={filterVal}
        setFilterVal={setFilterVal}
        formName={formName}
        setFormName={setFormName}
        formChapter={formChapter}
        setFormChapter={setFormChapter}
        formText={formText}
        setFormText={setFormText}
        setRole={setRole}
      />
    </AppShell>
  );
}

// Separate component for clarity and rendering logic
interface ContentProps {
  activeTab: string;
  setActiveTab: (val: string) => void;
  role: 'teacher' | 'student';
  isDialogOpen: boolean;
  setIsDialogOpen: (val: boolean) => void;
  isBtnLoading: boolean;
  triggerButtonLoading: () => void;
  searchVal: string;
  setSearchVal: (val: string) => void;
  filterVal: string;
  setFilterVal: (val: string) => void;
  formName: string;
  setFormName: (val: string) => void;
  formChapter: string;
  setFormChapter: (val: string) => void;
  formText: string;
  setFormText: (val: string) => void;
  setRole: (val: 'teacher' | 'student') => void;
}

const SuspendedDashboardContent = ({
  activeTab,
  setActiveTab,
  role,
  isDialogOpen,
  setIsDialogOpen,
  isBtnLoading,
  triggerButtonLoading,
  searchVal,
  setSearchVal,
  filterVal,
  setFilterVal,
  formName,
  setFormName,
  formChapter,
  setFormChapter,
  formText,
  setFormText,
  setRole,
}: ContentProps) => {

  // Mock static data matching Class 11 & 12 psychology curriculum
  const academicResources = [
    { id: '1', title: 'Sensory, Attentional & Perceptual Processes', chapter: 'Chapter 5', grade: 'Class 11', type: 'Handwritten Notes', size: '4.2 MB' },
    { id: '2', title: 'Methods of Enquiry in Psychology', chapter: 'Chapter 2', grade: 'Class 11', type: 'Reference Sheet', size: '1.8 MB' },
    { id: '3', title: 'Variations in Psychological Attributes', chapter: 'Chapter 1', grade: 'Class 12', type: 'Revision Blueprint', size: '3.1 MB' },
    { id: '4', title: 'Self and Personality', chapter: 'Chapter 2', grade: 'Class 12', type: 'Concept Map', size: '2.5 MB' },
    { id: '5', title: 'Meeting Life Challenges (Stress)', chapter: 'Chapter 3', grade: 'Class 12', type: 'Practice Questions', size: '1.2 MB' },
  ];

  const lecturesList = [
    { id: 'l1', title: 'Intelligence Theories & Attributes', time: 'Today, 04:30 PM', grade: 'Class 12', platform: 'PsySphere Sync', status: 'live' },
    { id: 'l2', title: 'Human Development Principles', time: 'Tomorrow, 05:00 PM', grade: 'Class 11', platform: 'PsySphere Sync', status: 'upcoming' },
    { id: 'l3', title: 'Perceptual Process Theories', time: 'July 12, 04:00 PM', grade: 'Class 11', platform: 'PsySphere Sync', status: 'upcoming' },
  ];

  const assignmentsList = [
    { id: 'a1', title: 'Personality Assessment Writeup', deadline: 'July 15, 11:59 PM', grade: 'Class 12', status: 'Pending', points: '50' },
    { id: 'a2', title: 'Stress Coping Strategies Case Study', deadline: 'Completed', grade: 'Class 12', status: 'Graded', points: '45/50' },
    { id: 'a3', title: 'Methods of Enquiry Exercise Sheet', deadline: 'July 19, 06:00 PM', grade: 'Class 11', status: 'Pending', points: '30' },
  ];

  const gradingList = [
    { id: 'g1', student: 'Pranav Sharma', grade: 'Class 12', assignment: 'Self & Personality Essay', score: '46/50', status: 'Graded' },
    { id: 'g2', student: 'Ishita Kapoor', grade: 'Class 12', assignment: 'Self & Personality Essay', score: '42/50', status: 'Graded' },
    { id: 'g3', student: 'Kabir Mehta', grade: 'Class 11', assignment: 'Methods of Enquiry Exercise', score: 'Pending', status: 'Under Review' },
  ];

  // Search and Filter calculations
  const filteredResources = academicResources.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchVal.toLowerCase()) || 
                          res.chapter.toLowerCase().includes(searchVal.toLowerCase());
    const matchesFilter = filterVal === 'all' || 
                          (filterVal === 'class11' && res.grade === 'Class 11') ||
                          (filterVal === 'class12' && res.grade === 'Class 12');
    return matchesSearch && matchesFilter;
  });

  // Dynamic Hero Day state (defaulting to Thursday, matching July 9, 2026)
  const [activeHeroDay, setActiveHeroDay] = React.useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Thursday');
  // Weekend / Empty State simulation state
  const [isEmptyStateMode, setIsEmptyStateMode] = React.useState(false);
  // Morning Journal Insight reveal state
  const [isInsightRevealed, setIsInsightRevealed] = React.useState(false);
  const [journalReflection, setJournalReflection] = React.useState('');
  const [isSavedReflection, setIsSavedReflection] = React.useState(false);
  const [isPageFlipping, setIsPageFlipping] = React.useState(false);

  // Timeline schedule state controllers
  const [simulatedHour, setSimulatedHour] = React.useState<number>(12);
  const [isScheduleEmpty, setIsScheduleEmpty] = React.useState(false);

  // Custom checklists stored per day of the week for Teacher & Student
  const [dayChecklists, setDayChecklists] = React.useState({
    teacher: {
      Monday: [
        { id: 'tm1', text: 'Verify Spearman variations worksheet handouts', checked: true },
        { id: 'tm2', text: 'Print individual student intelligence profile logs', checked: false },
        { id: 'tm3', text: 'Review Kabir Mehta\'s cognitive observations', checked: false }
      ],
      Tuesday: [
        { id: 'tt1', text: 'Grade Ishita Kapoor\'s personality writeup', checked: true },
        { id: 'tt2', text: 'Review Kabir Mehta\'s methods of enquiry workbook', checked: false },
        { id: 'tt3', text: 'Publish feedback marks to student planners', checked: false }
      ],
      Wednesday: [
        { id: 'tw1', text: 'Load cognitive models presentation slides', checked: true },
        { id: 'tw2', text: 'Compile Chapter 2 reference blueprints PDF', checked: false },
        { id: 'tw3', text: 'Formulate 5 sample board evaluation questions', checked: false }
      ],
      Thursday: [
        { id: 'tth1', text: 'Audit Class 12-A attendance spreadsheet logs', checked: true },
        { id: 'tth2', text: 'Set up remedial materials for underperforming topics', checked: false },
        { id: 'tth3', text: 'Prepare interactive study guides for Chapter 3 stress', checked: false }
      ],
      Friday: [
        { id: 'tf1', text: 'Finalize Chapter 1 feedback files', checked: true },
        { id: 'tf2', text: 'Schedule upcoming Monday session calendar', checked: false },
        { id: 'tf3', text: 'Sync database records for regional study boards', checked: true }
      ]
    },
    student: {
      Monday: [
        { id: 'sm1', text: 'Read Chapter 1 introduction brief (Variations)', checked: false },
        { id: 'sm2', text: 'Download Spearman concept maps PDF', checked: true },
        { id: 'sm3', text: 'Set up physical notebook and review study questions', checked: false }
      ],
      Tuesday: [
        { id: 'st1', text: 'Draft post-Freudian theory comparisons', checked: true },
        { id: 'st2', text: 'Proofread id, ego, superego diagram explanations', checked: false },
        { id: 'st3', text: 'Click Submit Homework in assignments tab', checked: false }
      ],
      Wednesday: [
        { id: 'sw1', text: 'Download stress coping guide blueprint', checked: true },
        { id: 'sw2', text: 'Draft cognitive appraisal outline paper', checked: false },
        { id: 'sw3', text: 'Compare answers with standard syllabus guidelines', checked: false }
      ],
      Thursday: [
        { id: 'sth1', text: 'Review Spearman two-factor definition', checked: true },
        { id: 'sth2', text: 'List 3 doubts on Thurstone multidimensional models', checked: false },
        { id: 'sth3', text: 'Join live Call in Schedule tab', checked: false }
      ],
      Friday: [
        { id: 'sf1', text: 'Open grading notes in assignments tab', checked: false },
        { id: 'sf2', text: 'Incorporate notes into physical study journal', checked: true },
        { id: 'sf3', text: 'Mark Unit 1 as fully revised in planner', checked: false }
      ]
    }
  });

  const toggleDayChecklist = (userType: 'teacher' | 'student', day: string, itemId: string) => {
    setDayChecklists(prev => {
      const targetList = prev[userType][day as keyof typeof prev.teacher];
      const updatedList = targetList.map((item: any) => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      return {
        ...prev,
        [userType]: {
          ...prev[userType],
          [day]: updatedList
        }
      };
    });
  };

  // Rotating teacher daily hero contexts (Req 1)
  const teacherDayContexts = {
    Monday: {
      badge: 'Parent Meetings & Reviews',
      title: 'SPEARMAN VARIATIONS & PARENT DISCUSSIONS',
      desc: 'Scheduled parent-teacher touchpoint slots starting at 02:00 PM today. Ensure individual student intelligence report sheets are indexed.',
      sub: '4 parents scheduled • 18 portfolio files ready',
      button: 'Review Portfolio Lists',
      actionTab: 'grading'
    },
    Tuesday: {
      badge: 'Evaluation Desk Sprints',
      title: '4 PENDING MIDTERM SUBMISSIONS READY',
      desc: 'Midterm essays for Self and Personality are waiting for qualitative guidance. Set aside blocks for direct student appraisal feedback.',
      sub: 'Class 12-A • Unit 2 Self & Personality essays',
      button: 'Open Grading Ledger',
      actionTab: 'grading'
    },
    Wednesday: {
      badge: 'Curriculum Sprints',
      title: 'MIDTERM PREPARATION & BLUEPRINT LAYOUTS',
      desc: 'Class 11 methods of enquiry structured observations sprint. Load cognitive appraisal guidelines before 04:00 PM.',
      sub: 'Class 11-B • 20 registered students',
      button: 'Compile Study Materials',
      actionTab: 'materials'
    },
    Thursday: {
      badge: 'Performance Insights',
      title: 'ATTENDANCE TRACKS & UNIT 3 CHECK-INS',
      desc: 'Average weekly classroom attendance has sustained at 92%. Identify students with missing check-ins on Unit 3 challenges.',
      sub: 'Sustained 92% Attendance rate • 18 registered',
      button: 'Inspect Classes Timeline',
      actionTab: 'classes'
    },
    Friday: {
      badge: 'Weekly Wrap Sprints',
      title: 'TEACHING RECORDS & PORTFOLIO WRAP',
      desc: 'Congratulations! You\'ve taught 18 registered students across 5 interactive live sessions this week. Wrap up weekly progress files.',
      sub: '18 students engaged • 5 live sessions completed',
      button: 'See Lecture Ledger',
      actionTab: 'materials'
    }
  };

  // Rotating student daily hero contexts (Req 1)
  const studentDayContexts = {
    Monday: {
      badge: 'Study Goal Kickoff',
      title: 'CHAPTER 1 DETAILED ANNOTATION CHALLENGE',
      desc: 'Read the variations in psychological attributes text. Complete 3 annotating exercises in your physical learning journal.',
      sub: 'Chapter 1 attributes • Est. time: 45 mins',
      button: 'Explore Resources',
      actionTab: 'materials'
    },
    Tuesday: {
      badge: 'Homework Milestones',
      title: 'SUBMIT CLASS 12 PERSONALITY WRITING BRIEF',
      desc: 'Finish and submit the Freudian structural balance case writeup. Review Freuds id, ego, and superego balance schemas.',
      sub: '50 marks weight • Submit prior to 11:59 PM',
      button: 'Submit Assignment',
      actionTab: 'assignments'
    },
    Wednesday: {
      badge: 'Blueprint Reviews',
      title: 'COGNITIVE STRESS APPRAISAL FLOWCHARTS',
      desc: 'Go over the appraisal model flowchart compiled by Dr. Sen. Try solving 3 past exam board prompts for Unit 3.',
      sub: 'Unit 3 Coping with Stress • 3 practice prompts',
      button: 'Browse Flowcharts',
      actionTab: 'materials'
    },
    Thursday: {
      badge: 'Live Sync Session',
      title: 'SPEARMAN THEORY CRITICAL DISCUSSION',
      desc: 'Participate in today\'s live interactive video discussion on Spearman Two-factor theory. Ensure your notes are open.',
      sub: '04:30 PM starts • Join Dr. Sen live sync call',
      button: 'Join Classroom Sync',
      actionTab: 'classes'
    },
    Friday: {
      badge: 'Weekly Wrap Synthesis',
      title: 'REFLECT ON STUDY STREAKS & FEEDBACK',
      desc: 'Sustained an 8-day learning streak! Go through Dr. Sen\'s qualitative feedback notes on your personality essay.',
      sub: '8-day active streak 🔥 • Graded essay feedback ready',
      button: 'Read Teacher Notes',
      actionTab: 'assignments'
    }
  };

  const handleRoleToggle = (newRole: 'teacher' | 'student') => {
    setIsPageFlipping(true);
    setTimeout(() => {
      setRole(newRole);
      setIsPageFlipping(false);
    }, 550);
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Immersive Signature Page Turn Overlay (Requirement 8) */}
      <AnimatePresence>
        {isPageFlipping && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#F5F2EC] z-50 pointer-events-none shadow-2xl flex items-center justify-center border-l border-[#E7E0D8]"
          >
            <div className="font-serif italic text-3xl text-brand-charcoal-muted opacity-30 select-none">
              Turning Journal Page...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview/Daily Desk Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-slide-up">
          
          {/* Header section with human greeting and controls */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b border-brand-stone-soft/50">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest text-brand-charcoal-muted uppercase font-bold">
                {role === 'teacher' ? 'EDUCATOR CONTROL DESK' : 'STUDENT LEARNING JOURNAL'}
              </span>
              <H1 className="text-3xl font-serif font-normal leading-tight text-brand-charcoal">
                Good morning, <span className="italic">{role === 'teacher' ? 'Dr. Aristha Sen.' : 'Pranav Sharma.'}</span>
              </H1>
              <Subtitle className="text-sm font-light text-brand-charcoal-muted">
                {role === 'teacher' 
                  ? 'Welcome back to your workspace. You have 2 classes slated on your active timeline today.' 
                  : 'Welcome back, student. Keep up with scheduled updates and log today\'s academic reflections.'
                }
              </Subtitle>
            </div>
            
            {/* Acting Role Trigger (Switch View) */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-[#F5F2EC] p-1 border border-brand-stone-soft rounded-xs">
                <span className="text-[9px] font-sans text-brand-charcoal-muted px-2 uppercase tracking-wider font-semibold">Switch Role</span>
                <Button 
                  variant={role === 'teacher' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleRoleToggle('teacher')}
                  className="text-[10px] py-0.5 px-2.5 border-transparent h-7"
                >
                  Teacher
                </Button>
                <Button 
                  variant={role === 'student' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleRoleToggle('student')}
                  className="text-[10px] py-0.5 px-2.5 border-transparent h-7"
                >
                  Student
                </Button>
              </div>
            </div>
          </div>

          {/* Dynamic Day Selector Indicator & Weekend Simulation Controls (Requirement 1 & 6) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#FAF8F5]/85 border border-brand-stone-soft/50 rounded-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-mono text-brand-charcoal-muted/90 uppercase tracking-widest font-bold">Simulate Day:</span>
              <div className="flex flex-wrap items-center gap-1 bg-[#F5F2EC] p-0.5 border border-[#E7E0D8] rounded-xs">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((dayName) => (
                  <button
                    key={dayName}
                    onClick={() => setActiveHeroDay(dayName)}
                    className={`text-[10px] px-2.5 py-1 rounded-xs transition-colors font-semibold ${activeHeroDay === dayName ? 'bg-brand-charcoal text-white shadow-2xs' : 'text-brand-charcoal-muted hover:text-brand-charcoal'}`}
                  >
                    {dayName.slice(0,3)}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-mono text-brand-charcoal-muted italic">
                (Schedules active tasks for {activeHeroDay})
              </span>
            </div>

            {/* Empty State / Weekend Trigger */}
            <button
              onClick={() => setIsEmptyStateMode(prev => !prev)}
              className={`text-[10px] px-3 py-1 border rounded-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${isEmptyStateMode ? 'bg-brand-charcoal border-brand-charcoal text-white' : 'bg-transparent border-brand-stone-soft text-brand-charcoal-muted hover:text-brand-charcoal'}`}
            >
              {isEmptyStateMode ? '● Simulating Weekend Recess' : '○ Toggle Weekend Mode'}
            </button>
          </div>

          {/* Render Weekend/Holiday Empty State Preview if simulated (Requirement 6) */}
          {isEmptyStateMode ? (
            <div className="py-12 border border-dashed border-[#E7E0D8] rounded-xs bg-[#FCFBF9] text-center max-w-3xl mx-auto p-8 space-y-6 animate-slide-up">
              <div className="w-12 h-12 rounded-full bg-brand-cream border border-brand-stone-soft/70 flex items-center justify-center mx-auto text-brand-charcoal">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-normal text-brand-charcoal">A Quiet Space for Reflection</h3>
                <p className="text-xs text-brand-charcoal-muted font-light leading-relaxed max-w-lg mx-auto">
                  There are no live sync discussions, parent-teacher reviews, or active homework submissions scheduled for today. Enjoy your academic recess.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="primary" size="sm" onClick={() => setActiveTab('materials')} className="text-xs font-sans">
                  Browse Reading Archive
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEmptyStateMode(false)} className="text-xs font-sans bg-white hover:bg-brand-cream border-[#E7E0D8]">
                  Return to Active Day
                </Button>
              </div>
            </div>
          ) : (
            role === 'teacher' ? (
              /* ==================== TEACHER WORKSPACE (Req 9: Control Desk layout) ==================== */
              <div className="space-y-8 animate-slide-up">
                
                {/* Morning Journal Reflection (Req 8 - Signature Moment) */}
                <div className="relative overflow-hidden bg-[#FCFBF7] border border-[#E7E0D8] rounded-xs p-6 shadow-sm font-serif">
                  <div className="absolute top-2.5 right-3.5 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-brand-charcoal-muted/70 uppercase">
                    <Sparkles className="h-3 w-3 text-brand-charcoal-muted animate-pulse" /> SIGNATURE REFLECTION JOURNAL
                  </div>
                  
                  <div className="space-y-4 max-w-2xl">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono tracking-widest text-brand-charcoal-muted uppercase font-semibold">Today&apos;s Pedagogical Insight</span>
                      <h3 className="text-xl text-brand-charcoal italic font-normal leading-relaxed">
                        &quot;The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.&quot;
                      </h3>
                      <p className="text-[10px] font-mono text-brand-charcoal-muted">— Carl G. Jung</p>
                    </div>
                    
                    <div className="pt-2">
                      {!isInsightRevealed ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsInsightRevealed(true)} 
                          className="text-xs bg-white hover:bg-[#F5F2EC] border-[#E7E0D8] py-1.5 h-8 font-sans gap-1.5"
                        >
                          Access Today&apos;s Reflections <ChevronRight className="h-3 w-3" />
                        </Button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 pt-3 border-t border-brand-stone-soft/50 font-sans"
                        >
                          <p className="text-xs text-brand-charcoal-muted font-light leading-relaxed">
                            Pedagogical Prompt: How will you foster a genuine mental chemistry during today&apos;s Gardner & Spearman attributes class?
                          </p>
                          
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a brief journal reflection note..."
                              value={journalReflection}
                              onChange={(e) => setJournalReflection(e.target.value)}
                              className="flex-1 text-xs px-3 py-1.5 bg-white border border-[#E7E0D8] rounded-xs focus:outline-none focus:border-brand-charcoal font-serif italic text-brand-charcoal"
                            />
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => {
                                if (journalReflection.trim()) {
                                  setIsSavedReflection(true);
                                  setTimeout(() => setIsSavedReflection(false), 2000);
                                }
                              }}
                              className="text-xs py-1.5 h-8 font-sans"
                            >
                              Log Entry
                            </Button>
                          </div>
                          {isSavedReflection && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1"
                            >
                              ✓ Entry recorded into your physical portfolio ledger.
                            </motion.p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Two-Column split for high-density monitoring */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column (2/3): Rotating Daily Hero Workspace & Today's Schedule */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Rotating Contextual Hero Card (Requirement 1) */}
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeHeroDay}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        whileHover={{ y: -1, transition: { duration: 0.15 } }}
                        className="relative overflow-hidden border border-[#E7E0D8] bg-white rounded-xs p-6 md:p-8 shadow-xs"
                      >
                        <div className="absolute top-0 right-0">
                          <div className="bg-brand-charcoal text-white text-[9px] uppercase tracking-widest font-semibold px-4 py-2 rounded-bl-xs">
                            {activeHeroDay.toUpperCase()}&apos;S DESK CONTEXT
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-800 font-bold">
                              {teacherDayContexts[activeHeroDay].badge}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-serif text-2xl font-normal leading-snug text-brand-charcoal tracking-tight">
                              {teacherDayContexts[activeHeroDay].title}
                            </h3>
                            <p className="text-xs text-brand-charcoal-muted font-light leading-relaxed max-w-xl">
                              {teacherDayContexts[activeHeroDay].desc}
                            </p>
                          </div>

                          {/* Dynamic Active Preparation Checklist for Day */}
                          <div className="pt-4 pb-1 space-y-2 border-t border-brand-stone-soft/30">
                            <h4 className="text-[10px] uppercase font-mono text-brand-charcoal-muted tracking-widest font-bold">ACTIVE WORKLIST FOR TODAY</h4>
                            <div className="space-y-2 pt-1">
                              {dayChecklists.teacher[activeHeroDay].map((item: any) => (
                                <label key={item.id} className="flex items-start gap-2.5 text-xs text-brand-charcoal cursor-pointer group select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={item.checked} 
                                    onChange={() => toggleDayChecklist('teacher', activeHeroDay, item.id)}
                                    className="mt-0.5 rounded-sm border-brand-stone-soft accent-brand-charcoal text-brand-charcoal"
                                  />
                                  <span className={`font-light transition-colors ${item.checked ? 'line-through text-brand-charcoal-muted/65' : 'group-hover:text-brand-charcoal'}`}>
                                    {item.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 flex flex-wrap gap-3 items-center justify-between text-xs text-brand-charcoal-muted border-t border-brand-stone-soft/20">
                            <span className="font-mono text-[10px]">
                              Stats: <span className="font-semibold text-brand-charcoal">{teacherDayContexts[activeHeroDay].sub}</span>
                            </span>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => setActiveTab(teacherDayContexts[activeHeroDay].actionTab)} 
                              className="text-[11px] h-8 px-4"
                            >
                              {teacherDayContexts[activeHeroDay].button} <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Today's Lectures (Open borderless layout - Req 2) */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E7E0D8]/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-brand-charcoal" />
                          <h3 className="text-base font-serif font-normal text-brand-charcoal">Slated Daily Lectures</h3>
                        </div>
                        <button 
                          className="text-xs text-brand-charcoal-muted hover:text-brand-charcoal font-light underline underline-offset-4" 
                          onClick={() => setActiveTab('classes')}
                        >
                          See full schedule details
                        </button>
                      </div>

                      {/* Clean timeline cards represent actual active lectures */}
                      <div className="space-y-3">
                        <div className="flex gap-4 items-start p-4 bg-white border border-brand-stone-soft/50 hover:border-brand-charcoal/30 transition-all rounded-xs">
                          <div className="text-right shrink-0 w-16 pt-0.5">
                            <p className="text-xs font-mono font-bold text-brand-charcoal">16:30</p>
                            <p className="text-[9px] text-brand-charcoal-muted font-light">60 mins</p>
                          </div>
                          <div className="w-[1.5px] h-10 bg-emerald-500 shrink-0 self-stretch" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-xs font-semibold uppercase font-mono">Live Call Ready</span>
                              <Badge variant="accent">Class 12</Badge>
                            </div>
                            <h4 className="text-sm font-semibold text-brand-charcoal mt-1 truncate">Intelligence Theories & Attributes</h4>
                            <p className="text-[11px] text-brand-charcoal-muted font-light mt-0.5">Focus: Spearman & Thurstone models</p>
                          </div>
                          <Button variant="primary" size="sm" onClick={() => setActiveTab('classes')} className="text-xs h-8">
                            Join Sync
                          </Button>
                        </div>

                        <div className="flex gap-4 items-start p-4 bg-[#FAF8F5]/80 border border-brand-stone-soft/30 rounded-xs">
                          <div className="text-right shrink-0 w-16 pt-0.5">
                            <p className="text-xs font-mono text-brand-charcoal-muted">18:00</p>
                            <p className="text-[9px] text-brand-charcoal-muted font-light">45 mins</p>
                          </div>
                          <div className="w-[1px] h-10 bg-brand-stone-soft shrink-0 self-stretch" />
                          <div className="flex-1 min-w-0 opacity-75">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] bg-brand-cream text-brand-charcoal border border-brand-stone-soft px-1.5 py-0.2 rounded-xs font-mono">Upcoming</span>
                              <Badge variant="neutral">Class 11</Badge>
                            </div>
                            <h4 className="text-sm font-semibold text-brand-charcoal mt-1 truncate">Methods of Enquiry in Psychology</h4>
                            <p className="text-[11px] text-brand-charcoal-muted font-light mt-0.5">Focus: Structured observation datasets</p>
                          </div>
                          <Button variant="outline" size="sm" disabled className="text-xs h-8 opacity-50 cursor-not-allowed">
                            Scheduled
                          </Button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column (1/3): High density widgets (No border wrappers, just breathing widgets!) */}
                  <div className="space-y-6">
                    
                    {/* Class Statistics Bento Desk (Teacher Visual Element) */}
                    <div className="space-y-3 p-1">
                      <div className="text-[10px] font-mono tracking-widest text-brand-charcoal-muted uppercase font-bold border-b border-brand-stone-soft/30 pb-1.5">
                        CLASS METRIC BENCHMARKS
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5 pt-1">
                        <div className="p-4 bg-brand-cream/40 border border-brand-stone-soft/60 rounded-xs">
                          <span className="text-[9px] font-mono text-brand-charcoal-muted uppercase tracking-wider block">Cohort Enrollment</span>
                          <span className="text-2xl font-serif font-normal text-brand-charcoal block mt-1">18 Registered</span>
                          <span className="text-[10px] text-brand-charcoal-muted font-light block mt-0.5">Class 11 (8) • Class 12 (10)</span>
                        </div>
                        <div className="p-4 bg-brand-cream/40 border border-brand-stone-soft/60 rounded-xs">
                          <span className="text-[9px] font-mono text-brand-charcoal-muted uppercase tracking-wider block">Evaluation Rate</span>
                          <span className="text-2xl font-serif font-normal text-brand-charcoal block mt-1">92.4% Graded</span>
                          <span className="text-[10px] text-brand-charcoal-muted font-light block mt-0.5">2 submissions awaiting reviews</span>
                        </div>
                      </div>
                    </div>

                    {/* Submissions to Evaluate (No bordered card block - Req 2) */}
                    <div className="space-y-3 p-1">
                      <div className="flex items-center justify-between pb-1.5 border-b border-brand-stone-soft/30">
                        <h4 className="text-[10px] font-mono text-brand-charcoal-muted uppercase tracking-widest font-bold">EVALUATIONS QUEUE</h4>
                        <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200/50 px-2 py-0.5 rounded-xs font-semibold">2 pending</span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 border border-brand-stone-soft hover:border-brand-charcoal/30 bg-white rounded-xs transition-colors cursor-pointer" onClick={() => setActiveTab('grading')}>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-brand-charcoal font-semibold font-sans">Class 12</span>
                            <span className="text-[9px] font-mono text-brand-charcoal-muted">Today, 05:45 AM</span>
                          </div>
                          <p className="text-xs font-semibold text-brand-charcoal mt-1 truncate">Pranav Sharma</p>
                          <p className="text-[10px] text-brand-charcoal-muted font-light truncate">Unit 2: Self & Personality Essay</p>
                        </div>

                        <div className="p-3 border border-brand-stone-soft hover:border-brand-charcoal/30 bg-white rounded-xs transition-colors cursor-pointer" onClick={() => setActiveTab('grading')}>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-brand-charcoal font-semibold font-sans">Class 11</span>
                            <span className="text-[9px] font-mono text-brand-charcoal-muted">Yesterday</span>
                          </div>
                          <p className="text-xs font-semibold text-brand-charcoal mt-1 truncate">Kabir Mehta</p>
                          <p className="text-[10px] text-brand-charcoal-muted font-light truncate">Unit 2: Enquiry Methods Questions</p>
                        </div>
                      </div>
                    </div>

                    {/* Teaching Tools Toolbox (No bordered card block - Req 2) */}
                    <div className="space-y-3 p-1">
                      <h4 className="text-[10px] font-mono text-brand-charcoal-muted uppercase tracking-widest font-bold pb-1.5 border-b border-brand-stone-soft/30">QUICK DESK TOOLBOX</h4>
                      <div className="space-y-2 pt-1">
                        <Button variant="outline" size="sm" onClick={() => {
                          setFormName('Chapter 2 Notes: Concept Mapping');
                          setFormChapter('Ch 2');
                          setFormText('High-quality handwritten notes describing Freuds psychoanalytic structure of mind (Id, Ego, Superego).');
                          setIsDialogOpen(true);
                        }} className="w-full justify-start text-xs text-left gap-2 border-brand-stone-soft bg-white hover:bg-brand-cream py-2.5 h-10 shadow-2xs">
                          <Plus className="h-4 w-4 text-brand-charcoal" />
                          <span className="font-sans text-brand-charcoal font-medium">Upload Study Notes</span>
                        </Button>
                        
                        <Button variant="outline" size="sm" onClick={() => {
                          setFormName('Unit 3 Assignment: Coping with Stress');
                          setFormChapter('Ch 3');
                          setFormText('Write a brief case study evaluating primary and secondary cognitive appraisal styles.');
                          setIsDialogOpen(true);
                        }} className="w-full justify-start text-xs text-left gap-2 border-brand-stone-soft bg-white hover:bg-brand-cream py-2.5 h-10 shadow-2xs">
                          <Plus className="h-4 w-4 text-brand-charcoal" />
                          <span className="font-sans text-brand-charcoal font-medium">Issue New Assignment</span>
                        </Button>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ) : (
              /* ==================== STUDENT WORKSPACE (Req 9: Immersive Journal layout) ==================== */
              <div className="space-y-8 animate-slide-up">
                
                {/* Immersive Student Morning Insight Journal (Req 8 - Signature Moment) */}
                <div className="relative overflow-hidden bg-[#FCFBF7] border border-[#E7E0D8] rounded-xs p-6 shadow-sm font-serif">
                  <div className="absolute top-2.5 right-3.5 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-brand-charcoal-muted/70 uppercase">
                    <Sparkles className="h-3 w-3 text-brand-charcoal-muted animate-pulse" /> SIGNATURE STUDY JOURNAL
                  </div>
                  
                  <div className="space-y-4 max-w-2xl">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono tracking-widest text-brand-charcoal-muted uppercase font-semibold">Today&apos;s Mind Reflection</span>
                      <h3 className="text-xl text-brand-charcoal italic font-normal leading-relaxed">
                        &quot;An unexamined life is not worth living, but an unlived life is not worth examining.&quot;
                      </h3>
                      <p className="text-[10px] font-mono text-brand-charcoal-muted">— William James</p>
                    </div>
                    
                    <div className="pt-2">
                      {!isInsightRevealed ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsInsightRevealed(true)} 
                          className="text-xs bg-white hover:bg-[#F5F2EC] border-[#E7E0D8] py-1.5 h-8 font-sans gap-1.5"
                        >
                          Access Student Journal Prompts <ChevronRight className="h-3 w-3" />
                        </Button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 pt-3 border-t border-brand-stone-soft/50 font-sans"
                        >
                          <p className="text-xs text-brand-charcoal-muted font-light leading-relaxed">
                            Self-Reflection Prompt: Think of a personal cognitive attribute you excel at. How can you leverage it in your revision today?
                          </p>
                          
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Type a quick study log entry..."
                              value={journalReflection}
                              onChange={(e) => setJournalReflection(e.target.value)}
                              className="flex-1 text-xs px-3 py-1.5 bg-white border border-[#E7E0D8] rounded-xs focus:outline-none focus:border-brand-charcoal font-serif italic text-brand-charcoal"
                            />
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => {
                                if (journalReflection.trim()) {
                                  setIsSavedReflection(true);
                                  setTimeout(() => setIsSavedReflection(false), 2000);
                                }
                              }}
                              className="text-xs py-1.5 h-8 font-sans"
                            >
                              Log Reflection
                            </Button>
                          </div>
                          {isSavedReflection && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-[10px] font-mono text-emerald-800 font-semibold flex items-center gap-1"
                            >
                              ✓ Entry saved in your personal development journal portfolio.
                            </motion.p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main divergent grid for immersive learning path */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column (2/3): Student Active Study Path & Continue Studying */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Rotating Student Contextual Hero Card (Requirement 1) */}
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeHeroDay}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        whileHover={{ y: -1, transition: { duration: 0.15 } }}
                        className="relative overflow-hidden border border-[#E7E0D8] bg-white rounded-xs p-6 md:p-8 shadow-xs"
                      >
                        <div className="absolute top-0 right-0">
                          <div className="bg-brand-charcoal text-white text-[9px] uppercase tracking-widest font-semibold px-4 py-2 rounded-bl-xs">
                            {activeHeroDay.toUpperCase()}&apos;S STUDY PATH
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-800 font-bold">
                              {studentDayContexts[activeHeroDay].badge}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-serif text-2xl font-normal leading-snug text-brand-charcoal tracking-tight">
                              {studentDayContexts[activeHeroDay].title}
                            </h3>
                            <p className="text-xs text-brand-charcoal-muted font-light leading-relaxed max-w-xl">
                              {studentDayContexts[activeHeroDay].desc}
                            </p>
                          </div>

                          {/* Dynamic Active Checklist for Student Day */}
                          <div className="pt-4 pb-1 space-y-2 border-t border-brand-stone-soft/30">
                            <h4 className="text-[10px] uppercase font-mono text-brand-charcoal-muted tracking-widest font-bold">YOUR PREPARATION CHECKLIST</h4>
                            <div className="space-y-2 pt-1">
                              {dayChecklists.student[activeHeroDay].map((item: any) => (
                                <label key={item.id} className="flex items-start gap-2.5 text-xs text-brand-charcoal cursor-pointer group select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={item.checked} 
                                    onChange={() => toggleDayChecklist('student', activeHeroDay, item.id)}
                                    className="mt-0.5 rounded-sm border-brand-stone-soft accent-brand-charcoal text-brand-charcoal"
                                  />
                                  <span className={`font-light transition-colors ${item.checked ? 'line-through text-brand-charcoal-muted/65' : 'group-hover:text-brand-charcoal'}`}>
                                    {item.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 flex flex-wrap gap-3 items-center justify-between text-xs text-brand-charcoal-muted border-t border-brand-stone-soft/20">
                            <span className="font-mono text-[10px]">
                              Scope: <span className="font-semibold text-brand-charcoal">{studentDayContexts[activeHeroDay].sub}</span>
                            </span>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => setActiveTab(studentDayContexts[activeHeroDay].actionTab)} 
                              className="text-[11px] h-8 px-4"
                            >
                              {studentDayContexts[activeHeroDay].button} <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Subtle Progress Visualization (Req 5 - Encouragement, non-gamified!) */}
                    <div className="space-y-4 pt-2">
                      <div className="pb-1 border-b border-brand-stone-soft/40">
                        <h4 className="text-[10px] font-mono text-brand-charcoal-muted uppercase tracking-widest font-bold">
                          ACADEMIC DEVELOPMENT MATRIX
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        
                        <div className="p-4 bg-brand-cream/30 border border-brand-stone-soft/40 rounded-xs space-y-1.5">
                          <span className="text-[9px] font-mono text-brand-charcoal-muted uppercase block">Revision Milestone</span>
                          <span className="text-xl font-serif text-brand-charcoal font-normal block">92% Complete</span>
                          <div className="w-full bg-brand-stone-soft h-1 rounded-full overflow-hidden mt-2">
                            <div className="bg-brand-charcoal h-full rounded-full" style={{ width: '92%' }}></div>
                          </div>
                          <span className="text-[9px] text-brand-charcoal-muted/80 block pt-0.5">3/4 syllabus units mastered</span>
                        </div>

                        <div className="p-4 bg-brand-cream/30 border border-brand-stone-soft/40 rounded-xs space-y-1.5">
                          <span className="text-[9px] font-mono text-brand-charcoal-muted uppercase block">Attendance Rate</span>
                          <span className="text-xl font-serif text-brand-charcoal font-normal block">95.4% Rate</span>
                          <div className="w-full bg-brand-stone-soft h-1 rounded-full overflow-hidden mt-2">
                            <div className="bg-brand-charcoal h-full rounded-full" style={{ width: '95.4%' }}></div>
                          </div>
                          <span className="text-[9px] text-brand-charcoal-muted/80 block pt-0.5">Sustained active sync focus</span>
                        </div>

                        <div className="p-4 bg-brand-cream/30 border border-brand-stone-soft/40 rounded-xs space-y-1.5">
                          <span className="text-[9px] font-mono text-brand-charcoal-muted uppercase block">Reading Streak</span>
                          <span className="text-xl font-serif text-brand-charcoal font-normal block">★★★★★</span>
                          <div className="pt-2">
                            <span className="text-[10px] bg-brand-cream text-brand-charcoal px-2 py-0.5 rounded-sm font-semibold border border-brand-stone-soft">
                              8 Days Active
                            </span>
                          </div>
                          <span className="text-[9px] text-brand-charcoal-muted/80 block pt-0.5">Daily handbook readings logs</span>
                        </div>

                      </div>
                    </div>

                    {/* Recommended Study Topic (No borders - Req 2) */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-base font-serif font-normal text-brand-charcoal pb-2 border-b border-[#E7E0D8]">Active Learning Material Recommendation</h3>
                      
                      <div className="p-5 border border-[#E7E0D8] rounded-xs bg-[#FCFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="accent">Class 12</Badge>
                            <span className="text-[8px] font-mono text-brand-charcoal font-semibold uppercase tracking-wider">SELECTED BY DR. SEN</span>
                          </div>
                          <h4 className="text-sm font-semibold text-brand-charcoal mt-1">Chapter 1 Blueprint: Intelligence Attribute Variations</h4>
                          <p className="text-xs text-brand-charcoal-muted font-light leading-relaxed">Handwritten syllabus mappings, previous evaluation boards, and quick study guides.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('materials')} className="text-xs bg-white py-1.5 h-9 px-4 hover:bg-brand-cream border-[#E7E0D8]">
                          Open Guide PDF
                        </Button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column (1/3): Student Side Context (No borders!) */}
                  <div className="space-y-6">
                    
                    {/* Due Soon homework (No bordered card box - Req 2) */}
                    <div className="space-y-3 p-1">
                      <div className="flex items-center justify-between pb-1.5 border-b border-brand-stone-soft/30">
                        <h4 className="text-[10px] font-mono text-brand-charcoal-muted uppercase tracking-widest font-bold">DUE SOON</h4>
                        <span className="text-[9px] bg-brand-stone-soft text-brand-charcoal px-2 py-0.5 rounded-xs font-semibold">1 due soon</span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-4 border border-brand-stone-soft bg-[#FAF8F5]/80 cursor-pointer hover:bg-brand-cream transition-colors rounded-xs" onClick={() => setActiveTab('assignments')}>
                          <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-brand-accent">Due July 15</span>
                          <p className="text-xs font-semibold text-brand-charcoal mt-1">Personality Assessment Writeup</p>
                          <p className="text-[10px] text-brand-charcoal-muted mt-0.5 font-light">Class 12 • 50 Marks Weight</p>
                        </div>

                        <div className="p-4 border border-brand-stone-soft/50 bg-white rounded-xs opacity-70">
                          <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-green-700">Graded</span>
                          <p className="text-xs font-semibold text-brand-charcoal mt-1">Stress Coping Case Study</p>
                          <p className="text-[10px] text-brand-charcoal-muted mt-0.5 font-light">Score: 45 / 50 • Feedback Ready</p>
                        </div>
                      </div>
                    </div>

                    {/* Teacher Bulletins (No bordered card box - Req 2) */}
                    <div className="space-y-3 p-1">
                      <h4 className="text-[10px] font-mono text-brand-charcoal-muted uppercase tracking-widest font-bold pb-1.5 border-b border-brand-stone-soft/30">
                        TEACHER BULLETIN UPDATES
                      </h4>
                      <div className="p-4 bg-[#F5F2EC] border border-brand-stone-soft/55 rounded-xs relative">
                        <p className="text-xs font-semibold text-brand-charcoal">Dr. Aristha Sen</p>
                        <p className="text-[11px] text-brand-charcoal-muted mt-1.5 leading-relaxed font-light italic font-serif">
                          &quot;I have compiled and uploaded the complete revision guide for variations and attributes. Please go over Chapter 1 before this afternoon&apos;s sync session.&quot;
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )
          )}
        </div>
      )}

      {/* Today's Classes Tab (Redesigned as Vertical Timeline) */}
      {activeTab === 'classes' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-brand-stone-soft/50">
            <div>
              <H2 className="text-xl font-medium">Today&apos;s Active Schedule</H2>
              <Subtitle className="text-xs font-light mt-0.5">
                Navigate your daily timeline of interactive discussions, sync slots, and lecture records with the live dynamic time axis.
              </Subtitle>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScheduleEmpty(prev => !prev)}
                className={`text-[10px] px-3 py-1 border rounded-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${isScheduleEmpty ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-transparent border-brand-stone-soft text-brand-charcoal-muted hover:text-brand-charcoal'}`}
              >
                {isScheduleEmpty ? 'Show Populated' : 'Simulate Empty State'}
              </button>
              {role === 'teacher' && (
                <Button variant="primary" size="sm" onClick={() => {
                  setFormName('New Scheduled Discussion');
                  setFormChapter('Ch 1');
                  setFormText('Schedule a live classroom call to review psychological models.');
                  setIsDialogOpen(true);
                }} className="gap-1.5 text-xs">
                  <Plus className="h-4 w-4" /> Schedule New Class
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Time Axis Controller (Requirement 4) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-brand-cream/50 border border-brand-stone-soft/50 rounded-xs text-xs font-sans">
            <span className="font-semibold text-brand-charcoal flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Simulate Time Axis:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-brand-charcoal-muted font-light">Set simulated workspace clock hour:</span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-sm border border-brand-stone-soft/75">
                {([9, 12, 16.5, 19] as const).map((hour) => {
                  const label = hour === 9 ? '09:30 AM' : hour === 12 ? '12:00 PM' : hour === 16.5 ? '04:30 PM' : '07:00 PM';
                  return (
                    <button
                      key={hour}
                      onClick={() => setSimulatedHour(hour)}
                      className={`text-[10px] px-2.5 py-1 rounded-xs font-mono font-bold transition-all cursor-pointer ${simulatedHour === hour ? 'bg-brand-charcoal text-white shadow-2xs' : 'text-brand-charcoal-muted hover:text-brand-charcoal'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isScheduleEmpty ? (
            <div className="py-16 border border-dashed border-[#E7E0D8] rounded-xs bg-[#FCFBF9] text-center max-w-2xl mx-auto p-8 space-y-5 animate-slide-up">
              <div className="w-12 h-12 rounded-full bg-brand-cream border border-brand-stone-soft/70 flex items-center justify-center mx-auto text-brand-charcoal">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-xl font-normal text-brand-charcoal">All Cleared on your Timeline</h3>
                <p className="text-xs text-brand-charcoal-muted font-light leading-relaxed max-w-md mx-auto">
                  No active classroom discussions or live evaluations scheduled for today. Refresh this timeline or enjoy your study recess!
                </p>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={() => setIsScheduleEmpty(false)} className="text-xs">
                  Refill Timeline Grid
                </Button>
              </div>
            </div>
          ) : (
            /* Graphical Vertical Timeline with real-time NOW Indicator */
            <div className="bg-white border border-brand-stone-soft rounded-xs p-6 md:p-8 space-y-8 relative overflow-hidden">
              
              {/* Timeline Continuous Path */}
              <div className="absolute left-6 md:left-32 top-8 bottom-8 w-[1px] bg-brand-stone-soft" />

              {/* Dynamic NOW line moving across the layout according to simulated hour (Requirement 4) */}
              <div 
                className="absolute left-6 md:left-0 right-0 z-10 flex items-center pointer-events-none transition-all duration-500"
                style={{ 
                  top: simulatedHour === 9 
                    ? '14%' 
                    : simulatedHour === 12 
                    ? '38%' 
                    : simulatedHour === 16.5 
                    ? '65%' 
                    : '88%' 
                }}
              >
                <div className="hidden md:block w-32 pr-4 text-right text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest bg-white/95 py-0.5 z-10">
                  Now • {simulatedHour === 9 ? '09:30 AM' : simulatedHour === 12 ? '12:00 PM' : simulatedHour === 16.5 ? '04:30 PM' : '07:00 PM'}
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 absolute left-4.5 md:left-31 border-2 border-white shadow-xs z-10" />
                <div className="flex-1 h-[1.5px] bg-red-600/50 border-t border-dashed border-red-400" />
              </div>

              {/* Timeline Elements */}
              <div className="space-y-12 relative">

                {/* Event 1 (09:30 AM): Completed or Live depending on Simulated Hour */}
                {(() => {
                  const isCompleted = simulatedHour > 9.5;
                  const isLive = simulatedHour === 9;
                  return (
                    <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 pl-10 md:pl-0 transition-opacity ${isCompleted ? 'opacity-55' : 'opacity-100'}`}>
                      <div className={`hidden md:block text-right w-24 shrink-0 font-mono text-xs ${isLive ? 'font-bold text-brand-charcoal' : 'text-brand-charcoal-muted'}`}>
                        09:30 — 10:15
                      </div>
                      
                      <div className={`absolute left-0 md:left-28 w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center ${isLive ? 'bg-green-500 ring-2 ring-green-200' : 'bg-brand-stone-soft'}`} />
                      
                      <div className={`flex-1 bg-[#FAF8F5]/60 border border-brand-stone-soft/40 rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCompleted ? 'grayscale-[35%] line-through' : ''}`}>
                        <div className="space-y-1">
                          <span className="md:hidden font-mono text-[10px] text-brand-charcoal-muted mr-2">09:30 AM</span>
                          <Badge variant="neutral">Class 11</Badge>
                          <h3 className="font-sans font-semibold text-sm text-brand-charcoal mt-1">Syllabus Review & Lesson Mapping</h3>
                          <p className="text-xs text-brand-charcoal-muted font-light">
                            {isCompleted ? 'Completed introductory curriculum structures' : 'Introductory layout review - join class discussion'}
                          </p>
                        </div>
                        {isCompleted ? (
                          <Badge variant="neutral">Completed</Badge>
                        ) : (
                          <Button variant="primary" size="sm" className="text-xs h-8">Join Sync</Button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Event 2 (11:00 AM): Completed or Live */}
                {(() => {
                  const isCompleted = simulatedHour > 12.5;
                  const isLive = simulatedHour === 12;
                  const isUpcoming = simulatedHour < 11;
                  return (
                    <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 pl-10 md:pl-0 transition-opacity ${isCompleted ? 'opacity-55' : 'opacity-100'}`}>
                      <div className={`hidden md:block text-right w-24 shrink-0 font-mono text-xs ${isLive ? 'font-bold text-brand-charcoal' : 'text-brand-charcoal-muted'}`}>
                        11:00 — 12:30
                      </div>
                      
                      <div className={`absolute left-0 md:left-28 w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center ${isLive ? 'bg-green-500 ring-2 ring-green-200 animate-pulse' : 'bg-brand-stone-soft'}`} />
                      
                      <div className={`flex-1 bg-[#FAF8F5]/60 border border-brand-stone-soft/40 rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCompleted ? 'grayscale-[35%] line-through' : ''}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="md:hidden font-mono text-[10px] text-brand-charcoal-muted mr-2">11:00 AM</span>
                            <Badge variant="accent">Class 12</Badge>
                            {isUpcoming && <span className="text-[9px] font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 rounded-sm">In 2 hours</span>}
                          </div>
                          <h3 className="font-sans font-semibold text-sm text-brand-charcoal mt-1">Cognitive Appraisal Styles Discussion</h3>
                          <p className="text-xs text-brand-charcoal-muted font-light">
                            {isCompleted ? 'Completed Unit 3 coping parameters evaluation' : 'Focus: Primary and secondary appraisal models'}
                          </p>
                        </div>
                        {isCompleted ? (
                          <Badge variant="neutral">Completed</Badge>
                        ) : isLive ? (
                          <Button variant="primary" size="sm" className="text-xs h-8">Join Sync</Button>
                        ) : (
                          <span className="text-xs font-mono text-brand-charcoal-muted">Upcoming</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Event 3 (16:30 / 04:30 PM): Live or Upcoming */}
                {(() => {
                  const isLive = simulatedHour === 16.5;
                  const isCompleted = simulatedHour > 17.5;
                  const isUpcoming = simulatedHour < 16.5;
                  return (
                    <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 pl-10 md:pl-0 transition-opacity ${isCompleted ? 'opacity-55' : 'opacity-100'}`}>
                      <div className={`hidden md:block text-right w-24 shrink-0 font-mono text-xs ${isLive ? 'font-bold text-brand-charcoal' : 'text-brand-charcoal-muted'}`}>
                        16:30 — 17:30
                      </div>
                      
                      <div className={`absolute left-0 md:left-28 w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center ${isLive ? 'bg-green-500 ring-4 ring-green-100' : 'bg-brand-stone-soft'}`}>
                        {isLive && <span className="absolute -inset-1 rounded-full bg-green-400 opacity-40 animate-ping" />}
                      </div>
                      
                      <div className={`flex-1 bg-white border border-brand-charcoal/20 shadow-xs rounded-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCompleted ? 'grayscale-[35%] line-through' : ''}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="md:hidden font-mono text-[10px] text-brand-charcoal-muted mr-2">16:30 PM</span>
                            <Badge variant="accent">Class 12</Badge>
                            {isLive && (
                              <span className="text-[8px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.2 rounded-xs font-semibold uppercase font-mono flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> Live Now
                              </span>
                            )}
                            {isUpcoming && <span className="text-[9px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 rounded-sm">Starts in 51 mins</span>}
                          </div>
                          <h3 className="font-sans font-semibold text-base text-brand-charcoal mt-1">Intelligence Theories & Attributes</h3>
                          <p className="text-xs text-brand-charcoal-muted font-light">Spearman Two-factor theory and Thurstone multidimensional models</p>
                        </div>
                        {isCompleted ? (
                          <Badge variant="neutral">Completed</Badge>
                        ) : (
                          <Button variant="primary" size="sm" className="text-xs shrink-0 gap-1.5 shadow-xs h-8">
                            Join Call <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Event 4 (18:00 / 06:00 PM): Upcoming */}
                {(() => {
                  const isCompleted = simulatedHour > 18.75;
                  const isLive = simulatedHour === 19; // Simulating at 19:00 PM
                  return (
                    <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 pl-10 md:pl-0 transition-opacity ${isCompleted ? 'opacity-55' : 'opacity-100'}`}>
                      <div className={`hidden md:block text-right w-24 shrink-0 font-mono text-xs ${isLive ? 'font-bold text-brand-charcoal' : 'text-brand-charcoal-muted'}`}>
                        18:00 — 18:45
                      </div>
                      
                      <div className="absolute left-0 md:left-28 w-4.5 h-4.5 rounded-full bg-[#E7E0D8] border-4 border-white" />
                      
                      <div className={`flex-1 bg-white border border-brand-stone-soft rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCompleted ? 'grayscale-[35%] line-through' : ''}`}>
                        <div className="space-y-1">
                          <span className="md:hidden font-mono text-[10px] text-brand-charcoal-muted mr-2">18:00 PM</span>
                          <Badge variant="neutral">Class 11</Badge>
                          <h3 className="font-sans font-semibold text-sm text-brand-charcoal mt-1">Methods of Enquiry in Psychology</h3>
                          <p className="text-xs text-brand-charcoal-muted font-light">Focus: Systematic case-study observation worksheets</p>
                        </div>
                        {isCompleted ? (
                          <Badge variant="neutral">Completed</Badge>
                        ) : isLive ? (
                          <Button variant="primary" size="sm" className="text-xs h-8">Join Sync</Button>
                        ) : (
                          <span className="text-xs font-light text-brand-charcoal-muted">Upcoming</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          )}

          <EmptyState
            title="Looking for past classes?"
            description="Recorded lessons, handouts, and chapter guides are filed within the Study Material tab."
            actionText="Browse Resources"
            onAction={() => setActiveTab('materials')}
          />
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-brand-stone-soft/50">
            <div>
              <H2 className="text-xl font-medium">Assignments</H2>
              <Subtitle className="text-xs font-light mt-0.5">
                Track assigned homework briefs, monitor class deadlines, and view graded evaluations.
              </Subtitle>
            </div>
            {role === 'teacher' && (
              <Button variant="primary" size="sm" onClick={() => {
                setFormName('Unit 2 Essay: Theories of Self');
                setFormChapter('Ch 2');
                setFormText('Write a brief evaluation comparing Freudian psychoanalytic structures with post-Freudian theories.');
                setIsDialogOpen(true);
              }} className="gap-1.5 text-xs">
                <Plus className="h-4 w-4" /> Issue New Assignment
              </Button>
            )}
          </div>

          <div className="bg-white border border-brand-stone-soft rounded-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment Brief</TableHead>
                  <TableHead>Deadline / Date</TableHead>
                  <TableHead>Standard</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentsList.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-semibold text-brand-charcoal">{assignment.title}</TableCell>
                    <TableCell className="text-brand-charcoal-muted">{assignment.deadline}</TableCell>
                    <TableCell>
                      <Badge variant={assignment.grade === 'Class 12' ? 'accent' : 'neutral'}>
                        {assignment.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{assignment.points} Marks</TableCell>
                    <TableCell>
                      <Badge variant={assignment.status === 'Graded' ? 'success' : 'warning'}>
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {role === 'teacher' ? (
                        <Button variant="outline" size="sm" className="text-xs py-1" onClick={() => {
                          setFormName(assignment.title);
                          setFormChapter(assignment.grade === 'Class 12' ? 'Ch 1' : 'Ch 2');
                          setFormText(`Evaluation feedback and grading marks for ${assignment.title}.`);
                          setIsDialogOpen(true);
                        }}>
                          Evaluate Submissions
                        </Button>
                      ) : (
                        <Button variant={assignment.status === 'Graded' ? 'outline' : 'primary'} size="sm" className="text-xs py-1">
                          {assignment.status === 'Graded' ? 'View Feedback' : 'Submit Homework'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Study Material Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-slide-up">
          <div className="pb-4 border-b border-brand-stone-soft/50">
            <H2 className="text-xl font-medium">Resources</H2>
            <Subtitle className="text-xs font-light mt-0.5">
              Access revision blueprints, worksheets, and handwritten notes compiled by Dr. Aristha Sen.
            </Subtitle>
          </div>

          {/* Search and Filters layout */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96">
              <SearchBar 
                placeholder="Search notes, chapters, topics..." 
                value={searchVal}
                onSearchChange={setSearchVal}
                shortcut="⌘K"
              />
            </div>
            
            <div className="w-full md:w-auto overflow-x-auto">
              <Filters
                options={[
                  { value: 'all', label: 'All Chapters' },
                  { value: 'class11', label: 'Class 11 Syllabus' },
                  { value: 'class12', label: 'Class 12 Syllabus' },
                ]}
                selectedValue={filterVal}
                onChange={setFilterVal}
              />
            </div>
          </div>

          {/* Grid Layout of resources */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="flex flex-col justify-between">
                  <CardHeader className="p-5">
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant={resource.grade === 'Class 12' ? 'accent' : 'neutral'}>
                        {resource.grade} • {resource.chapter}
                      </Badge>
                      <span className="text-[10px] font-mono text-brand-charcoal-muted/70">{resource.size}</span>
                    </div>
                    <CardTitle className="mt-3 text-base leading-snug">{resource.title}</CardTitle>
                    <CardDescription className="mt-1">{resource.type}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-5 pt-0 border-t-0 flex items-center justify-between">
                    <span className="text-[11px] text-brand-charcoal-muted font-sans font-light">Compiled by Dr. Sen</span>
                    <Button variant="outline" size="sm" className="h-8 text-xs py-1 px-2.5 gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No resources found"
              description="No PDF files or chapter blueprints matched your query. Try resetting filters."
              actionText="Reset All Filters"
              onAction={() => {
                setSearchVal('');
                setFilterVal('all');
              }}
            />
          )}
        </div>
      )}

      {/* Grades Ledger & Feedback Tab (Redesigned as Review Cards) */}
      {activeTab === 'grading' && role === 'teacher' && (
        <div className="space-y-6 animate-slide-up">
          <div className="pb-4 border-b border-brand-stone-soft/50">
            <H2 className="text-xl font-medium">Grading & Feedback</H2>
            <Subtitle className="text-xs font-light mt-0.5">
              Review and grade individual student essay submissions with personalized qualitative guidance.
            </Subtitle>
          </div>

          {/* Elegant Card Grid (spreadsheet-free grading workflow) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gradingList.map((grade, idx) => {
              const initials = grade.student.split(' ').map(n => n[0]).join('');
              const colors = [
                'bg-[#F5F2EC] text-brand-charcoal border-[#E7E0D8]', 
                'bg-slate-100 text-slate-800 border-slate-200', 
                'bg-emerald-50 text-emerald-800 border-emerald-200', 
                'bg-amber-50 text-amber-800 border-amber-200'
              ];
              const visualColor = colors[idx % colors.length];
              
              return (
                <motion.div 
                  key={grade.id}
                  whileHover={{ y: -3, transition: { duration: 0.15 } }}
                  className="bg-white border border-[#E7E0D8] rounded-xs p-6 shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-serif text-sm font-semibold shrink-0 ${visualColor}`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-sans font-semibold text-sm text-brand-charcoal truncate">{grade.student}</h4>
                          <p className="text-[10px] font-mono text-brand-charcoal-muted">{grade.grade} Syllabus</p>
                        </div>
                      </div>
                      <Badge variant={grade.status === 'Graded' ? 'success' : 'info'}>
                        {grade.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono text-brand-charcoal-muted tracking-wider font-semibold">Active Submission</span>
                      <h5 className="text-xs font-semibold text-brand-charcoal line-clamp-1">{grade.assignment}</h5>
                    </div>

                    {/* Feedback preview bubble */}
                    <div className="p-3 bg-[#FAF8F5] border border-brand-stone-soft/50 rounded-xs">
                      <p className="text-[9px] uppercase font-mono text-brand-charcoal-muted tracking-wider font-semibold">Draft Feedback Preview</p>
                      <p className="text-[11px] text-brand-charcoal-muted font-serif italic mt-1 leading-relaxed line-clamp-2">
                        {grade.status === 'Graded' 
                          ? `Excellent depth of detail shown in discussing personality models. Minor improvements needed in structural coherence.`
                          : `Evaluating raw case study notes. Assessment grading under active preparation.`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-brand-stone-soft/50 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-mono text-brand-charcoal-muted tracking-wider">Evaluation Score</p>
                      <p className="font-serif text-lg font-bold text-brand-charcoal">{grade.score}</p>
                    </div>
                    
                    <Button variant="outline" size="sm" className="text-xs py-1 h-8" onClick={() => {
                      setFormName(`${grade.student} - ${grade.assignment}`);
                      setFormChapter(grade.grade === 'Class 12' ? 'Ch 1' : 'Ch 2');
                      setFormText(grade.status === 'Graded' ? `Excellent depth of detail shown in discussing personality models. Minor improvements needed in structural coherence.` : `Evaluate raw case study notes.`);
                      setIsDialogOpen(true);
                    }}>
                      Open Review Desk
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Card className="bg-brand-cream border border-brand-stone-soft p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-charcoal/5 text-brand-charcoal flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-charcoal font-sans">Grades automatically synchronized</p>
              <p className="text-xs text-brand-charcoal-muted mt-1 leading-relaxed max-w-2xl font-light">
                Marking updates instantly reflect on student study planners. No need to export CSV spreadsheets or send separate WhatsApp reports.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Interactive Modal Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Coaching Workspace Action Form"
        description="Fill out the form fields below. Demonstrates input layout inside our custom dialogues."
      >
        <div className="space-y-4">
          <Input 
            label="Workspace Element Title" 
            placeholder="e.g. Chapter 6: Attitude and Social Cognition"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          
          <Select 
            label="Syllabus Unit" 
            options={[
              { value: 'Ch 1', label: 'Unit 1: Variations in Psychological Attributes' },
              { value: 'Ch 2', label: 'Unit 2: Self and Personality' },
              { value: 'Ch 3', label: 'Unit 3: Meeting Life Challenges' },
              { value: 'Ch 4', label: 'Unit 4: Psychological Disorders' },
              { value: 'Ch 5', label: 'Unit 5: Therapeutic Approaches' },
            ]}
            value={formChapter}
            onChange={(e) => setFormChapter(e.target.value)}
          />

          <Textarea 
            label="Guidance brief / Description" 
            placeholder="Write brief notes or submission instructions..."
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
          />

          <div className="pt-4 border-t border-brand-stone-soft/40 flex items-center justify-end gap-3.5">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Discard
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(false)}>
              Confirm Entry
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
};
