import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailParams {
  to: string;
  from?: string; // Optional because we have a default
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    type: string;
  }>;
}

export class EmailService {
  // Use the email verified in your SMTP settings
  private fromEmail = process.env.FROM_EMAIL || 'noreply@saferental.com';
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      console.warn('⚠️ SMTP Credentials are missing from environment variables.');
    }
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      // Fallback for development if no Transporter exists
      if (!this.transporter) {
        console.log('🛠️ SIMULATION: Email would be sent:', {
          to: params.to,
          subject: params.subject,
          attachments: params.attachments?.map(a => a.filename)
        });
        return true;
      }

      const mailOptions = {
        to: params.to,
        from: params.from || this.fromEmail,
        subject: params.subject,
        text: params.text || '',
        html: params.html || '',
        // Nodemailer handles Buffers natively, simpler than SendGrid
        attachments: params.attachments?.map(att => ({
          filename: att.filename,
          content: att.content, // Nodemailer accepts Buffer directly
          contentType: att.type,
          disposition: 'attachment',
        })),
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${params.to}`);
      return true;
    } catch (error: any) {
      console.error('❌ Email Sending Error:');
      if (error.response) {
        console.error(error.response);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #3b82f6;">SafeRental Verification</h2>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'SafeRental Verification Code',
      html,
    });
  }

  async sendAgreementPdf(
    tenantEmail: string,
    landlordEmail: string,
    agreementNumber: string,
    pdfBuffer: Buffer
  ): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Your Rental Agreement</h2>
        <p>Agreement <strong>${agreementNumber}</strong> is ready and attached.</p>
      </div>
    `;

    const attachment = {
      filename: `agreement-${agreementNumber}.pdf`,
      content: pdfBuffer,
      type: 'application/pdf',
    };

    // Send to both parties
    const tenantTask = this.sendEmail({ to: tenantEmail, subject: 'Your Agreement', html, attachments: [attachment] });
    const landlordTask = this.sendEmail({ to: landlordEmail, subject: 'Your Agreement', html, attachments: [attachment] });

    const results = await Promise.all([tenantTask, landlordTask]);
    return results.every(res => res === true);
  }
}

export const emailService = new EmailService();