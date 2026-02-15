import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, Terminal, Cpu, ArrowRight, RefreshCw, AlertOctagon } from "lucide-react";

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
        title: "SYSTEM_MSG: SENT",
        description: `CODE DISPATCHED TO > ${contactType.toUpperCase()}`,
      });
    },
    onError: () => {
      toast({
        title: "ERR_CONNECTION",
        description: "FAILED TO DISPATCH. RETRY SEQUENCE.",
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
        title: "ACCESS_GRANTED",
        description: `${userType.toUpperCase()} VERIFIED SUCCESSFULLY`,
      });
      onVerified();
    },
    onError: () => {
      toast({
        title: "ERR_INVALID_CODE",
        description: "INPUT DOES NOT MATCH CHECKSUM.",
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
    <div className="w-full max-w-md mx-auto font-mono text-black" data-testid="otp-verification-card">
      
      {/* Brutalist Header Panel */}
      <div className="bg-black text-white p-3 flex justify-between items-center border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          <span className="font-bold tracking-widest text-sm">SECURE_GATEWAY_V1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold">LIVE</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="border-x-4 border-b-4 border-black bg-white relative overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
        />

        <div className="p-6 relative z-10">
          
          {/* Identity Block */}
          <div className="mb-8 border-2 border-black p-1 bg-[#f0f0f0]">
            <div className="flex border-b-2 border-black mb-1 bg-white">
              <div className="p-2 border-r-2 border-black w-12 flex justify-center items-center bg-yellow-400">
                {contactType === 'email' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </div>
              <div className="p-2 flex-1 flex flex-col justify-center">
                <span className="text-[10px] uppercase text-gray-500 font-bold leading-none">TARGET_ID</span>
                <span className="font-bold text-sm truncate" data-testid="contact-info">{contactInfo}</span>
              </div>
            </div>
            <div className="flex justify-between items-center px-2 py-1">
               <span className="text-[10px] font-bold">ROLE ASSIGNMENT:</span>
               <span className="text-xs font-black bg-black text-white px-2 py-0.5" data-testid="user-type-badge">
                 {userType.toUpperCase()}
               </span>
            </div>
          </div>

          {/* Logic Switch: Send vs Verify */}
          {!otpId ? (
            <div className="space-y-4">
              <div className="text-xs uppercase font-bold text-center border-y border-black py-2 my-4 bg-gray-50">
                // Awaiting Initialization
              </div>
              
              <button
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                className="w-full group relative h-14 bg-black text-white font-bold text-lg uppercase tracking-wider
                         border-2 border-transparent hover:bg-white hover:text-black hover:border-black
                         transition-all duration-150 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none"
                data-testid="button-send-otp"
              >
                <div className="flex items-center justify-center gap-3">
                  {sendOtpMutation.isPending ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <span>Initiate Sequence</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
               {/* OTP Input Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold uppercase flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Input Access Code
                  </label>
                  <span className="text-[10px] font-mono text-gray-500">FORMAT: 6-DIGIT</span>
                </div>

                <div className="flex justify-center py-4 bg-gray-50 border-2 border-black border-dashed">
                  <InputOTP 
                    value={otp} 
                    onChange={setOtp} 
                    maxLength={6}
                    data-testid="otp-input"
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot 
                          key={index}
                          index={index} 
                          className="h-12 w-10 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_#000] focus:translate-y-[2px] focus:shadow-none transition-all bg-white text-lg font-black"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || verifyOtpMutation.isPending}
                  className="col-span-3 bg-[#00ff94] border-2 border-black text-black font-black uppercase text-sm h-12
                           shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  data-testid="button-verify-otp"
                >
                   {verifyOtpMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "AUTHENTICATE"}
                </button>

                <button
                  onClick={handleSendOtp}
                  disabled={sendOtpMutation.isPending}
                  className="col-span-1 bg-white border-2 border-black text-black h-12 flex items-center justify-center
                           shadow-[4px_4px_0px_0px_#000] hover:bg-red-50 hover:text-red-600 transition-all active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]"
                  data-testid="button-resend-otp"
                  title="Resend Code"
                >
                  <RefreshCw className={`w-5 h-5 ${sendOtpMutation.isPending ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Status Bar */}
        <div className="bg-[#f0f0f0] border-t-2 border-black p-2 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
          <span>SEC_LEVEL: HIGH</span>
          <span className="flex items-center gap-1">
             {verifyOtpMutation.isError && <AlertOctagon className="w-3 h-3 text-red-600" />}
             STATUS: {verifyOtpMutation.isError ? "ERR_Last_Attempt" : "READY"}
          </span>
        </div>
      </div>
    </div>
  );
}