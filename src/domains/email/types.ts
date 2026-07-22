export interface SendEmailResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface DemoApprovedPayload {
  studentName: string;
  email: string;
  demoDate: string;
  teacherName?: string;
  googleMeetUrl?: string;
}

export interface StudentInvitationPayload {
  studentName: string;
  studentId: string;
  email: string;
  passwordSetupUrl: string;
  teacherName?: string;
  demoDate?: string;
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
