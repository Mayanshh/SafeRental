import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/file-upload";
import { OtpVerification } from "@/components/otp-verification";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, FileText, UserCircle2, Landmark } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { cn } from "@/lib/utils";

// ... (Zod Schemas remain exactly the same as your original code)
const step1Schema = z.object({
  tenantFullName: z.string().min(2, "Full name is required"),
  tenantEmail: z.string().email("Valid email is required"),
  tenantPhone: z.string().min(10, "Valid phone number is required"),
  tenantDob: z.string().min(1, "Date of birth is required"),
  tenantAddress: z.string().min(10, "Current address is required"),
});

const step2Schema = z.object({
  landlordFullName: z.string().min(2, "Landlord full name is required"),
  landlordEmail: z.string().email("Valid landlord email is required"),
  landlordPhone: z.string().min(10, "Valid landlord phone is required"),
  landlordAddress: z.string().min(10, "Landlord address is required"),
});

const step3Schema = z.object({
  propertyAddress: z.string().min(10, "Property address is required"),
  monthlyRent: z.string().min(1, "Monthly rent is required"),
  securityDeposit: z.string().optional(),
  leaseDuration: z.string().min(1, "Lease duration is required"),
  leaseStartDate: z.string().min(1, "Start date is required"),
  leaseEndDate: z.string().min(1, "End date is required"),
});

const agreementFormSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type AgreementFormData = z.infer<typeof agreementFormSchema>;

export default function AgreementForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [agreementId, setAgreementId] = useState<string>("");
  const [tenantIdProof, setTenantIdProof] = useState<File | null>(null);
  const [landlordIdProof, setLandlordIdProof] = useState<File | null>(null);
  const [tenantVerified, setTenantVerified] = useState(false);
  const [landlordVerified, setLandlordVerified] = useState(false);
  const { toast } = useToast();

  const form = useForm<AgreementFormData>({
    resolver: zodResolver(currentStep === 1 ? step1Schema : currentStep === 2 ? step2Schema : step3Schema),
    mode: "onChange",
    defaultValues: {
      tenantFullName: "", tenantEmail: "", tenantPhone: "", tenantDob: "", tenantAddress: "",
      landlordFullName: "", landlordEmail: "", landlordPhone: "", landlordAddress: "",
      propertyAddress: "", monthlyRent: "", securityDeposit: "", leaseDuration: "", leaseStartDate: "", leaseEndDate: "",
    },
  });

  const steps = [
    { number: 1, title: "Tenant Details", desc: "Identity & Contact", icon: UserCircle2 },
    { number: 2, title: "Landlord Details", desc: "Owner Information", icon: Landmark },
    { number: 3, title: "Rental Terms", desc: "Lease & Payments", icon: FileText },
    { number: 4, title: "Verification", desc: "Digital Signing", icon: ShieldCheck },
  ];

  const createAgreementMutation = useMutation({
    mutationFn: async (data: AgreementFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value || ""));
      if (tenantIdProof) formData.append('tenantIdProof', tenantIdProof);
      if (landlordIdProof) formData.append('landlordIdProof', landlordIdProof);
      
      const response = await fetch('/api/agreements', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to create agreement');
      return response.json();
    },
    onSuccess: (data) => {
      setAgreementId(data.id);
      setCurrentStep(4);
    },
  });

  const onSubmit = async (data: AgreementFormData) => {
    if (currentStep < 3) {
      const isValid = await form.trigger();
      if (isValid) setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      if (!tenantIdProof || !landlordIdProof) {
        toast({ title: "Missing ID Proof", description: "Both parties must upload identification.", variant: "destructive" });
        return;
      }
      createAgreementMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* LEFT SIDEBAR - Progress & Branding */}
      <div className="w-full md:w-[380px] bg-zinc-950 md:min-h-screen p-8 md:p-12 flex flex-col justify-between sticky top-0 md:h-screen">
        <div>
          <div className="flex items-center space-x-2 text-white mb-16">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">S</div>
            <span className="text-xl font-bold tracking-tight uppercase">SafeRental</span>
          </div>

          <nav className="space-y-8">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number || (step.number === 4 && tenantVerified && landlordVerified);

              return (
                <div key={step.number} className={cn("flex items-start space-x-4 transition-opacity", !isActive && !isCompleted && "opacity-40")}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isActive ? "border-blue-500 text-blue-500" : isCompleted ? "border-green-500 bg-green-500 text-white" : "border-zinc-800 text-zinc-500"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={cn("font-medium text-sm uppercase tracking-widest", isActive ? "text-white" : "text-zinc-500")}>{step.title}</h4>
                    <p className="text-zinc-400 text-sm mt-1">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:block">
          <p className="text-zinc-500 text-xs">© 2026 SafeRental Inc. Secure & Encrypted</p>
        </div>
      </div>

      {/* RIGHT SIDE - Form Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-50/50">
        <div className="max-w-2xl mx-auto py-12 md:py-24 px-6 md:px-12">
          
          <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-lg text-zinc-500">
              {currentStep === 1 && "Start by identifying the primary tenant for this lease agreement."}
              {currentStep === 2 && "Enter the legal details of the property owner or representative."}
              {currentStep === 3 && "Define the financial and temporal boundaries of the rental."}
              {currentStep === 4 && "Finalize the agreement with multi-party identity verification."}
            </p>
          </header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              
              {/* Step 1: Tenant */}
              {currentStep === 1 && (
                <div className="grid gap-8">
                  <FormField control={form.control} name="tenantFullName" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs uppercase font-bold text-zinc-400">Full Legal Name</FormLabel>
                      <FormControl><Input className="h-12 bg-white border-zinc-200" placeholder="Johnathan Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="tenantEmail" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs uppercase font-bold text-zinc-400">Email Address</FormLabel>
                        <FormControl><Input className="h-12 bg-white border-zinc-200" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="tenantPhone" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs uppercase font-bold text-zinc-400">Phone</FormLabel>
                        <FormControl><Input className="h-12 bg-white border-zinc-200" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="tenantAddress" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs uppercase font-bold text-zinc-400">Current Residence</FormLabel>
                      <FormControl><Textarea className="bg-white border-zinc-200" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FileUpload onFileSelect={setTenantIdProof} label="ID Document" description="Passport or Driver's License" />
                </div>
              )}

              {/* Step 2: Landlord */}
              {currentStep === 2 && (
                <div className="grid gap-8">
                  <FormField control={form.control} name="landlordFullName" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs uppercase font-bold text-zinc-400">Landlord Name</FormLabel>
                      <FormControl><Input className="h-12 bg-white border-zinc-200" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="landlordEmail" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs uppercase font-bold text-zinc-400">Email</FormLabel>
                        <FormControl><Input className="h-12 bg-white border-zinc-200" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="landlordPhone" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs uppercase font-bold text-zinc-400">Phone</FormLabel>
                        <FormControl><Input className="h-12 bg-white border-zinc-200" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FileUpload onFileSelect={setLandlordIdProof} label="Proof of Ownership" description="Deed or Govt ID" />
                </div>
              )}

              {/* Step 3: Terms */}
              {currentStep === 3 && (
                <div className="grid gap-8">
                   <FormField control={form.control} name="propertyAddress" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs uppercase font-bold text-zinc-400">Rental Property Address</FormLabel>
                      <FormControl><Input className="h-12 bg-white border-zinc-200" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="monthlyRent" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs uppercase font-bold text-zinc-400">Monthly Rent (USD)</FormLabel>
                        <FormControl><Input type="number" className="h-12 bg-white border-zinc-200" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="leaseDuration" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs uppercase font-bold text-zinc-400">Term Length</FormLabel>
                        <FormControl><Input placeholder="e.g. 12 Months" className="h-12 bg-white border-zinc-200" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              {/* Step 4: Verification */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="grid gap-6">
                    {!tenantVerified && (
                      <OtpVerification agreementId={agreementId} contactInfo={form.getValues('tenantEmail')} contactType="email" userType="tenant" onVerified={() => setTenantVerified(true)} />
                    )}
                    {!landlordVerified && (
                      <OtpVerification agreementId={agreementId} contactInfo={form.getValues('landlordEmail')} contactType="email" userType="landlord" onVerified={() => setLandlordVerified(true)} />
                    )}
                  </div>
                  
                  {tenantVerified && landlordVerified && (
                    <div className="p-12 bg-zinc-900 rounded-2xl text-center text-white">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Protocol Complete</h2>
                      <p className="text-zinc-400 mb-8">Agreement generated and cryptographically signed.</p>
                      <Link href="/dashboard"><Button className="w-full h-12 bg-white text-black hover:bg-zinc-200">Go to Dashboard</Button></Link>
                    </div>
                  )}
                </div>
              )}

              {/* NAVIGATION */}
              {currentStep < 4 && (
                <div className="flex items-center justify-between pt-10 border-t border-zinc-200">
                  <Button type="button" variant="ghost" className="text-zinc-500" onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : null} disabled={currentStep === 1}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                    {currentStep === 3 ? "Finalize Agreement" : "Continue"} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}

            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}