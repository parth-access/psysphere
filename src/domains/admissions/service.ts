import { admissionRepository } from "./repository";
import { onboardingService } from "../onboarding/service";

export class AdmissionService {
  async approveDemo(id: string) {
    return await onboardingService.approveDemo(id);
  }

  async reject(id: string) {
    return await admissionRepository.updateStatus(id, "REJECTED");
  }

  async scheduleDemo(id: string, teacherId: string, demoDate: string) {
    const updated = await admissionRepository.updateDemoDetails(id, teacherId, demoDate);
    await admissionRepository.updateStatus(id, "DEMO_SCHEDULED");
    return updated;
  }
  
  async convertToStudent(id: string) {
    return await admissionRepository.updateStatus(id, "ENROLLED");
  }
}

export const admissionService = new AdmissionService();
