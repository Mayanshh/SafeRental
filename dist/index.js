// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/database.ts
import { MongoClient } from "mongodb";
var client;
var db;
async function connectToDatabase() {
  if (db) {
    return db;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }
  try {
    client = new MongoClient(uri);
    await client.connect();
    const dbName = uri.split("/").pop()?.split("?")[0] || "saferental";
    db = client.db(dbName);
    console.log(`\u2705 Connected to MongoDB Atlas: ${dbName}`);
    await ensureIndexes();
    return db;
  } catch (error) {
    console.error("\u274C MongoDB connection failed:", error);
    throw error;
  }
}
async function ensureIndexes() {
  try {
    console.log("\u{1F527} Setting up database indexes...");
    await db.collection("agreements").createIndex({ agreementNumber: 1 }, { unique: true });
    await db.collection("agreements").createIndex({ tenantEmail: 1 });
    await db.collection("agreements").createIndex({ landlordEmail: 1 });
    await db.collection("agreements").createIndex({ createdAt: -1 });
    await db.collection("otpVerifications").createIndex({ agreementId: 1 });
    await db.collection("otpVerifications").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection("otpVerifications").createIndex({
      agreementId: 1,
      contactInfo: 1,
      userType: 1
    });
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    console.log("\u2705 Database indexes created successfully");
  } catch (error) {
    console.error("\u26A0\uFE0F  Error creating indexes:", error);
  }
}
async function getDatabase() {
  if (!db) {
    return await connectToDatabase();
  }
  return db;
}

// server/storage.ts
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
var MongoStorage = class {
  async getDb() {
    return await getDatabase();
  }
  // Generate atomic agreement number using MongoDB counters
  async generateAgreementNumber() {
    const db2 = await this.getDb();
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear().toString();
    const result = await db2.collection("counters").findOneAndUpdate(
      { _id: currentYear },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    const seq = result?.seq || 1;
    return `SR-${currentYear}-${String(seq).padStart(6, "0")}`;
  }
  async getUser(id) {
    const db2 = await this.getDb();
    const result = await db2.collection("users").findOne({ id });
    return result ? this.mongoToUser(result) : void 0;
  }
  async getUserByUsername(username) {
    const db2 = await this.getDb();
    const result = await db2.collection("users").findOne({ username });
    return result ? this.mongoToUser(result) : void 0;
  }
  async createUser(insertUser) {
    const db2 = await this.getDb();
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db2.collection("users").insertOne({ ...user, _id: new ObjectId() });
    return user;
  }
  async createAgreement(insertAgreement) {
    const db2 = await this.getDb();
    const id = randomUUID();
    const agreementNumber = await this.generateAgreementNumber();
    const agreement = {
      ...insertAgreement,
      id,
      agreementNumber,
      tenantVerified: false,
      landlordVerified: false,
      isActive: true,
      pdfUrl: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db2.collection("agreements").insertOne({ ...agreement, _id: new ObjectId() });
    return agreement;
  }
  async getAgreement(id) {
    const db2 = await this.getDb();
    const result = await db2.collection("agreements").findOne({ id });
    return result ? this.mongoToAgreement(result) : void 0;
  }
  async getAgreementByNumber(agreementNumber) {
    const db2 = await this.getDb();
    const result = await db2.collection("agreements").findOne({ agreementNumber });
    return result ? this.mongoToAgreement(result) : void 0;
  }
  async updateAgreement(id, updates) {
    const db2 = await this.getDb();
    const result = await db2.collection("agreements").findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: /* @__PURE__ */ new Date() } },
      { returnDocument: "after" }
    );
    return result ? this.mongoToAgreement(result) : void 0;
  }
  async getAgreementsByUser(email) {
    const db2 = await this.getDb();
    const results = await db2.collection("agreements").find({
      $or: [
        { tenantEmail: email },
        { landlordEmail: email }
      ]
    }).sort({ createdAt: -1 }).toArray();
    return results.map((r) => this.mongoToAgreement(r));
  }
  async createOtpVerification(insertOtp) {
    const db2 = await this.getDb();
    const id = randomUUID();
    const otp = {
      ...insertOtp,
      id,
      verified: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db2.collection("otpVerifications").insertOne({ ...otp, _id: new ObjectId() });
    return otp;
  }
  async getOtpVerification(id) {
    const db2 = await this.getDb();
    const result = await db2.collection("otpVerifications").findOne({ id });
    return result ? this.mongoToOtp(result) : void 0;
  }
  async verifyOtp(id) {
    const db2 = await this.getDb();
    const otp = await this.getOtpVerification(id);
    if (!otp || otp.expiresAt < /* @__PURE__ */ new Date()) return false;
    await db2.collection("otpVerifications").updateOne(
      { id },
      { $set: { verified: true } }
    );
    return true;
  }
  async getValidOtp(agreementId, contactInfo, userType) {
    const db2 = await this.getDb();
    const result = await db2.collection("otpVerifications").findOne({
      agreementId,
      contactInfo,
      userType,
      verified: false,
      expiresAt: { $gt: /* @__PURE__ */ new Date() }
    });
    return result ? this.mongoToOtp(result) : void 0;
  }
  // Helper methods to convert MongoDB documents to typed objects
  mongoToUser(doc) {
    return {
      id: doc.id,
      username: doc.username,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
  mongoToAgreement(doc) {
    return {
      id: doc.id,
      agreementNumber: doc.agreementNumber,
      tenantFullName: doc.tenantFullName,
      tenantEmail: doc.tenantEmail,
      tenantPhone: doc.tenantPhone,
      tenantDob: doc.tenantDob,
      tenantAddress: doc.tenantAddress,
      tenantIdProofUrl: doc.tenantIdProofUrl || null,
      landlordFullName: doc.landlordFullName,
      landlordEmail: doc.landlordEmail,
      landlordPhone: doc.landlordPhone,
      landlordAddress: doc.landlordAddress,
      landlordIdProofUrl: doc.landlordIdProofUrl || null,
      propertyAddress: doc.propertyAddress,
      monthlyRent: doc.monthlyRent,
      securityDeposit: doc.securityDeposit,
      leaseDuration: doc.leaseDuration,
      leaseStartDate: doc.leaseStartDate,
      leaseEndDate: doc.leaseEndDate,
      tenantVerified: doc.tenantVerified || false,
      landlordVerified: doc.landlordVerified || false,
      isActive: doc.isActive !== void 0 ? doc.isActive : true,
      pdfUrl: doc.pdfUrl || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
  mongoToOtp(doc) {
    return {
      id: doc.id,
      agreementId: doc.agreementId,
      contactInfo: doc.contactInfo,
      contactType: doc.contactType,
      userType: doc.userType,
      otpCode: doc.otpCode,
      verified: doc.verified || false,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt
    };
  }
};
var storage = new MongoStorage();

// shared/schema.ts
import { z } from "zod";
var userSchema = z.object({
  _id: z.string().optional(),
  // MongoDB ObjectId
  id: z.string(),
  // Keep for compatibility
  username: z.string().min(1),
  // Removed password - using Firebase Auth exclusively
  createdAt: z.date().default(() => /* @__PURE__ */ new Date()),
  updatedAt: z.date().default(() => /* @__PURE__ */ new Date())
});
var agreementSchema = z.object({
  _id: z.string().optional(),
  // MongoDB ObjectId
  id: z.string(),
  // Keep for compatibility
  agreementNumber: z.string(),
  // Tenant details
  tenantFullName: z.string().min(1),
  tenantEmail: z.string().email(),
  tenantPhone: z.string().min(1),
  tenantDob: z.string(),
  // ISO date string
  tenantAddress: z.string().min(1),
  tenantIdProofUrl: z.string().nullable().optional(),
  // Landlord details
  landlordFullName: z.string().min(1),
  landlordEmail: z.string().email(),
  landlordPhone: z.string().min(1),
  landlordAddress: z.string().min(1),
  landlordIdProofUrl: z.string().nullable().optional(),
  // Rental details
  propertyAddress: z.string().min(1),
  monthlyRent: z.string(),
  // Keep as string for form compatibility
  securityDeposit: z.string().optional(),
  leaseDuration: z.string().min(1),
  leaseStartDate: z.string(),
  // ISO date string
  leaseEndDate: z.string(),
  // ISO date string
  // Verification status
  tenantVerified: z.boolean().default(false),
  landlordVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // Generated PDF
  pdfUrl: z.string().nullable().optional(),
  // Timestamps
  createdAt: z.date().default(() => /* @__PURE__ */ new Date()),
  updatedAt: z.date().default(() => /* @__PURE__ */ new Date())
});
var otpVerificationSchema = z.object({
  _id: z.string().optional(),
  // MongoDB ObjectId
  id: z.string(),
  // Keep for compatibility
  agreementId: z.string(),
  contactInfo: z.string(),
  // email or phone
  contactType: z.enum(["email", "phone"]),
  userType: z.enum(["tenant", "landlord"]),
  otpCode: z.string(),
  verified: z.boolean().default(false),
  expiresAt: z.date(),
  createdAt: z.date().default(() => /* @__PURE__ */ new Date())
});
var counterSchema = z.object({
  _id: z.string(),
  // year (e.g., "2025")
  seq: z.number().default(0)
});
var insertUserSchema = userSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAgreementSchema = agreementSchema.omit({
  _id: true,
  id: true,
  agreementNumber: true,
  tenantVerified: true,
  landlordVerified: true,
  isActive: true,
  pdfUrl: true,
  createdAt: true,
  updatedAt: true
});
var insertOtpVerificationSchema = otpVerificationSchema.omit({
  _id: true,
  id: true,
  verified: true,
  createdAt: true
});

// server/services/firebase.ts
var FirebaseService = class {
  async sendPhoneOtp(phoneNumber) {
    try {
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      console.log(`\u{1F4F1} Phone OTP for ${phoneNumber}: ${otp}`);
      console.log(`\u2139\uFE0F  In production, this would be sent via Firebase Auth phone verification`);
      return otp;
    } catch (error) {
      console.error("Error sending phone OTP:", error);
      throw new Error("Failed to send phone OTP");
    }
  }
  async sendEmailOtp(email) {
    try {
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      console.log(`\u{1F4E7} Email OTP for ${email}: ${otp}`);
      console.log(`\u2139\uFE0F  OTP will be sent via SendGrid email service`);
      return otp;
    } catch (error) {
      console.error("Error sending email OTP:", error);
      throw new Error("Failed to send email OTP");
    }
  }
  async verifyOtp(otp, expectedOtp) {
    return otp === expectedOtp;
  }
};
var firebaseService = new FirebaseService();

// server/services/pdf-generator.ts
import PDFDocument from "pdfkit";
var PdfGeneratorService = class {
  generateAgreementPdf(agreement) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
        doc.fontSize(20).font("Helvetica-Bold").text("RENTAL AGREEMENT", { align: "center" });
        doc.fontSize(12).font("Helvetica").text(`Agreement Number: ${agreement.agreementNumber}`, { align: "center" });
        doc.moveDown(2);
        doc.fontSize(14).font("Helvetica-Bold").text("RENTAL AGREEMENT DETAILS");
        doc.moveDown(0.5);
        doc.fontSize(12).font("Helvetica");
        doc.text(`Property Address: ${agreement.propertyAddress}`);
        doc.text(`Monthly Rent: $${agreement.monthlyRent}`);
        if (agreement.securityDeposit) {
          doc.text(`Security Deposit: $${agreement.securityDeposit}`);
        }
        doc.text(`Lease Duration: ${agreement.leaseDuration}`);
        doc.text(`Lease Start Date: ${agreement.leaseStartDate}`);
        doc.text(`Lease End Date: ${agreement.leaseEndDate}`);
        doc.moveDown(1);
        doc.fontSize(14).font("Helvetica-Bold").text("TENANT INFORMATION");
        doc.moveDown(0.5);
        doc.fontSize(12).font("Helvetica");
        doc.text(`Full Name: ${agreement.tenantFullName}`);
        doc.text(`Email: ${agreement.tenantEmail}`);
        doc.text(`Phone: ${agreement.tenantPhone}`);
        doc.text(`Date of Birth: ${agreement.tenantDob}`);
        doc.text(`Address: ${agreement.tenantAddress}`);
        doc.moveDown(1);
        doc.fontSize(14).font("Helvetica-Bold").text("LANDLORD INFORMATION");
        doc.moveDown(0.5);
        doc.fontSize(12).font("Helvetica");
        doc.text(`Full Name: ${agreement.landlordFullName}`);
        doc.text(`Email: ${agreement.landlordEmail}`);
        doc.text(`Phone: ${agreement.landlordPhone}`);
        doc.text(`Address: ${agreement.landlordAddress}`);
        doc.moveDown(2);
        doc.fontSize(14).font("Helvetica-Bold").text("TERMS AND CONDITIONS");
        doc.moveDown(0.5);
        doc.fontSize(11).font("Helvetica");
        const terms = [
          "1. The tenant agrees to pay rent on or before the first day of each month.",
          "2. The security deposit will be returned within 30 days of lease termination, subject to property condition.",
          "3. The tenant is responsible for maintaining the property in good condition.",
          "4. No pets are allowed without prior written consent from the landlord.",
          "5. The tenant must provide 30 days written notice before vacating the property.",
          "6. This agreement is governed by local rental laws and regulations.",
          "7. Both parties have verified their identities through SafeRental platform.",
          "8. Any modifications to this agreement must be in writing and signed by both parties."
        ];
        terms.forEach((term) => {
          doc.text(term, { indent: 20 });
          doc.moveDown(0.3);
        });
        doc.moveDown(2);
        doc.fontSize(14).font("Helvetica-Bold").text("SIGNATURES");
        doc.moveDown(1);
        doc.fontSize(12).font("Helvetica");
        doc.text("Tenant Signature: _________________________", { continued: true });
        doc.text("Date: ___________", { align: "right" });
        doc.moveDown(0.5);
        doc.text(`Print Name: ${agreement.tenantFullName}`);
        doc.moveDown(1.5);
        doc.text("Landlord Signature: _________________________", { continued: true });
        doc.text("Date: ___________", { align: "right" });
        doc.moveDown(0.5);
        doc.text(`Print Name: ${agreement.landlordFullName}`);
        doc.moveDown(2);
        doc.fontSize(10).font("Helvetica").text("This document was generated by SafeRental platform and is legally binding when signed by both parties.", { align: "center" });
        doc.text(`Generated on: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, { align: "center" });
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
};
var pdfGeneratorService = new PdfGeneratorService();

// server/services/email.ts
import sgMail from "@sendgrid/mail";
var EmailService = class {
  fromEmail = process.env.FROM_EMAIL || "noreply@saferental.com";
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }
  async sendEmail(params) {
    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        console.log("SendGrid API key not found, simulating email send:", {
          to: params.to,
          from: params.from || this.fromEmail,
          subject: params.subject,
          hasAttachment: !!params.attachments?.length
        });
        return true;
      }
      const msg = {
        to: params.to,
        from: params.from || this.fromEmail,
        subject: params.subject,
        ...params.text && { text: params.text },
        ...params.html && { html: params.html },
        ...params.attachments && params.attachments.length > 0 && {
          attachments: params.attachments.map((att) => ({
            filename: att.filename,
            content: att.content.toString("base64"),
            type: att.type,
            disposition: "attachment"
          }))
        }
      };
      await sgMail.send(msg);
      console.log(`Email sent successfully to ${params.to}`);
      return true;
    } catch (error) {
      console.error("Email sending error:", error);
      return false;
    }
  }
  async sendOtpEmail(email, otp) {
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
      subject: "SafeRental - Email Verification Code",
      html
    });
  }
  async sendAgreementPdf(tenantEmail, landlordEmail, agreementNumber, pdfBuffer) {
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
        type: "application/pdf"
      }]
    });
    const landlordSuccess = await this.sendEmail({
      to: landlordEmail,
      from: this.fromEmail,
      subject: `SafeRental - Rental Agreement ${agreementNumber}`,
      html,
      attachments: [{
        filename: `rental-agreement-${agreementNumber}.pdf`,
        content: pdfBuffer,
        type: "application/pdf"
      }]
    });
    return tenantSuccess && landlordSuccess;
  }
};
var emailService = new EmailService();

// server/routes.ts
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  }
});
var upload = multer({
  storage: storage2,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg, .jpeg and .pdf files are allowed!"));
    }
  }
});
async function registerRoutes(app2) {
  app2.post("/api/agreements", upload.fields([
    { name: "tenantIdProof", maxCount: 1 },
    { name: "landlordIdProof", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const validatedData = insertAgreementSchema.parse(req.body);
      const files = req.files;
      if (!files.tenantIdProof || !files.tenantIdProof[0]) {
        return res.status(400).json({ message: "Tenant ID proof document is required" });
      }
      if (!files.landlordIdProof || !files.landlordIdProof[0]) {
        return res.status(400).json({ message: "Landlord ID proof document is required" });
      }
      const tenantIdProofUrl = `/uploads/${files.tenantIdProof[0].filename}`;
      const landlordIdProofUrl = `/uploads/${files.landlordIdProof[0].filename}`;
      const agreement = await storage.createAgreement({
        ...validatedData,
        tenantIdProofUrl,
        landlordIdProofUrl
      });
      res.json(agreement);
    } catch (error) {
      console.error("Error creating agreement:", error);
      res.status(400).json({ message: "Failed to create agreement" });
    }
  });
  app2.get("/api/agreements/:id", async (req, res) => {
    try {
      const agreement = await storage.getAgreement(req.params.id);
      if (!agreement) {
        return res.status(404).json({ message: "Agreement not found" });
      }
      res.json(agreement);
    } catch (error) {
      console.error("Error fetching agreement:", error);
      res.status(500).json({ message: "Failed to fetch agreement" });
    }
  });
  app2.get("/api/agreements/verify/:agreementNumber", async (req, res) => {
    try {
      const agreement = await storage.getAgreementByNumber(req.params.agreementNumber);
      if (!agreement) {
        return res.status(404).json({ message: "Agreement not found" });
      }
      if (!agreement.tenantVerified || !agreement.landlordVerified) {
        return res.status(400).json({ message: "Agreement not fully verified" });
      }
      res.json({
        verified: true,
        agreement: {
          agreementNumber: agreement.agreementNumber,
          tenantName: agreement.tenantFullName,
          landlordName: agreement.landlordFullName,
          propertyAddress: agreement.propertyAddress,
          monthlyRent: agreement.monthlyRent,
          createdAt: agreement.createdAt
        }
      });
    } catch (error) {
      console.error("Error verifying agreement:", error);
      res.status(500).json({ message: "Failed to verify agreement" });
    }
  });
  app2.get("/api/agreements/user/:email", async (req, res) => {
    try {
      const agreements = await storage.getAgreementsByUser(req.params.email);
      res.json(agreements);
    } catch (error) {
      console.error("Error fetching user agreements:", error);
      res.status(500).json({ message: "Failed to fetch agreements" });
    }
  });
  app2.post("/api/otp/send", async (req, res) => {
    try {
      const { agreementId, contactInfo, contactType, userType } = req.body;
      if (!agreementId || !contactInfo || !contactType || !userType) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      let otpCode;
      if (contactType === "phone") {
        otpCode = await firebaseService.sendPhoneOtp(contactInfo);
      } else if (contactType === "email") {
        otpCode = await firebaseService.sendEmailOtp(contactInfo);
        await emailService.sendOtpEmail(contactInfo, otpCode);
      } else {
        return res.status(400).json({ message: "Invalid contact type" });
      }
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      const otpVerification = await storage.createOtpVerification({
        agreementId,
        contactInfo,
        contactType,
        userType,
        otpCode,
        expiresAt
      });
      res.json({ otpId: otpVerification.id, message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });
  app2.post("/api/otp/verify", async (req, res) => {
    try {
      const { otpId, otpCode } = req.body;
      if (!otpId || !otpCode) {
        return res.status(400).json({ message: "Missing OTP ID or code" });
      }
      const otpVerification = await storage.getOtpVerification(otpId);
      if (!otpVerification) {
        return res.status(404).json({ message: "OTP not found" });
      }
      if (otpVerification.expiresAt < /* @__PURE__ */ new Date()) {
        return res.status(400).json({ message: "OTP expired" });
      }
      if (otpVerification.otpCode !== otpCode) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      await storage.verifyOtp(otpId);
      const agreement = await storage.getAgreement(otpVerification.agreementId);
      if (agreement) {
        const updates = {};
        if (otpVerification.userType === "tenant") {
          updates.tenantVerified = true;
        } else if (otpVerification.userType === "landlord") {
          updates.landlordVerified = true;
        }
        const updatedAgreement = await storage.updateAgreement(agreement.id, updates);
        if (updatedAgreement?.tenantVerified && updatedAgreement?.landlordVerified) {
          try {
            const pdfBuffer = await pdfGeneratorService.generateAgreementPdf(updatedAgreement);
            await emailService.sendAgreementPdf(
              updatedAgreement.tenantEmail,
              updatedAgreement.landlordEmail,
              updatedAgreement.agreementNumber,
              pdfBuffer
            );
            await storage.updateAgreement(agreement.id, { pdfUrl: `generated-${agreement.agreementNumber}.pdf` });
          } catch (pdfError) {
            console.error("Error generating/sending PDF:", pdfError);
          }
        }
      }
      res.json({ verified: true, message: "OTP verified successfully" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });
  app2.post("/api/files/generate-url", async (req, res) => {
    try {
      const { agreementId, fileType, email } = req.body;
      if (!email || !agreementId || !fileType) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      const agreement = await storage.getAgreement(agreementId);
      if (!agreement) {
        return res.status(404).json({ message: "Agreement not found" });
      }
      const isAuthorized = agreement.tenantEmail === email || agreement.landlordEmail === email;
      if (!isAuthorized) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      if (fileType === "tenant" && agreement.tenantEmail !== email || fileType === "landlord" && agreement.landlordEmail !== email) {
        return res.status(403).json({ message: "Cannot access this file type" });
      }
      const expiry = Date.now() + 60 * 60 * 1e3;
      const payload = `${agreementId}:${fileType}:${email}:${expiry}`;
      const secret = process.env.SESSION_SECRET || "default-secret";
      const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
      const signedUrl = `/api/files/download/${agreementId}/${fileType}?signature=${signature}&expires=${expiry}&email=${encodeURIComponent(email)}`;
      res.json({ signedUrl, expiresAt: new Date(expiry).toISOString() });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      res.status(500).json({ message: "Failed to generate signed URL" });
    }
  });
  app2.get("/api/files/download/:agreementId/:fileType", async (req, res) => {
    try {
      const { agreementId, fileType } = req.params;
      const { signature, expires, email } = req.query;
      if (!signature || !expires || !email) {
        return res.status(400).json({ message: "Invalid or missing signature" });
      }
      const expiryTime = parseInt(expires);
      if (Date.now() > expiryTime) {
        return res.status(401).json({ message: "Signed URL expired" });
      }
      const payload = `${agreementId}:${fileType}:${email}:${expires}`;
      const secret = process.env.SESSION_SECRET || "default-secret";
      const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
      if (signature !== expectedSignature) {
        return res.status(401).json({ message: "Invalid signature" });
      }
      const agreement = await storage.getAgreement(agreementId);
      if (!agreement) {
        return res.status(404).json({ message: "Agreement not found" });
      }
      let fileUrl = null;
      if (fileType === "tenant") {
        fileUrl = agreement.tenantIdProofUrl;
      } else if (fileType === "landlord") {
        fileUrl = agreement.landlordIdProofUrl;
      }
      if (!fileUrl) {
        return res.status(404).json({ message: "File not found" });
      }
      const filename = fileUrl.replace("/uploads/", "");
      const filePath = path.resolve(path.join(__dirname, "../uploads", filename));
      const uploadsDir2 = path.resolve(path.join(__dirname, "../uploads"));
      if (!filePath.startsWith(uploadsDir2)) {
        return res.status(403).json({ message: "Invalid file path" });
      }
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }
      res.setHeader("Content-Disposition", "attachment");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
var vite_config_default = defineConfig(async () => {
  const plugins = [react()];
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0) {
    try {
      const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
      const cartographer = await import("@replit/vite-plugin-cartographer");
      const devBanner = await import("@replit/vite-plugin-dev-banner");
      if (runtimeErrorOverlay.default) plugins.push(runtimeErrorOverlay.default());
      if (cartographer.cartographer) plugins.push(cartographer.cartographer());
      if (devBanner.devBanner) plugins.push(devBanner.devBanner());
    } catch (error) {
      console.log("Development plugins not available, continuing...");
    }
  }
  return {
    plugins,
    resolve: {
      alias: {
        "@": path2.resolve(import.meta.dirname, "client", "src"),
        "@shared": path2.resolve(import.meta.dirname, "shared"),
        "@assets": path2.resolve(import.meta.dirname, "attached_assets")
      }
    },
    root: path2.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path2.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true
    },
    server: {
      host: "0.0.0.0",
      port: 5e3,
      fs: {
        strict: true,
        deny: ["**/.*"]
      }
    }
  };
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  log("\u{1F504} Connecting to MongoDB Atlas...");
  await connectToDatabase();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
