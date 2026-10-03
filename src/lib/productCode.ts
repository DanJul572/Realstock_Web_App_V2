import request from '@/lib/request';

// Generated codes look like "RS-7KQ2M9XA". The alphabet skips characters that
// are easy to misread on a printed label (0/O, 1/I/L).
const prefix = 'RS-';
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const length = 8;
const maxAttempts = 5;

export const maxCodeLength = 64;

export type CodeAvailabilityType = {
  available: boolean;
  code: string;
};

const randomCode = (): string => {
  const values = new Uint32Array(length);
  globalThis.crypto.getRandomValues(values);
  return prefix + Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
};

export const checkCodeAvailability = (code: string, ignoreId?: string | number) =>
  request.get<CodeAvailabilityType>('/products/check-code', {
    code,
    ignoreId: ignoreId ? Number(ignoreId) : undefined,
  });

// Generates a random code and asks the backend whether it is still free,
// retrying with a new code if it is already used by another product.
export const generateUniqueCode = async (ignoreId?: string | number): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = randomCode();
    const { available } = await checkCodeAvailability(code, ignoreId);
    if (available) {
      return code;
    }
  }
  throw new Error('Could not generate a unique code, please try again.');
};
