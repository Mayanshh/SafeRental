// Test script to verify FormData parsing
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function testAgreementSubmission() {
  const formData = new FormData();
  
  // Add text fields
  formData.append('tenantFullName', 'John Doe');
  formData.append('tenantEmail', 'john@example.com');
  formData.append('tenantPhone', '5551234567');
  formData.append('tenantDob', '1990-01-15');
  formData.append('tenantAddress', '123 Main St');
  
  formData.append('landlordFullName', 'Jane Smith');
  formData.append('landlordEmail', 'jane@example.com');
  formData.append('landlordPhone', '5559876543');
  formData.append('landlordAddress', '456 Oak Ave');
  
  formData.append('propertyAddress', '789 Rental St');
  formData.append('monthlyRent', '1500');
  formData.append('securityDeposit', '3000');
  formData.append('leaseDuration', '12 months');
  formData.append('leaseStartDate', '2026-05-01');
  formData.append('leaseEndDate', '2027-04-30');
  
  // Create dummy files for testing
  const dummyFile = Buffer.from('fake pdf content');
  formData.append('tenantIdProof', dummyFile, 'tenant_id.pdf');
  formData.append('landlordIdProof', dummyFile, 'landlord_id.pdf');
  
  try {
    const response = await fetch('http://localhost:5000/api/agreements', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAgreementSubmission();
