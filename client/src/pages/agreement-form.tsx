import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/file-upload";
import { OtpVerification } from "@/components/otp-verification";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Home, CheckCircle, User, Building2, FileText, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { cn } from "@/lib/utils";

// --- Validation Schemas (Unchanged) ---
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

  const createAgreementMutation = useMutation({
    mutationFn: async (data: AgreementFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value || ""));
      if (tenantIdProof) formData.append('tenantIdProof', tenantIdProof);
      if (landlordIdProof) formData.append('landlordIdProof', landlordIdProof);
      
      const response = await fetch('/api/agreements', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create agreement');
      return response.json();
    },
    onSuccess: (data) => {
      setAgreementId(data.id);
      setCurrentStep(4);
      toast({ title: "Success!", description: "Agreement created. Please verify identities." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message, variant: "destructive" });
    }
  });

  const steps = [
    { number: 1, title: "Tenant", icon: User },
    { number: 2, title: "Landlord", icon: Building2 },
    { number: 3, title: "Terms", icon: FileText },
    { number: 4, title: "Verify", icon: ShieldCheck },
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const validateCurrentStep = async () => {
    const fields: any = {
      1: ['tenantFullName', 'tenantEmail', 'tenantPhone', 'tenantDob', 'tenantAddress'],
      2: ['landlordFullName', 'landlordEmail', 'landlordPhone', 'landlordAddress'],
      3: ['propertyAddress', 'monthlyRent', 'leaseDuration', 'leaseStartDate', 'leaseEndDate']
    };
    return await form.trigger(fields[currentStep]);
  };

  const onSubmit = async (data: AgreementFormData) => {
    if (currentStep < 3) {
      const isStepValid = await validateCurrentStep();
      if (isStepValid) setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      if (!tenantIdProof || !landlordIdProof) {
        toast({
          title: "Documents Required",
          description: "Please upload ID proofs for both parties.",
          variant: "destructive",
        });
        return;
      }
      createAgreementMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Rental Agreement
          </h1>
          <p className="text-slate-500 text-lg">
            Complete the 4-step process to generate your legal document.
          </p>
        </div>

        {/* Modern Stepper */}
        <div className="relative mb-12">
          <div className="absolute top-5 w-full h-0.5 bg-slate-200" />
          <div 
            className="absolute top-5 h-0.5 bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }} 
          />
          
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number || (step.number === 4 && tenantVerified && landlordVerified);
              const isActive = currentStep === step.number;

              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors duration-300 border-2",
                    isCompleted ? "bg-primary border-primary text-white" : 
                    isActive ? "bg-background border-primary text-primary shadow-md" : 
                    "bg-background border-slate-200 text-slate-400"
                  )}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "mt-2 text-xs font-bold uppercase tracking-wider",
                    isActive ? "text-primary" : "text-slate-500"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* STEP 1: TENANT */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="border-b pb-4">
                      <h3 className="text-xl font-bold text-slate-800">Tenant Information</h3>
                      <p className="text-sm text-slate-500">Legal details of the person moving in.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="tenantFullName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="tenantEmail" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="tenantPhone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="tenantDob" render={({ field }) => (
                        <FormItem><FormLabel>DOB</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="tenantAddress" render={({ field }) => (
                      <FormItem><FormLabel>Current Residence</FormLabel><FormControl><Textarea placeholder="Full address..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                      <FileUpload onFileSelect={setTenantIdProof} label="Identity Proof (Passport/ID)" description="Required for legal verification" accept=".jpg,.png,.pdf" />
                      {!tenantIdProof && <p className="text-[10px] text-destructive mt-2 font-bold uppercase tracking-tighter">* Upload Required</p>}
                    </div>
                  </div>
                )}

                {/* STEP 2: LANDLORD */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="border-b pb-4">
                      <h3 className="text-xl font-bold text-slate-800">Landlord Information</h3>
                      <p className="text-sm text-slate-500">Legal details of the property owner.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="landlordFullName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="landlordEmail" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="landlordPhone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="landlordAddress" render={({ field }) => (
                      <FormItem><FormLabel>Official Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                      <FileUpload onFileSelect={setLandlordIdProof} label="Landlord ID Proof" description="Required for document validity" accept=".jpg,.png,.pdf" />
                    </div>
                  </div>
                )}

                {/* STEP 3: TERMS */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="border-b pb-4">
                      <h3 className="text-xl font-bold text-slate-800">Rental Terms</h3>
                      <p className="text-sm text-slate-500">Specify the lease conditions and property details.</p>
                    </div>
                    <FormField control={form.control} name="propertyAddress" render={({ field }) => (
                      <FormItem><FormLabel>Rental Property Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="monthlyRent" render={({ field }) => (
                        <FormItem><FormLabel>Monthly Rent ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="securityDeposit" render={({ field }) => (
                        <FormItem><FormLabel>Security Deposit ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="leaseStartDate" render={({ field }) => (
                        <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="leaseEndDate" render={({ field }) => (
                        <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* STEP 4: VERIFICATION */}
                {currentStep === 4 && (
                  <div className="space-y-8 py-4 animate-in zoom-in-95 duration-500">
                    <div className="text-center space-y-2">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-4 py-1">Identity Check</Badge>
                      <h3 className="text-2xl font-bold text-slate-800">Final Verification</h3>
                      <p className="text-slate-500">Security codes have been sent to the provided emails.</p>
                    </div>

                    <div className="grid gap-6">
                      <div className={cn("transition-opacity", tenantVerified && "opacity-50 pointer-events-none")}>
                        <OtpVerification agreementId={agreementId} contactInfo={form.getValues('tenantEmail')} contactType="email" userType="tenant" onVerified={() => { setTenantVerified(true); toast({ title: "Tenant Verified" }); }} />
                      </div>
                      <div className={cn("transition-opacity", landlordVerified && "opacity-50 pointer-events-none")}>
                        <OtpVerification agreementId={agreementId} contactInfo={form.getValues('landlordEmail')} contactType="email" userType="landlord" onVerified={() => { setLandlordVerified(true); toast({ title: "Landlord Verified" }); }} />
                      </div>
                    </div>

                    {tenantVerified && landlordVerified && (
                      <div className="mt-8 p-8 text-center bg-emerald-50 rounded-2xl border-2 border-emerald-100 animate-in bounce-in duration-700">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                          <CheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-900 mb-2">Process Complete!</h2>
                        <p className="text-emerald-700 mb-6">The agreement has been digitally signed and sent to both parties.</p>
                        <Link href="/dashboard">
                          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10">
                            Go to Dashboard
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* NAV BUTTONS */}
                {currentStep < 4 && (
                  <div className="flex justify-between items-center pt-8 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : window.location.href = '/'}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      {currentStep > 1 ? <><ArrowLeft className="mr-2 h-4 w-4" /> Back</> : 'Cancel'}
                    </Button>
                    
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={createAgreementMutation.isPending}
                      className="px-8 shadow-lg shadow-primary/25"
                    >
                      {currentStep === 3 ? (
                        createAgreementMutation.isPending ? "Generating..." : "Generate Agreement"
                      ) : (
                        <>Next Step <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}