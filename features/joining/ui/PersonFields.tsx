import { Field, FormSection, TextInput, inputClass } from "./Field";
import type { FieldErrors } from "@/src/domains/joining/validation";

/** Student and parent details, shared by the workshop and join forms. */
export function PersonFields({
  errors,
  defaultClass,
  showClass = true,
  showParentEmail = false,
}: {
  errors: FieldErrors;
  defaultClass?: string;
  showClass?: boolean;
  showParentEmail?: boolean;
}) {
  return (
    <>
      <FormSection title="Student">
        <Field label="Full name" name="studentName" error={errors.studentName}>
          <TextInput name="studentName" autoComplete="name" required error={errors.studentName} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" name="email" error={errors.email} hint="Your login and class links go here">
            <TextInput name="email" type="email" autoComplete="email" required error={errors.email} />
          </Field>
          <Field label="Mobile number" name="phone" error={errors.phone}>
            <TextInput name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" required error={errors.phone} />
          </Field>
        </div>
        {showClass && (
          <Field label="Class" name="classLevel" error={errors.classLevel}>
            <select id="classLevel" name="classLevel" defaultValue={defaultClass ?? ""} required className={inputClass}>
              <option value="" disabled>Choose class</option>
              <option value="class_11">Class 11</option>
              <option value="class_12">Class 12</option>
            </select>
          </Field>
        )}
      </FormSection>

      <FormSection title="Parent or guardian">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Parent’s name" name="parentName" error={errors.parentName}>
            <TextInput name="parentName" required error={errors.parentName} />
          </Field>
          <Field label="Parent’s mobile number" name="parentPhone" error={errors.parentPhone}>
            <TextInput name="parentPhone" type="tel" inputMode="tel" placeholder="98765 43210" required error={errors.parentPhone} />
          </Field>
        </div>
        {showParentEmail && (
          <Field label="Parent’s email (optional)" name="parentEmail" error={errors.parentEmail} hint="We send a short progress report here every week">
            <TextInput name="parentEmail" type="email" error={errors.parentEmail} />
          </Field>
        )}
      </FormSection>

      {/* Honeypot for bots, hidden from people and screen readers */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </>
  );
}
