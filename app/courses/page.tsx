import { Navbar } from '@/features/marketing/ui/Navbar';
import { Courses } from '@/features/marketing/ui/Courses';
import { Footer } from '@/features/marketing/ui/Footer';

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-paper flex flex-col pt-24">
      <Navbar />
      <Courses />
      <div className="flex-1"></div>
      <Footer />
    </main>
  );
}
