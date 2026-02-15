import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/file-upload";
import { OtpVerification } from "@/components/otp-verification";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, User, Building2, FileText, ShieldCheck, Check, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

// --- Validation Schemas ---
const step1Schema = z.object({
  tenantFullName: z.string().min(2, "Name too short"),
  tenantEmail: z.string().email("Invalid email"),
  tenantPhone: z.string().min(10, "Invalid phone"),
  tenantDob: z.string().min(1, "DOB required"),
  tenantAddress: z.string().min(10, "Address too short"),
});

const step2Schema = z.object({
  landlordFullName: z.string().min(2, "Name too short"),
  landlordEmail: z.string().email("Invalid email"),
  landlordPhone: z.string().min(10, "Invalid phone"),
  landlordAddress: z.string().min(10, "Address too short"),
});

const step3Schema = z.object({
  propertyAddress: z.string().min(10, "Property address too short"),
  monthlyRent: z.string().min(1, "Rent required"),
  securityDeposit: z.string().optional(),
  leaseDuration: z.string().min(1, "Duration required"),
  leaseStartDate: z.string().min(1, "Start date required"),
  leaseEndDate: z.string().min(1, "End date required"),
});

// Full schema for final submission
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type AgreementFormData = z.infer<typeof fullSchema>;

export default function AgreementForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [agreementId, setAgreementId] = useState<string>("");
  const [tenantIdProof, setTenantIdProof] = useState<File | null>(null);
  const [landlordIdProof, setLandlordIdProof] = useState<File | null>(null);
  const [tenantVerified, setTenantVerified] = useState(false);
  const [landlordVerified, setLandlordVerified] = useState(false);
  const { toast } = useToast();

  const form = useForm<AgreementFormData>({
    resolver: zodResolver(
      currentStep === 1 ? step1Schema : currentStep === 2 ? step2Schema : step3Schema
    ),
    mode: "onChange",
    defaultValues: {
      tenantFullName: "", tenantEmail: "", tenantPhone: "", tenantDob: "", tenantAddress: "",
      landlordFullName: "", landlordEmail: "", landlordPhone: "", landlordAddress: "",
      propertyAddress: "", monthlyRent: "", securityDeposit: "", leaseDuration: "",
      leaseStartDate: "", leaseEndDate: "",
    },
  });

  // Backend Mutation: POST to /api/agreements
  const createAgreementMutation = useMutation({
    mutationFn: async (data: AgreementFormData) => {
      const formData = new FormData();
      // Append all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      // Append files
      if (tenantIdProof) formData.append('tenantIdProof', tenantIdProof);
      if (landlordIdProof) formData.append('landlordIdProof', landlordIdProof);
      
      const response = await fetch('/api/agreements', {
        method: 'POST',
        body: formData, // Sending as FormData for file support
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'SERVER_REJECTED_REQUEST');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAgreementId(data.id);
      setCurrentStep(4);
      toast({ title: "DATABASE_SYNC_SUCCESS", description: "AGREEMENT ID: " + data.id });
    },
    onError: (error: any) => {
      toast({ title: "BACKEND_ERROR", description: error.message, variant: "destructive" });
    }
  });

  const onSubmit = (data: AgreementFormData) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!tenantIdProof || !landlordIdProof) {
        toast({ title: "UPLOAD_FAILURE", description: "BOTH ID PROOFS ARE MANDATORY", variant: "destructive" });
        return;
      }
      createAgreementMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E5E5] font-mono p-4 md:p-12 text-black">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Block */}
        <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0px_0px_#000]">
          <h1 className="text-5xl font-black uppercase tracking-tighter">Agreement_Deployer</h1>
          <p className="font-bold opacity-60 mt-2">// SYSTEM_STATUS: {createAgreementMutation.isPending ? 'UPLOADING...' : 'AWAITING_INPUT'}</p>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* STEP 1: TENANT */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black bg-yellow-300 inline-block px-2">01_TENANT_INTAKE</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="tenantFullName" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">FULL_NAME</FormLabel><Input className="border-2 border-black rounded-none focus:bg-blue-50" {...field} /></FormItem>
                      )} />
                      <FormField control={form.control} name="tenantEmail" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">EMAIL_ADDR</FormLabel><Input {...field} className="border-2 border-black rounded-none" /></FormItem>
                      )} />
                    </div>
                    <FileUpload onFileSelect={setTenantIdProof} label="ID_PROOF_UPLOAD" description="PDF/JPG ONLY" />
                  </div>
                )}

                {/* STEP 2: LANDLORD */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black bg-blue-300 inline-block px-2">02_LANDLORD_INTAKE</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="landlordFullName" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">OWNER_NAME</FormLabel><Input className="border-2 border-black rounded-none" {...field} /></FormItem>
                      )} />
                      <FormField control={form.control} name="landlordEmail" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">OWNER_EMAIL</FormLabel><Input {...field} className="border-2 border-black rounded-none" /></FormItem>
                      )} />
                    </div>
                    <FileUpload onFileSelect={setLandlordIdProof} label="OWNER_ID_UPLOAD" description="PDF/JPG ONLY" />
                  </div>
                )}

                {/* STEP 3: TERMS */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black bg-green-300 inline-block px-2">03_LEASE_TERMS</h2>
                    <FormField control={form.control} name="propertyAddress" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">PROPERTY_LOC</FormLabel><Textarea {...field} className="border-2 border-black rounded-none" /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="monthlyRent" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">RENT_AMT</FormLabel><Input type="number" {...field} className="border-2 border-black rounded-none" /></FormItem>
                      )} />
                      <FormField control={form.control} name="leaseDuration" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">DURATION (MONTHS)</FormLabel><Input {...field} className="border-2 border-black rounded-none" /></FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* STEP 4: VERIFY */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black bg-purple-300 inline-block px-2">04_IDENTITY_LOCK</h2>
                    <OtpVerification agreementId={agreementId} contactInfo={form.getValues('tenantEmail')} contactType="email" userType="tenant" onVerified={() => setTenantVerified(true)} />
                    <OtpVerification agreementId={agreementId} contactInfo={form.getValues('landlordEmail')} contactType="email" userType="landlord" onVerified={() => setLandlordVerified(true)} />
                  </div>
                )}

                {/* NAV BUTTONS */}
                {currentStep < 4 && (
                  <div className="flex gap-4 pt-6 border-t-4 border-black border-dashed">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1} className="rounded-none border-2 border-black font-bold uppercase shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all">
                      Back
                    </Button>
                    <Button type="submit" disabled={createAgreementMutation.isPending} className="flex-1 rounded-none border-2 border-black bg-black text-white hover:bg-yellow-400 hover:text-black font-black uppercase shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all">
                      {createAgreementMutation.isPending ? "CONNECTING..." : currentStep === 3 ? "GENERATE_AGREEMENT" : "NEXT_STEP"}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>

          {/* Progress Tracker Sidebar */}
          <div className="space-y-4">
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="bg-red-500 text-white p-4 border-4 border-black animate-pulse shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center gap-2 font-black"><AlertTriangle /> VALIDATION_ERR</div>
                <div className="text-[10px] mt-2">
                  {Object.keys(form.formState.errors).map(key => (
                    <div key={key}>{key.toUpperCase()}: REQUIRED</div>
                  ))}
                </div>
              </div>
            )}
            {/* ... Stepper dots ... */}
          </div>
        </div>
      </div>
    </div>
  );
}