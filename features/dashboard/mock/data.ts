export const MOCK_STATS = {
  todayClasses: 4,
  upcomingTests: 2,
  pendingDemos: 5,
  activeStudents: 142,
  feeCollection: "₹1,24,000",
};

export const MOCK_RECENT_ACTIVITY = [
  { id: 1, text: "Student Rahul joined Batch A", time: "2 hours ago", type: "student" },
  { id: 2, text: "Assignment Chapter 3 created", time: "4 hours ago", type: "academic" },
  { id: 3, text: "Demo booked by Priya", time: "5 hours ago", type: "booking" },
  { id: 4, text: "Attendance submitted for Batch B", time: "1 day ago", type: "academic" },
  { id: 5, text: "Weekly Test scheduled", time: "1 day ago", type: "academic" },
];

export const MOCK_ADMISSIONS = [
  { id: "ADM-2026-001", studentName: "Rohan Sharma", parentName: "Rajeev Sharma", email: "rohan@example.com", phone: "+91 9876543210", class: "Class 12", program: "Standard", status: "LEAD", assignedTeacher: "Unassigned", demoDate: "TBD" },
  { id: "ADM-2026-002", studentName: "Ananya Gupta", parentName: "Meera Gupta", email: "ananya@example.com", phone: "+91 9876543211", class: "Class 11", program: "CUET Prep", status: "DEMO_APPROVED", assignedTeacher: "Dravina Gupta", demoDate: "15 July 2026" },
  { id: "ADM-2026-003", studentName: "Vikram Singh", parentName: "Anita Singh", email: "vikram@example.com", phone: "+91 9876543212", class: "Class 12", program: "Standard", status: "DEMO_COMPLETED", assignedTeacher: "Dr. Sharma", demoDate: "10 July 2026" },
  { id: "ADM-2026-004", studentName: "Sneha Patel", parentName: "Ramesh Patel", email: "sneha@example.com", phone: "+91 9876543213", class: "Class 11", program: "Standard", status: "REJECTED", assignedTeacher: "Unassigned", demoDate: "TBD" },
];

export const MOCK_STUDENTS = [
  { id: "STU-001", name: "Rahul Verma", admissionNo: "2024-001", batch: "Batch A (Class 12)", attendance: "92%", status: "active" },
  { id: "STU-002", name: "Priya Desai", admissionNo: "2024-002", batch: "Batch B (Class 11)", attendance: "88%", status: "active" },
  { id: "STU-003", name: "Amit Kumar", admissionNo: "2024-003", batch: "Batch A (Class 12)", attendance: "75%", status: "warning" },
  { id: "STU-004", name: "Neha Sharma", admissionNo: "2024-004", batch: "Batch C (Class 11)", attendance: "95%", status: "active" },
];

export const MOCK_BATCHES = [
  { id: "BAT-001", name: "Batch A - Physics", class: "Class 12", studentsCount: 45, nextClass: "Today, 4:00 PM", teacher: "Dr. Sharma" },
  { id: "BAT-002", name: "Batch B - Chemistry", class: "Class 11", studentsCount: 38, nextClass: "Tomorrow, 5:00 PM", teacher: "Prof. Verma" },
  { id: "BAT-003", name: "Batch C - Maths", class: "Class 12", studentsCount: 50, nextClass: "Wed, 4:00 PM", teacher: "Mr. Gupta" },
];

export const MOCK_CLASSES = [
  { id: "CLS-001", topic: "Thermodynamics - Part 2", batch: "Batch A - Physics", time: "Today, 4:00 PM - 5:30 PM", link: "https://zoom.us/j/123", status: "upcoming" },
  { id: "CLS-002", topic: "Organic Chemistry Basics", batch: "Batch B - Chemistry", time: "Tomorrow, 5:00 PM - 6:30 PM", link: "https://zoom.us/j/124", status: "scheduled" },
  { id: "CLS-003", topic: "Calculus Revision", batch: "Batch C - Maths", time: "Wed, 4:00 PM - 5:30 PM", link: "https://zoom.us/j/125", status: "scheduled" },
  { id: "CLS-004", topic: "Kinematics", batch: "Batch A - Physics", time: "Yesterday, 4:00 PM - 5:30 PM", link: "https://zoom.us/j/126", status: "completed" },
];
