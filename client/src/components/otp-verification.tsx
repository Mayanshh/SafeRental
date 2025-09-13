import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone } from "lucide-react";

interface OtpVerificationProps {
  agreementId: string;
  contactInfo: string;
  contactType: 'email' | 'phone';
  userType: 'tenant' | 'landlord';
  onVerified: () => void;
}

export function OtpVerification({
  agreementId,
  contactInfo,
  contactType,
  userType,
  onVerified
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState<string>("");
  const { toast } = useToast();

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/otp/send', {
        agreementId,
        contactInfo,
        contactType,
        userType
      });
      return response.json();
    },
    onSuccess: (data) => {
      setOtpId(data.otpId);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to your ${contactType}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/otp/verify', {
        otpId,
        otpCode: otp
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verified!",
        description: `${userType} verification successful`,
      });
      onVerified();
    },
    onError: () => {
      toast({
        title: "Invalid OTP",
        description: "Please check your code and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendOtp = () => {
    sendOtpMutation.mutate();
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      verifyOtpMutation.mutate();
    }
  };

  return (
    <Card data-testid="otp-verification-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {contactType === 'email' ? <Mail className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          <span>Verify {contactType === 'email' ? 'Email' : 'Phone'}</span>
          <Badge variant="secondary" data-testid="user-type-badge">
            {userType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            We'll send a verification code to:
          </p>
          <p className="font-medium" data-testid="contact-info">{contactInfo}</p>
        </div>

        {!otpId ? (
          <Button 
            onClick={handleSendOtp} 
            disabled={sendOtpMutation.isPending}
            className="w-full"
            data-testid="button-send-otp"
          >
            {sendOtpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Verification Code
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter verification code
              </label>
              <InputOTP 
                value={otp} 
                onChange={setOtp} 
                maxLength={6}
                data-testid="otp-input"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || verifyOtpMutation.isPending}
                className="flex-1"
                data-testid="button-verify-otp"
              >
                {verifyOtpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
              <Button
                variant="outline"
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                data-testid="button-resend-otp"
              >
                Resend
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
