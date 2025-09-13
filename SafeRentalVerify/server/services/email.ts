import sgMail from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from: string;
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
  private fromEmail = process.env.FROM_EMAIL || 'noreply@saferental.com';

  constructor() {
    // Initialize SendGrid with API key
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      
      if (!apiKey) {
        console.log('SendGrid API key not found, simulating email send:', {
          to: params.to,
          from: params.from || this.fromEmail,
          subject: params.subject,
          hasAttachment: !!params.attachments?.length,
        });
        return true;
      }

      const msg = {
        to: params.to,
        from: params.from || this.fromEmail,
        subject: params.subject,
        text: params.text,
        html: params.html,
        attachments: params.attachments?.map(att => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          type: att.type,
          disposition: 'attachment' as const,
        })),
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${params.to}`);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">SafeRental - Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      from: this.fromEmail,
      subject: 'SafeRental - Email Verification Code',
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">SafeRental - Your Rental Agreement</h2>
        <p>Your rental agreement has been successfully generated and verified.</p>
        <p><strong>Agreement Number:</strong> ${agreementNumber}</p>
        <p>Please find your rental agreement attached to this email.</p>
        <p>Keep this document safe as it serves as your legal rental agreement.</p>
        <p>Thank you for using SafeRental!</p>
      </div>
    `;

    const tenantSuccess = await this.sendEmail({
      to: tenantEmail,
      from: this.fromEmail,
      subject: `SafeRental - Rental Agreement ${agreementNumber}`,
      html,
      attachments: [{
        filename: `rental-agreement-${agreementNumber}.pdf`,
        content: pdfBuffer,
        type: 'application/pdf',
      }],
    });

    const landlordSuccess = await this.sendEmail({
      to: landlordEmail,
      from: this.fromEmail,
      subject: `SafeRental - Rental Agreement ${agreementNumber}`,
      html,
      attachments: [{
        filename: `rental-agreement-${agreementNumber}.pdf`,
        content: pdfBuffer,
        type: 'application/pdf',
      }],
    });

    return tenantSuccess && landlordSuccess;
  }
}

export const emailService = new EmailService();
