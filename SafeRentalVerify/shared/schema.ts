import { z } from "zod";

// MongoDB-compatible Zod schemas for production

// User schema (simplified for MongoDB)
export const userSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  id: z.string(), // Keep for compatibility
  username: z.string().min(1),
  // Removed password - using Firebase Auth exclusively
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Agreement schema for MongoDB
export const agreementSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  id: z.string(), // Keep for compatibility
  agreementNumber: z.string(),
  
  // Tenant details
  tenantFullName: z.string().min(1),
  tenantEmail: z.string().email(),
  tenantPhone: z.string().min(1),
  tenantDob: z.string(), // ISO date string
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
  monthlyRent: z.string(), // Keep as string for form compatibility
  securityDeposit: z.string().optional(),
  leaseDuration: z.string().min(1),
  leaseStartDate: z.string(), // ISO date string
  leaseEndDate: z.string(), // ISO date string
  
  // Verification status
  tenantVerified: z.boolean().default(false),
  landlordVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  
  // Generated PDF
  pdfUrl: z.string().nullable().optional(),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// OTP Verification schema
export const otpVerificationSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  id: z.string(), // Keep for compatibility
  agreementId: z.string(),
  contactInfo: z.string(), // email or phone
  contactType: z.enum(['email', 'phone']),
  userType: z.enum(['tenant', 'landlord']),
  otpCode: z.string(),
  verified: z.boolean().default(false),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
});

// Counter schema for atomic agreement number generation
export const counterSchema = z.object({
  _id: z.string(), // year (e.g., "2025")
  seq: z.number().default(0),
});

// Insert schemas for MongoDB
export const insertUserSchema = userSchema.omit({
  _id: true,
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgreementSchema = agreementSchema.omit({
  _id: true,
  id: true,
  agreementNumber: true,
  tenantVerified: true,
  landlordVerified: true,
  isActive: true,
  pdfUrl: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOtpVerificationSchema = otpVerificationSchema.omit({
  _id: true,
  id: true,
  verified: true,
  createdAt: true,
});

// Type exports for MongoDB
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Agreement = z.infer<typeof agreementSchema>;
export type InsertAgreement = z.infer<typeof insertAgreementSchema>;
export type OtpVerification = z.infer<typeof otpVerificationSchema>;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type Counter = z.infer<typeof counterSchema>;
