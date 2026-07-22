import { renderBaseEmailLayout } from "./layout";
import { 
  DemoApprovedPayload, 
  StudentInvitationPayload, 
  PasswordSetupPayload, 
  WelcomeStudentPayload 
} from "../types";

export function getDemoApprovedTemplate(payload: DemoApprovedPayload): string {
  const content = `
    <h1>Your Demo Class is Confirmed</h1>
    <p>Dear ${payload.studentName},</p>
    <p>We are pleased to inform you that your request for a demo session at <strong>PsySphere</strong> has been approved. Your slot is now locked in.</p>
    
    <div class="highlight-box">
      <div class="highlight-item">
        <div class="highlight-label">Scheduled Time</div>
        <div class="highlight-value">${payload.demoDate}</div>
      </div>
      ${payload.teacherName ? `
        <div class="highlight-item" style="margin-top: 12px;">
          <div class="highlight-label">Assigned Instructor</div>
          <div class="highlight-value">${payload.teacherName}</div>
        </div>
      ` : ""}
    </div>

    ${payload.googleMeetUrl ? `
      <p>The classroom will be hosted on Google Meet. Please join promptly using the link below:</p>
      <div class="btn-container">
        <a href="${payload.googleMeetUrl}" class="btn" target="_blank">Join Google Meet</a>
      </div>
    ` : `
      <p>Your classroom link will be available on your student dashboard shortly before the session begins.</p>
    `}

    <p>If you have any questions or need to reschedule, please get in touch with our admissions office.</p>
    <p>Best regards,<br>The PsySphere Admissions Team</p>
  `;
  return renderBaseEmailLayout("Demo Class Confirmed | PsySphere", content);
}

export function getStudentInvitationTemplate(payload: StudentInvitationPayload): string {
  const content = `
    <h1>Welcome to PsySphere</h1>
    <p>Hi ${payload.studentName},</p>
    <p>Your demo class has been approved, and your official PsySphere student account is now ready.</p>
    
    <div class="highlight-box">
      <div class="highlight-item">
        <div class="highlight-label">Student ID</div>
        <div class="highlight-value">${payload.studentId}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Registered Email</div>
        <div class="highlight-value">${payload.email}</div>
      </div>
      ${payload.demoDate ? `
        <div class="highlight-item" style="margin-top: 12px;">
          <div class="highlight-label">Demo Class Schedule</div>
          <div class="highlight-value">${payload.demoDate}</div>
        </div>
      ` : ""}
    </div>

    <p>Please click the button below to secure your account and set up your personal access password. This setup link will remain active for 24 hours.</p>

    <div class="btn-container">
      <a href="${payload.passwordSetupUrl}" class="btn" target="_blank">Set Your Password</a>
    </div>

    <p>Once your password is set, your student portal will unlock access to:</p>
    <ul class="bullet-list">
      <li class="bullet-item">Live interactive online whiteboard sessions</li>
      <li class="bullet-item">Direct Google Meet virtual classroom entries</li>
      <li class="bullet-item">Class 11 and 12 core Psychology study material</li>
      <li class="bullet-item">Real-time attendance, assignment tracking, and test results</li>
    </ul>

    <p>We look forward to partnering with you on your academic journey.</p>
    <p>Warmest regards,<br>The PsySphere Team</p>
  `;
  return renderBaseEmailLayout("Set Up Your PsySphere Account", content);
}

export function getPasswordSetupTemplate(payload: PasswordSetupPayload): string {
  const content = `
    <h1>Set Up Your Password</h1>
    <p>Hello ${payload.studentName},</p>
    <p>A request was received to configure or reset your password for the email address <strong>${payload.email}</strong> on PsySphere.</p>
    
    <p>Please click the button below to access the secure password builder and update your credentials:</p>

    <div class="btn-container">
      <a href="${payload.passwordSetupUrl}" class="btn" target="_blank">Set Secure Password</a>
    </div>

    <p>If you did not initiate this request or if you believe this message was sent in error, please disregard it safely. Your password remains unchanged.</p>
    <p>Warm regards,<br>PsySphere Tech Support</p>
  `;
  return renderBaseEmailLayout("Set Up Your Password | PsySphere", content);
}

export function getWelcomeStudentTemplate(payload: WelcomeStudentPayload): string {
  const content = `
    <h1>Welcome to PsySphere Core Coaching</h1>
    <p>Dear ${payload.studentName},</p>
    <p>Congratulations! Your enrollment is fully confirmed, and we are absolutely thrilled to welcome you as an active student at <strong>PsySphere</strong>.</p>
    
    <div class="highlight-box">
      <div class="highlight-item">
        <div class="highlight-label">Official Student ID</div>
        <div class="highlight-value">${payload.studentId}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Dashboard Portal</div>
        <div class="highlight-value">psy-sphere.vercel.app/dashboard</div>
      </div>
    </div>

    <p>Your portal is now fully activated. Sign in to review your core course curriculum, active assignment queues, download premium whiteboard notes, and find your upcoming weekly class schedule.</p>

    <div class="btn-container">
      <a href="/dashboard" class="btn">Access Student Dashboard</a>
    </div>

    <p>We are dedicated to supporting your pursuit of academic excellence in Class 11 & 12 Psychology. We look forward to our first session!</p>
    <p>To your success,<br>Dr. Aristha Sen & The PsySphere Faculty</p>
  `;
  return renderBaseEmailLayout("Welcome to PsySphere!", content);
}
