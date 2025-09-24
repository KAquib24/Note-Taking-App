import bcrypt from 'bcryptjs';

export class PasswordUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static isStrongPassword(password: string): boolean {
    // Minimum 6 characters, at least one letter and one number
    const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    return strongPasswordRegex.test(password);
  }
}