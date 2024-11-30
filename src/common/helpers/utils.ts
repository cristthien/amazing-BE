import * as bcrypt from 'bcrypt';

const saltRounds = 10;

// Function to hash a password
export const HashPasswordHelper = async (
  plainText: string,
): Promise<string | null> => {
  try {
    const hashedPassword = await bcrypt.hash(plainText, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    return null; // Return null or handle the error based on your strategy
  }
};

// Function to compare a plain text password with a hashed password
export const ComparePasswordHelper = async (
  plainText: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    const match = await bcrypt.compare(plainText, hashedPassword);
    return match; // Returns true if the passwords match, false otherwise
  } catch (error) {
    console.error('Error comparing password:', error);
    return false; // Handle error based on your strategy
  }
};
export function convertTimeLeftToString(ms: number): string {
  const days = Math.floor(ms / (24 * 3600000));
  const hours = Math.floor((ms % (24 * 3600000)) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  let timeString = '';

  if (days > 0) {
    timeString += `${days} day${days > 1 ? 's' : ''}, `;
  }
  if (hours > 0 || days > 0) {
    timeString += `${hours} hour${hours > 1 ? 's' : ''}, `;
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    timeString += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
  }
  timeString += `${seconds} second${seconds > 1 ? 's' : ''}`;

  return timeString;
}
