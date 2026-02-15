// server/services/firebase.ts

export class FirebaseService {
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendPhoneOtp(phoneNumber: string): Promise<string> {
    try {
      const otp = this.generateOtp();
      console.log(`📱 [SMS] To: ${phoneNumber} | Code: ${otp}`);
      return otp;
    } catch (error) {
      console.error('Error in sendPhoneOtp:', error);
      throw new Error('Failed to send phone OTP');
    }
  }

  async sendEmailOtp(email: string): Promise<string> {
    try {
      const otp = this.generateOtp();
      console.log(`📧 [Email] To: ${email} | Code: ${otp}`);
      return otp;
    } catch (error) {
      console.error('Error in sendEmailOtp:', error);
      throw new Error('Failed to send email OTP');
    }
  }

  async verifyOtp(providedOtp: string, actualOtp: string): Promise<boolean> {
    return providedOtp === actualOtp;
  }
}

// THIS NAME MUST MATCH THE IMPORT IN routes.ts
export const firebaseService = new FirebaseService();