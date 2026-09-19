import { PhiMasker } from './phi-masker';

describe('PhiMasker', () => {
  it('should mask phone numbers properly', () => {
    expect(PhiMasker.maskPhone('+14155551234')).toBe('+1415***1234');
    expect(PhiMasker.maskPhone('+919876543210')).toBe('+9198***3210');
  });

  it('should mask patient names preserving first initials', () => {
    expect(PhiMasker.maskName('John Doe')).toBe('J*** D**');
    expect(PhiMasker.maskName('Alice Bob Charlie')).toBe('A**** B** C******');
  });

  it('should mask authorization secrets', () => {
    const masked = PhiMasker.maskSecret('Bearer vk_live_abcdef123456');
    expect(masked).toBe('Bearer vk_live_...***');
  });

  it('should recursively sanitize sensitive keys in nested payloads', () => {
    const rawPayload = {
      appointment_id: 'APT-98231',
      patient: {
        name: 'John Doe',
        phone: '+14155551234',
      },
      appointment: {
        doctor: 'Dr. Michael Smith',
        practice_id: 'practice_001',
      },
    };

    const sanitized = PhiMasker.sanitize(rawPayload);

    expect(sanitized.appointment_id).toBe('APT-98231');
    expect(sanitized.patient.name).toBe('J*** D**');
    expect(sanitized.patient.phone).toBe('+1415***1234');
  });
});
