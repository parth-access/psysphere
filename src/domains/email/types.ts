export interface SendEmailResponse {
  success: boolean;
  data?: { id: string };
  error?: string;
}

export interface WorkshopEmailDetails {
  workshopTitle: string;
  /** Human-readable date and time in IST, e.g. "Sat, 24 Oct · 5:00 – 6:00 PM IST" */
  whenText: string;
  meetingUrl: string | null;
}

export interface WorkshopRegisteredPayload extends WorkshopEmailDetails {
  studentName: string;
}

export interface WorkshopReminderPayload extends WorkshopEmailDetails {
  studentName: string;
}

export interface WorkshopJoinInvitePayload {
  studentName: string;
  workshopTitle: string;
  joinUrl: string;
}

export interface JoinRequestReceivedPayload {
  studentName: string;
  batchName: string;
  planName: string;
  amountInr: number;
}

export interface NewJoinRequestInternalPayload {
  studentName: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  batchName: string;
  planName: string;
  amountInr: number;
  reviewUrl: string;
}

export interface JoinRequestApprovedPayload {
  studentName: string;
  batchName: string;
  planName: string;
  amountInr: number;
  payUrl: string;
}

export interface JoinRequestDeclinedPayload {
  studentName: string;
  batchName: string;
  reason?: string | null;
}

export interface EnrollmentConfirmedPayload {
  studentName: string;
  studentId: string;
  email: string;
  batchName: string;
  planName: string;
  amountInr: number;
  paymentId: string;
  passwordSetupUrl: string;
}

export interface PasswordSetupPayload {
  studentName: string;
  email: string;
  passwordSetupUrl: string;
}

export interface PasswordResetPayload {
  name: string | null;
  resetUrl: string;
}

export interface TeacherActivationPayload {
  teacherName: string;
  email: string;
  passwordSetupUrl: string;
}

export interface WeeklyReportPayload {
  studentName: string;
  batchName: string;
  weekLabel: string;
  attended: number;
  totalClasses: number;
  results: { title: string; marks: number; max: number; feedback?: string | null }[];
  pendingWork: { title: string; dueText: string }[];
  upcoming: { title: string; whenText: string }[];
  dashboardUrl: string;
}
