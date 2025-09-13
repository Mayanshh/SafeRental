import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/file-upload";
import { OtpVerification } from "@/components/otp-verification";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, Home, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";

// Step-based validation schemas
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

// Full form schema for final submission
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
    mode: "onChange",
    defaultValues: {
      tenantFullName: "",
      tenantEmail: "",
      tenantPhone: "",
      tenantDob: "",
      tenantAddress: "",
      landlordFullName: "",
      landlordEmail: "",
      landlordPhone: "",
      landlordAddress: "",
      propertyAddress: "",
      monthlyRent: "",
      securityDeposit: "",
      leaseDuration: "",
      leaseStartDate: "",
      leaseEndDate: "",
    },
  });

  const createAgreementMutation = useMutation({
    mutationFn: async (data: AgreementFormData) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value || "");
      });
      
      // Add files
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
      toast({
        title: "Agreement Created!",
        description: "Proceed with verification to complete the process.",
      });
    },
    onError: (error: any) => {
      console.error('Agreement creation error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create agreement. Please try again.",
        variant: "destructive",
      });
    }
  });

  const steps = [
    { number: 1, title: "Tenant Details", completed: currentStep > 1 },
    { number: 2, title: "Landlord Details", completed: currentStep > 2 },
    { number: 3, title: "Rental Terms", completed: currentStep > 3 },
    { number: 4, title: "Verification", completed: tenantVerified && landlordVerified },
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const validateCurrentStep = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await form.trigger(['tenantFullName', 'tenantEmail', 'tenantPhone', 'tenantDob', 'tenantAddress']);
    } else if (currentStep === 2) {
      isValid = await form.trigger(['landlordFullName', 'landlordEmail', 'landlordPhone', 'landlordAddress']);
    } else if (currentStep === 3) {
      isValid = await form.trigger(['propertyAddress', 'monthlyRent', 'leaseDuration', 'leaseStartDate', 'leaseEndDate']);
    }
    
    return isValid;
  };

  const onSubmit = async (data: AgreementFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Current step:', currentStep);
    
    if (currentStep < 3) {
      const isStepValid = await validateCurrentStep();
      if (isStepValid) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Step validation failed');
      }
    } else if (currentStep === 3) {
      // Validate that both ID proofs are uploaded
      if (!tenantIdProof) {
        toast({
          title: "Missing Document",
          description: "Please upload tenant ID proof before submitting.",
          variant: "destructive",
        });
        return;
      }
      
      if (!landlordIdProof) {
        toast({
          title: "Missing Document", 
          description: "Please upload landlord ID proof before submitting.",
          variant: "destructive",
        });
        return;
      }
      
      createAgreementMutation.mutate(data);
    }
  };

  const handleTenantVerified = () => {
    setTenantVerified(true);
    toast({
      title: "Tenant Verified!",
      description: "Tenant verification completed successfully.",
    });
  };

  const handleLandlordVerified = () => {
    setLandlordVerified(true);
    toast({
      title: "Landlord Verified!",
      description: "Agreement is now complete and will be sent via email.",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg" data-testid="agreement-form-card">
          <CardHeader>
            <CardTitle className="text-3xl">Create Rental Agreement</CardTitle>
            <p className="text-muted-foreground">Fill out the details below to generate a secure rental agreement</p>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <Progress value={progress} className="mb-4" data-testid="form-progress" />
              <div className="flex items-center justify-between">
                {steps.map((step) => (
                  <div 
                    key={step.number} 
                    className="flex items-center"
                    data-testid={`step-${step.number}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.completed 
                        ? 'bg-secondary text-white' 
                        : currentStep === step.number 
                          ? 'bg-primary text-white' 
                          : 'border-2 border-border text-muted-foreground'
                    }`}>
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
                    </div>
                    <span className="ml-2 text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Tenant Details */}
                {currentStep === 1 && (
                  <div className="space-y-6" data-testid="step-tenant-details">
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="default">Step 1</Badge>
                      <h3 className="text-xl font-semibold">Tenant Information</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="tenantFullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} data-testid="input-tenant-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tenantEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} data-testid="input-tenant-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tenantPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-tenant-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tenantDob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-tenant-dob" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="tenantAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Address</FormLabel>
                          <FormControl>
                            <Textarea rows={3} placeholder="Enter your current address" {...field} data-testid="input-tenant-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FileUpload
                        onFileSelect={setTenantIdProof}
                        label="Tenant ID Proof Upload *"
                        description="Upload your identification document (Required)"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      {!tenantIdProof && (
                        <p className="text-sm text-destructive" data-testid="tenant-file-required">
                          * Tenant ID proof is required
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Landlord Details */}
                {currentStep === 2 && (
                  <div className="space-y-6" data-testid="step-landlord-details">
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="default">Step 2</Badge>
                      <h3 className="text-xl font-semibold">Landlord Information</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="landlordFullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landlord Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter landlord's full name" {...field} data-testid="input-landlord-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="landlordEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landlord Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="landlord@example.com" {...field} data-testid="input-landlord-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="landlordPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landlord Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 987-6543" {...field} data-testid="input-landlord-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="landlordAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Landlord Address</FormLabel>
                          <FormControl>
                            <Textarea rows={3} placeholder="Enter landlord's address" {...field} data-testid="input-landlord-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FileUpload
                        onFileSelect={setLandlordIdProof}
                        label="Landlord ID Proof Upload *"
                        description="Upload landlord's identification document (Required)"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      {!landlordIdProof && (
                        <p className="text-sm text-destructive" data-testid="landlord-file-required">
                          * Landlord ID proof is required
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Rental Terms */}
                {currentStep === 3 && (
                  <div className="space-y-6" data-testid="step-rental-terms">
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="default">Step 3</Badge>
                      <h3 className="text-xl font-semibold">Rental Terms</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="propertyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Address</FormLabel>
                          <FormControl>
                            <Textarea rows={3} placeholder="Enter the rental property address" {...field} data-testid="input-property-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="monthlyRent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Rent ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2500" {...field} data-testid="input-monthly-rent" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="securityDeposit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Deposit ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2500 (optional)" {...field} data-testid="input-security-deposit" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="leaseDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lease Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="12 months" {...field} data-testid="input-lease-duration" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="leaseStartDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lease Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-lease-start" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="leaseEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lease End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-lease-end" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Verification */}
                {currentStep === 4 && agreementId && (
                  <div className="space-y-6" data-testid="step-verification">
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="default">Step 4</Badge>
                      <h3 className="text-xl font-semibold">Identity Verification</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {!tenantVerified && (
                        <OtpVerification
                          agreementId={agreementId}
                          contactInfo={form.getValues('tenantEmail')}
                          contactType="email"
                          userType="tenant"
                          onVerified={handleTenantVerified}
                        />
                      )}
                      
                      {!landlordVerified && (
                        <OtpVerification
                          agreementId={agreementId}
                          contactInfo={form.getValues('landlordEmail')}
                          contactType="email"
                          userType="landlord"
                          onVerified={handleLandlordVerified}
                        />
                      )}
                    </div>
                    
                    {tenantVerified && landlordVerified && (
                      <Card className="border-secondary bg-secondary/5" data-testid="completion-card">
                        <CardContent className="pt-6 text-center">
                          <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-secondary mb-2">
                            Agreement Complete! ✅
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            The rental agreement has been generated and sent to both parties via email.
                          </p>
                          <Link href="/dashboard">
                            <Button data-testid="button-view-dashboard">
                              View Dashboard
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < 4 && (
                  <div className="flex justify-between pt-6">
                    <div>
                      {currentStep > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(currentStep - 1)}
                          data-testid="button-previous"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                      ) : (
                        <Link href="/">
                          <Button variant="outline" data-testid="button-home">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                          </Button>
                        </Link>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={createAgreementMutation.isPending}
                      data-testid="button-next"
                    >
                      {currentStep === 3 ? 'Create Agreement' : 'Continue'}
                      <ArrowRight className="ml-2 h-4 w-4" />
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
