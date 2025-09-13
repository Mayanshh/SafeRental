import { type User, type InsertUser, type Agreement, type InsertAgreement, type OtpVerification, type InsertOtpVerification, type Counter } from "@shared/schema";
import { getDatabase } from "./database";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agreement methods
  createAgreement(agreement: InsertAgreement): Promise<Agreement>;
  getAgreement(id: string): Promise<Agreement | undefined>;
  getAgreementByNumber(agreementNumber: string): Promise<Agreement | undefined>;
  updateAgreement(id: string, updates: Partial<Agreement>): Promise<Agreement | undefined>;
  getAgreementsByUser(email: string): Promise<Agreement[]>;
  
  // OTP methods
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  getOtpVerification(id: string): Promise<OtpVerification | undefined>;
  verifyOtp(id: string): Promise<boolean>;
  getValidOtp(agreementId: string, contactInfo: string, userType: string): Promise<OtpVerification | undefined>;
}

export class MongoStorage implements IStorage {
  private async getDb() {
    return await getDatabase();
  }

  // Generate atomic agreement number using MongoDB counters
  private async generateAgreementNumber(): Promise<string> {
    const db = await this.getDb();
    const currentYear = new Date().getFullYear().toString();
    
    const result = await db.collection<Counter>('counters').findOneAndUpdate(
      { _id: currentYear },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    
    const seq = result?.seq || 1;
    return `SR-${currentYear}-${String(seq).padStart(6, '0')}`;
  }

  async getUser(id: string): Promise<User | undefined> {
    const db = await this.getDb();
    const result = await db.collection('users').findOne({ id });
    return result ? this.mongoToUser(result) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getDb();
    const result = await db.collection('users').findOne({ username });
    return result ? this.mongoToUser(result) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('users').insertOne({ ...user, _id: new ObjectId() });
    return user;
  }

  async createAgreement(insertAgreement: InsertAgreement): Promise<Agreement> {
    const db = await this.getDb();
    const id = randomUUID();
    const agreementNumber = await this.generateAgreementNumber();
    
    const agreement: Agreement = {
      ...insertAgreement,
      id,
      agreementNumber,
      tenantVerified: false,
      landlordVerified: false,
      isActive: true,
      pdfUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('agreements').insertOne({ ...agreement, _id: new ObjectId() });
    return agreement;
  }

  async getAgreement(id: string): Promise<Agreement | undefined> {
    const db = await this.getDb();
    const result = await db.collection('agreements').findOne({ id });
    return result ? this.mongoToAgreement(result) : undefined;
  }

  async getAgreementByNumber(agreementNumber: string): Promise<Agreement | undefined> {
    const db = await this.getDb();
    const result = await db.collection('agreements').findOne({ agreementNumber });
    return result ? this.mongoToAgreement(result) : undefined;
  }

  async updateAgreement(id: string, updates: Partial<Agreement>): Promise<Agreement | undefined> {
    const db = await this.getDb();
    const result = await db.collection('agreements').findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    return result ? this.mongoToAgreement(result) : undefined;
  }

  async getAgreementsByUser(email: string): Promise<Agreement[]> {
    const db = await this.getDb();
    const results = await db.collection('agreements')
      .find({
        $or: [
          { tenantEmail: email },
          { landlordEmail: email }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return results.map(r => this.mongoToAgreement(r));
  }

  async createOtpVerification(insertOtp: InsertOtpVerification): Promise<OtpVerification> {
    const db = await this.getDb();
    const id = randomUUID();
    
    const otp: OtpVerification = {
      ...insertOtp,
      id,
      verified: false,
      createdAt: new Date(),
    };
    
    await db.collection('otpVerifications').insertOne({ ...otp, _id: new ObjectId() });
    return otp;
  }

  async getOtpVerification(id: string): Promise<OtpVerification | undefined> {
    const db = await this.getDb();
    const result = await db.collection('otpVerifications').findOne({ id });
    return result ? this.mongoToOtp(result) : undefined;
  }

  async verifyOtp(id: string): Promise<boolean> {
    const db = await this.getDb();
    const otp = await this.getOtpVerification(id);
    if (!otp || otp.expiresAt < new Date()) return false;
    
    await db.collection('otpVerifications').updateOne(
      { id },
      { $set: { verified: true } }
    );
    
    return true;
  }

  async getValidOtp(agreementId: string, contactInfo: string, userType: string): Promise<OtpVerification | undefined> {
    const db = await this.getDb();
    const result = await db.collection('otpVerifications').findOne({
      agreementId,
      contactInfo,
      userType,
      verified: false,
      expiresAt: { $gt: new Date() }
    });
    
    return result ? this.mongoToOtp(result) : undefined;
  }

  // Helper methods to convert MongoDB documents to typed objects
  private mongoToUser(doc: any): User {
    return {
      id: doc.id,
      username: doc.username,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private mongoToAgreement(doc: any): Agreement {
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
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      pdfUrl: doc.pdfUrl || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private mongoToOtp(doc: any): OtpVerification {
    return {
      id: doc.id,
      agreementId: doc.agreementId,
      contactInfo: doc.contactInfo,
      contactType: doc.contactType,
      userType: doc.userType,
      otpCode: doc.otpCode,
      verified: doc.verified || false,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }
}

export const storage = new MongoStorage();
