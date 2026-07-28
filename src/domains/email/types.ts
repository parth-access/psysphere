export interface SendEmailResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface DemoRequestReceivedPayload {
  studentName: string;
  classLevel: string;
  programType: string;
  preferredDate?: string;
  preferredTime?: string;
}

export interface NewLeadInternalPayload {
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  classLevel: string;
  programType: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}

export interface DemoApprovedPayload {
  studentName: string;
  email: string;
  demoDate: string;
  teacherName?: string;
  googleMeetUrl?: string;
}

export interface DemoScheduledPayload {
  studentName: string;
  demoDate: string;
  demoTime: string;
  teacherName: string;
  googleMeetUrl: string;
}

export interface DemoRejectedPayload {
  studentName: string;
}

export interface StudentInvitationPayload {
  studentName: string;
  studentId: string;
  email: string;
  passwordSetupUrl: string;
  teacherName?: string;
  demoDate?: string;
}

export interface TeacherActivationPayload {
  teacherName: string;
  email: string;
  passwordSetupUrl: string;
}

export interface PasswordSetupPayload {
  studentName: string;
  email: string;
  passwordSetupUrl: string;
}

export interface WelcomeStudentPayload {
  studentName: string;
  studentId: string;
  email: string;
}

