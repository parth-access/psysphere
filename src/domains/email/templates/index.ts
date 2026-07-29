import { renderBaseEmailLayout } from "./layout";
import { 
  DemoApprovedPayload, 
  StudentInvitationPayload, 
  PasswordSetupPayload, 
  WelcomeStudentPayload,
  DemoRequestReceivedPayload,
  NewLeadInternalPayload,
  DemoScheduledPayload,
  DemoRejectedPayload,
  TeacherActivationPayload,
  PostDemoConversionPayload
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

export function getDemoRequestReceivedTemplate(payload: DemoRequestReceivedPayload): string {
  const content = `
    <h1>Demo Session Request Received</h1>
    <p>Dear ${payload.studentName},</p>
    <p>Thank you for requesting a live psychology demo session with <strong>PsySphere Coaching</strong>. We have received your request and our academic team is reviewing it.</p>
    
    <div class="highlight-box">
      <div class="highlight-item">
        <div class="highlight-label">Class Level</div>
        <div class="highlight-value">${payload.classLevel === "class11" ? "Class 11" : payload.classLevel === "class12" ? "Class 12" : payload.classLevel}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Preferred Session Slot</div>
        <div class="highlight-value">
          ${payload.preferredDate ? payload.preferredDate.charAt(0).toUpperCase() + payload.preferredDate.slice(1) : "TBD"}
          ${payload.preferredTime ? ` at ${payload.preferredTime}` : ""}
        </div>
      </div>
    </div>

    <p><strong>What's next?</strong></p>
    <p>An administrator will review your preferred slot and confirm your assigned faculty. Once approved, you will receive another email containing your access credentials and session link.</p>
    
    <p>If you have any questions, feel free to reply to this email.</p>
    <p>Best regards,<br>The PsySphere Team</p>
  `;
  return renderBaseEmailLayout("Demo Request Received | PsySphere", content);
}

export function getNewLeadInternalTemplate(payload: NewLeadInternalPayload): string {
  const content = `
    <h1>New Booking Lead Received</h1>
    <p>A new visitor has submitted a book demo form on the website. Here are the applicant details:</p>
    
    <div class="highlight-box">
      <div class="highlight-item">
        <div class="highlight-label">Student Name</div>
        <div class="highlight-value">${payload.studentName}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Parent/Guardian Name</div>
        <div class="highlight-value">${payload.parentName}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Email Address</div>
        <div class="highlight-value">${payload.email}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Phone Number</div>
        <div class="highlight-value">${payload.phone}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Class & Package</div>
        <div class="highlight-value">${payload.classLevel} (${payload.programType})</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Preferred Slot</div>
        <div class="highlight-value">${payload.preferredDate} at ${payload.preferredTime}</div>
      </div>
      ${payload.notes ? `
        <div class="highlight-item" style="margin-top: 12px;">
          <div class="highlight-label">Notes/Comments</div>
          <div class="highlight-value" style="font-style: italic;">"${payload.notes}"</div>
        </div>
      ` : ""}
    </div>

    <p>Please log in to the PsySphere Admin OS to review, assign a faculty member, and approve this lead.</p>
    <div class="btn-container">
      <a href="${process.env.APP_URL || "http://localhost:3000"}/dashboard/admissions/${payload.admissionId}" class="btn" target="_blank">Open Admissions Dashboard</a>
    </div>
  `;
  return renderBaseEmailLayout("[NEW LEAD] Demo Booking Request", content);
}

export function getDemoScheduledTemplate(payload: DemoScheduledPayload, isRescheduled?: boolean): string {
  const content = `
    <h1>Your Live Demo is ${isRescheduled ? "Rescheduled" : "Scheduled"}!</h1>
    <p>Dear ${payload.studentName},</p>
    <p>Your interactive live psychology demo class has been ${isRescheduled ? "rescheduled to a new slot" : "scheduled"}. Your assigned faculty member is ready to meet you.</p>
    
    <div class="highlight-box">
      <div class="highlight-item">
        <div class="highlight-label">Instructor</div>
        <div class="highlight-value">${payload.teacherName}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Scheduled Date</div>
        <div class="highlight-value">${payload.demoDate}</div>
      </div>
      <div class="highlight-item" style="margin-top: 12px;">
        <div class="highlight-label">Scheduled Time</div>
        <div class="highlight-value">${payload.demoTime}</div>
      </div>
    </div>

    <p>Your interactive live session will be conducted via Google Meet. Please click the button below to join the classroom when your session starts:</p>
    <div class="btn-container">
      <a href="${payload.googleMeetUrl}" class="btn" target="_blank">Join Demo Lecture</a>
    </div>

    <p>Please make sure you have a reliable internet connection and a working microphone/camera for the interactive session.</p>
    <p>Best regards,<br>The PsySphere Academic Team</p>
  `;
  return renderBaseEmailLayout(isRescheduled ? "Live Demo Rescheduled | PsySphere" : "Live Demo Scheduled | PsySphere", content);
}

export function getDemoRejectedTemplate(payload: DemoRejectedPayload): string {
  const content = `
    <h1>Demo Session Status Update</h1>
    <p>Dear ${payload.studentName},</p>
    <p>Thank you for your interest in <strong>PsySphere Coaching</strong>.</p>
    <p>After reviewing your request, we regret to inform you that we are unable to schedule a demo session for your preferred slot at this time due to high volume or schedule conflicts.</p>
    <p>If you'd like to try booking a different slot or have any other queries, please reach out to our team at <a href="mailto:psysphereclasses@gmail.com">psysphereclasses@gmail.com</a>.</p>
    <p>Warm regards,<br>Admissions Department<br>PsySphere</p>
  `;
  return renderBaseEmailLayout("Demo Session Request Update | PsySphere", content);
}

export function getTeacherActivationTemplate(payload: TeacherActivationPayload): string {
  const content = `
    <h1>Welcome to PsySphere Faculty Portal</h1>
    <p>Dear ${payload.teacherName},</p>
    <p>You have been invited to join the <strong>PsySphere Academic Faculty</strong> as an instructor. An official profile has been created for you.</p>
    
    <p>To secure your account and set up your password, please click the secure link below:</p>
    <div class="btn-container">
      <a href="${payload.passwordSetupUrl}" class="btn" target="_blank">Activate Faculty Account</a>
    </div>

    <p>Once your password is set, you will be able to manage your batch schedules, host live virtual lectures, take attendance, and grade assignments.</p>
    <p>Welcome aboard!</p>
    <p>Warmest regards,<br>The PsySphere Administration Team</p>
  `;
  return renderBaseEmailLayout("Faculty Account Invitation | PsySphere", content);
}

export function getPostDemoConversionTemplate(payload: PostDemoConversionPayload): string {
  const content = `
    <h1>How Was Your PsySphere Demo? 💜</h1>
    <p>Dear ${payload.studentName},</p>
    <p>Thank you for attending your live interactive psychology demo session with us. We hope you found the whiteboard session and instructional approach valuable!</p>
    
    <p>To help you decide if PsySphere is the right fit for your Class 11/12 boards and CUET preparation, we have created a temporary student portal preview for you. You can explore the dashboard and try out its interactive features below:</p>
    
    <div class="btn-container" style="margin-bottom: 16px;">
      <a href="${payload.previewUrl}" class="btn" target="_blank">Explore Preview Experience</a>
    </div>
    
    <p>Ready to lock in your enrollment and secure your batch placement? You can complete your official registration and package selection here:</p>
    
    <div class="btn-container" style="margin-top: 16px;">
      <a href="${payload.joinUrl}" class="btn" target="_blank" style="background-color: #7C3AED;">Continue & Enroll Now</a>
    </div>

    <p>If you have any questions or would like to discuss payment structures and schedules, feel free to reply directly to this email.</p>
    <p>Warmest regards,<br>The PsySphere Team</p>
  `;
  return renderBaseEmailLayout("How Was Your PsySphere Demo? Continue Your Journey With Us 💜", content);
}

