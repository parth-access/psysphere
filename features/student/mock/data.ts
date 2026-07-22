export const MOCK_STUDENT_USER = {
  name: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  phone: "+91 9876543210",
  demoId: "DEM-2026-0048",
  studentId: null,
  status: "demo",
  assignedTeacher: "Dravina Gupta",
  preferredBatch: "Class 11 - Evening",
  admissionStatus: "Pending Demo",
  institute: "PsySphere Institute of Psychology",
};

export const MOCK_DEMO_CLASS = {
  subject: "Introduction to Psychology",
  teacher: "Dravina Gupta",
  date: "15 July 2026",
  time: "6:00 PM",
  duration: "60 mins",
  platform: "Google Meet",
  link: "https://meet.google.com/abc-defg-hij",
  status: "scheduled", // scheduled, completed
};

export const MOCK_AGENDA = [
  { id: 1, text: "Meet Your Mentor" },
  { id: 2, text: "Course Introduction" },
  { id: 3, text: "Understanding the Learning Platform" },
  { id: 4, text: "Career Roadmap Discussion" },
];

export const MOCK_RESOURCES = [
  { id: "res-1", title: "Course Brochure", type: "PDF", size: "2.4 MB" },
  { id: "res-2", title: "Psychology Syllabus", type: "PDF", size: "1.1 MB" },
  { id: "res-3", title: "Sample Notes", type: "PDF", size: "3.5 MB" },
  { id: "res-4", title: "Institute Handbook", type: "PDF", size: "4.2 MB" },
  { id: "res-5", title: "Mind Maps", type: "Image", size: "1.8 MB" },
  { id: "res-6", title: "Previous Results", type: "Link", size: "-" },
  { id: "res-7", title: "Study Plan", type: "PDF", size: "800 KB" },
];

export const MOCK_SUPPORT_CONTACTS = [
  { id: "sup-1", type: "Email", value: "support@psysphere.com", description: "Typically replies within 2 hours" },
  { id: "sup-2", type: "Phone", value: "+91 9876543210", description: "Mon-Sat, 9am to 6pm" },
  { id: "sup-3", type: "WhatsApp", value: "+91 9876543211", description: "Instant support for quick queries" },
];

export const MOCK_JOURNEY_STAGES = [
  { id: "stg-1", title: "Booking Confirmed", status: "completed", date: "10 July 2026" },
  { id: "stg-2", title: "Demo Approved", status: "completed", date: "11 July 2026" },
  { id: "stg-3", title: "Demo Scheduled", status: "completed", date: "12 July 2026" },
  { id: "stg-4", title: "Attend Demo", status: "current", date: "15 July 2026" },
  { id: "stg-5", title: "Admission Discussion", status: "upcoming", date: "TBD" },
  { id: "stg-6", title: "Enrollment", status: "upcoming", date: "TBD" },
  { id: "stg-7", title: "Batch Assignment", status: "upcoming", date: "TBD" },
  { id: "stg-8", title: "Regular Classes", status: "upcoming", date: "TBD" },
];
