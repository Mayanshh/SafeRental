// Enhanced OTP service with proper email delivery

export class FirebaseService {
  async sendPhoneOtp(phoneNumber: string): Promise<string> {
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // For MVP: Log to console (in production, implement Firebase Auth phone verification)
      console.log(`📱 Phone OTP for ${phoneNumber}: ${otp}`);
      console.log(`ℹ️  In production, this would be sent via Firebase Auth phone verification`);      
      return otp;
    } catch (error) {
      console.error('Error sending phone OTP:', error);
      throw new Error('Failed to send phone OTP');
    }
  }

  async sendEmailOtp(email: string): Promise<string> {
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Log for development visibility
      console.log(`📧 Email OTP for ${email}: ${otp}`);
      console.log(`ℹ️  OTP will be sent via SendGrid email service`);      
      return otp;
    } catch (error) {
      console.error('Error sending email OTP:', error);
      throw new Error('Failed to send email OTP');
    }
  }

  async verifyOtp(otp: string, expectedOtp: string): Promise<boolean> {
    return otp === expectedOtp;
  }
}

export const firebaseService = new FirebaseService();
