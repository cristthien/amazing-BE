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
