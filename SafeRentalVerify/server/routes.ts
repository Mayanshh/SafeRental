import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { insertAgreementSchema, insertOtpVerificationSchema } from "@shared/schema";
import { firebaseService } from "./services/firebase";
import { pdfGeneratorService } from "./services/pdf-generator";
import { emailService } from "./services/email";
import multer from "multer";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images and PDFs
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // REMOVED: Public static file serving for security
  // ID documents should never be publicly accessible
  
  // Create rental agreement
  app.post('/api/agreements', upload.fields([
    { name: 'tenantIdProof', maxCount: 1 },
    { name: 'landlordIdProof', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const validatedData = insertAgreementSchema.parse(req.body);
      
      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Server-side validation: Require both ID proof files
      if (!files.tenantIdProof || !files.tenantIdProof[0]) {
        return res.status(400).json({ message: 'Tenant ID proof document is required' });
      }
      
      if (!files.landlordIdProof || !files.landlordIdProof[0]) {
        return res.status(400).json({ message: 'Landlord ID proof document is required' });
      }
      
      const tenantIdProofUrl = `/uploads/${files.tenantIdProof[0].filename}`;
      const landlordIdProofUrl = `/uploads/${files.landlordIdProof[0].filename}`;
      
      const agreement = await dbStorage.createAgreement({
        ...validatedData,
        tenantIdProofUrl,
        landlordIdProofUrl,
      });
      
      res.json(agreement);
    } catch (error) {
      console.error('Error creating agreement:', error);
      res.status(400).json({ message: 'Failed to create agreement' });
    }
  });

  // Get agreement by ID
  app.get('/api/agreements/:id', async (req, res) => {
    try {
      const agreement = await dbStorage.getAgreement(req.params.id);
      if (!agreement) {
        return res.status(404).json({ message: 'Agreement not found' });
      }
      res.json(agreement);
    } catch (error) {
      console.error('Error fetching agreement:', error);
      res.status(500).json({ message: 'Failed to fetch agreement' });
    }
  });

  // Verify agreement by number
  app.get('/api/agreements/verify/:agreementNumber', async (req, res) => {
    try {
      const agreement = await dbStorage.getAgreementByNumber(req.params.agreementNumber);
      if (!agreement) {
        return res.status(404).json({ message: 'Agreement not found' });
      }
      
      if (!agreement.tenantVerified || !agreement.landlordVerified) {
        return res.status(400).json({ message: 'Agreement not fully verified' });
      }
      
      res.json({
        verified: true,
        agreement: {
          agreementNumber: agreement.agreementNumber,
          tenantName: agreement.tenantFullName,
          landlordName: agreement.landlordFullName,
          propertyAddress: agreement.propertyAddress,
          monthlyRent: agreement.monthlyRent,
          createdAt: agreement.createdAt,
        }
      });
    } catch (error) {
      console.error('Error verifying agreement:', error);
      res.status(500).json({ message: 'Failed to verify agreement' });
    }
  });

  // Get user agreements
  app.get('/api/agreements/user/:email', async (req, res) => {
    try {
      const agreements = await dbStorage.getAgreementsByUser(req.params.email);
      res.json(agreements);
    } catch (error) {
      console.error('Error fetching user agreements:', error);
      res.status(500).json({ message: 'Failed to fetch agreements' });
    }
  });

  // Send OTP
  app.post('/api/otp/send', async (req, res) => {
    try {
      const { agreementId, contactInfo, contactType, userType } = req.body;
      
      if (!agreementId || !contactInfo || !contactType || !userType) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      let otpCode: string;
      
      if (contactType === 'phone') {
        otpCode = await firebaseService.sendPhoneOtp(contactInfo);
      } else if (contactType === 'email') {
        otpCode = await firebaseService.sendEmailOtp(contactInfo);
        await emailService.sendOtpEmail(contactInfo, otpCode);
      } else {
        return res.status(400).json({ message: 'Invalid contact type' });
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      const otpVerification = await dbStorage.createOtpVerification({
        agreementId,
        contactInfo,
        contactType,
        userType,
        otpCode,
        expiresAt,
      });

      res.json({ otpId: otpVerification.id, message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  });

  // Verify OTP
  app.post('/api/otp/verify', async (req, res) => {
    try {
      const { otpId, otpCode } = req.body;
      
      if (!otpId || !otpCode) {
        return res.status(400).json({ message: 'Missing OTP ID or code' });
      }

      const otpVerification = await dbStorage.getOtpVerification(otpId);
      if (!otpVerification) {
        return res.status(404).json({ message: 'OTP not found' });
      }

      if (otpVerification.expiresAt < new Date()) {
        return res.status(400).json({ message: 'OTP expired' });
      }

      if (otpVerification.otpCode !== otpCode) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // Mark OTP as verified
      await dbStorage.verifyOtp(otpId);

      // Update agreement verification status
      const agreement = await dbStorage.getAgreement(otpVerification.agreementId!);
      if (agreement) {
        const updates: any = {};
        if (otpVerification.userType === 'tenant') {
          updates.tenantVerified = true;
        } else if (otpVerification.userType === 'landlord') {
          updates.landlordVerified = true;
        }

        const updatedAgreement = await dbStorage.updateAgreement(agreement.id, updates);
        
        // If both parties are verified, generate and send PDF
        if (updatedAgreement?.tenantVerified && updatedAgreement?.landlordVerified) {
          try {
            const pdfBuffer = await pdfGeneratorService.generateAgreementPdf(updatedAgreement);
            await emailService.sendAgreementPdf(
              updatedAgreement.tenantEmail,
              updatedAgreement.landlordEmail,
              updatedAgreement.agreementNumber,
              pdfBuffer
            );
            
            // Update agreement with PDF generated status
            await dbStorage.updateAgreement(agreement.id, { pdfUrl: `generated-${agreement.agreementNumber}.pdf` });
          } catch (pdfError) {
            console.error('Error generating/sending PDF:', pdfError);
          }
        }
      }

      res.json({ verified: true, message: 'OTP verified successfully' });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Failed to verify OTP' });
    }
  });

  // Generate secure signed URL for file access
  app.post('/api/files/generate-url', async (req, res) => {
    try {
      const { agreementId, fileType, email } = req.body;
      
      if (!email || !agreementId || !fileType) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      // Get agreement and verify user has access
      const agreement = await dbStorage.getAgreement(agreementId);
      if (!agreement) {
        return res.status(404).json({ message: 'Agreement not found' });
      }
      
      // Check if user is authorized (tenant or landlord)
      const isAuthorized = agreement.tenantEmail === email || agreement.landlordEmail === email;
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
      
      // Verify file type matches user type
      if ((fileType === 'tenant' && agreement.tenantEmail !== email) ||
          (fileType === 'landlord' && agreement.landlordEmail !== email)) {
        return res.status(403).json({ message: 'Cannot access this file type' });
      }
      
      // Generate signed URL valid for 1 hour
      const expiry = Date.now() + (60 * 60 * 1000); // 1 hour
      const payload = `${agreementId}:${fileType}:${email}:${expiry}`;
      const secret = process.env.SESSION_SECRET || 'default-secret';
      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      
      const signedUrl = `/api/files/download/${agreementId}/${fileType}?signature=${signature}&expires=${expiry}&email=${encodeURIComponent(email)}`;
      
      res.json({ signedUrl, expiresAt: new Date(expiry).toISOString() });
      
    } catch (error) {
      console.error('Error generating signed URL:', error);
      res.status(500).json({ message: 'Failed to generate signed URL' });
    }
  });
  
  // Protected file download with signature verification
  app.get('/api/files/download/:agreementId/:fileType', async (req, res) => {
    try {
      const { agreementId, fileType } = req.params;
      const { signature, expires, email } = req.query;
      
      if (!signature || !expires || !email) {
        return res.status(400).json({ message: 'Invalid or missing signature' });
      }
      
      // Check expiry
      const expiryTime = parseInt(expires as string);
      if (Date.now() > expiryTime) {
        return res.status(401).json({ message: 'Signed URL expired' });
      }
      
      // Verify signature
      const payload = `${agreementId}:${fileType}:${email}:${expires}`;
      const secret = process.env.SESSION_SECRET || 'default-secret';
      const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      
      if (signature !== expectedSignature) {
        return res.status(401).json({ message: 'Invalid signature' });
      }
      
      // Get agreement and file URL
      const agreement = await dbStorage.getAgreement(agreementId);
      if (!agreement) {
        return res.status(404).json({ message: 'Agreement not found' });
      }
      
      // Get the appropriate file URL
      let fileUrl: string | null = null;
      if (fileType === 'tenant') {
        fileUrl = agreement.tenantIdProofUrl;
      } else if (fileType === 'landlord') {
        fileUrl = agreement.landlordIdProofUrl;
      }
      
      if (!fileUrl) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Extract filename and construct secure file path
      const filename = fileUrl.replace('/uploads/', '');
      const filePath = path.resolve(path.join(__dirname, '../uploads', filename));
      const uploadsDir = path.resolve(path.join(__dirname, '../uploads'));
      
      // Ensure path is within uploads directory (prevent traversal)
      if (!filePath.startsWith(uploadsDir)) {
        return res.status(403).json({ message: 'Invalid file path' });
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on disk' });
      }
      
      // Set security headers and serve file
      res.setHeader('Content-Disposition', 'attachment');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.sendFile(filePath);
      
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ message: 'Failed to serve file' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
