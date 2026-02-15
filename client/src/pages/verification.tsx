import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { Hash, FileText, CheckCircle, XCircle, Home, Search, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "wouter";

// 1. Define the expected shape of your API response
interface VerificationResponse {
  verified: boolean;
  agreement: {
    agreementNumber: string;
    createdAt: string | Date;
    propertyAddress: string;
    monthlyRent: number | string;
  };
}

export default function Verification() {
  const [agreementId, setAgreementId] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // 2. Pass the interface to useQuery so TypeScript knows the structure of 'verificationResult'
  const { data: verificationResult, isLoading, error } = useQuery<VerificationResponse>({
    queryKey: ['/api/agreements/verify', agreementId],
    enabled: shouldFetch && !!agreementId,
  });

  const handleVerifyById = () => {
    if (agreementId.trim()) setShouldFetch(true);
  };

  const handleReset = () => {
    setAgreementId("");
    setShouldFetch(false);
    setPdfFile(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-950 selection:bg-primary selection:text-white">
      {/* Dynamic Background Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] z-0">
        <h1 className="text-[30vw] font-bold uppercase tracking-tighter leading-none rotate-12">
          {verificationResult?.verified ? "AUTHENTIC" : "VERIFY"}
        </h1>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
        {/* Editorial Header */}
        <header className="mb-20 border-b border-slate-200 pb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Protocol_04 // Authenticity_Check</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.85]">
            Trust <span className="text-slate-300 italic">Verification</span>
          </h1>
          <p className="mt-8 text-slate-500 font-light max-w-xl uppercase text-xs tracking-widest leading-relaxed">
            Validate the cryptographic integrity of your rental agreements. Input your unique ID or provide the original document for scanning.
          </p>
        </header>

        <main className="grid lg:grid-cols-12 gap-12">
          {!verificationResult && !error && (
            <>
              {/* Left Column: ID Input */}
              <div className="lg:col-span-5 space-y-12">
                <div className="p-10 bg-white border border-slate-200 hover:border-slate-950 transition-all">
                  <div className="flex items-center gap-3 mb-8">
                    <Hash className="h-4 w-4 text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Method_01: Unique_ID</span>
                  </div>
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-2">Registry Reference</label>
                      <Input
                        placeholder="SR-2024-XXXXXX"
                        value={agreementId}
                        onChange={(e) => setAgreementId(e.target.value)}
                        className="h-16 rounded-none border-0 border-b-2 border-slate-100 bg-transparent text-2xl font-bold tracking-tight focus-visible:ring-0 focus-visible:border-slate-950 transition-all px-0"
                      />
                    </div>
                    <Button 
                      onClick={handleVerifyById}
                      disabled={!agreementId.trim() || isLoading}
                      className="w-full h-16 rounded-none bg-slate-950 uppercase tracking-[0.3em] font-bold text-[10px]"
                    >
                      {isLoading ? 'Scanning Registry...' : 'Initiate Verification'}
                    </Button>
                  </div>
                </div>

                <Link href="/">
                  <Button variant="link" className="font-mono text-[10px] uppercase tracking-widest p-0 h-auto group text-slate-400 hover:text-slate-950">
                    <Home className="mr-2 h-3 w-3" /> [ Abort_And_Return_Home ]
                  </Button>
                </Link>
              </div>

              {/* Right Column: PDF Upload */}
              <div className="lg:col-span-7">
                <div className="p-10 bg-white border border-slate-200 border-dashed hover:border-solid hover:border-slate-950 transition-all h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-slate-400">Method_02: Document_Analysis</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center py-12">
                    <FileUpload
                      onFileSelect={setPdfFile}
                      accept=".pdf"
                      maxSize={10 * 1024 * 1024}
                      label="Drop Original PDF"
                      description="Document must contain the original embedded metadata"
                    />
                  </div>
                  <Button 
                    disabled={!pdfFile}
                    variant="outline"
                    className="w-full h-16 rounded-none border-slate-950 uppercase tracking-[0.3em] font-bold text-[10px] mt-8"
                  >
                    Analyze Metadata File
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Error State: Industrial Brutalism */}
          {error && (
            <div className="lg:col-span-12">
              <div className="bg-white border-2 border-red-600 p-12 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-red-600 mb-8">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-5xl font-bold uppercase tracking-tighter mb-4 text-red-600">Verification_Failed</h3>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-12">Registry mismatch: The requested ID does not exist or has been revoked.</p>
                <Button onClick={handleReset} variant="outline" className="h-16 px-12 rounded-none border-slate-950 font-bold uppercase tracking-[0.2em] text-[10px]">
                  Return to Input Mode
                </Button>
              </div>
            </div>
          )}

          {/* Success State: Clean Grid Layout */}
          {verificationResult?.verified && (
            <div className="lg:col-span-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid lg:grid-cols-2 bg-white border border-slate-950 overflow-hidden shadow-2xl">
                {/* Status Column */}
                <div className="bg-slate-950 text-white p-12 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-12">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold">Auth_Confirmed</span>
                    </div>
                    <h3 className="text-6xl font-bold uppercase tracking-tighter mb-6 leading-none">
                      Registry <br /><span className="text-primary italic">Matched</span>
                    </h3>
                  </div>
                  <div className="space-y-4 pt-12 border-t border-slate-800">
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Hash_Signature</p>
                    <p className="font-mono text-xs break-all text-slate-300">sha256:7f83b1627ff26b60c95034</p>
                  </div>
                </div>

                {/* Data Column */}
                <div className="p-12">
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block mb-2">Reference ID</label>
                        <p className="font-bold uppercase tracking-tighter text-xl">{verificationResult.agreement.agreementNumber}</p>
                      </div>
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block mb-2">Timestamp</label>
                        <p className="font-bold uppercase tracking-tighter text-xl">{new Date(verificationResult.agreement.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block mb-2">Asset Location</label>
                        <p className="font-bold uppercase tracking-tighter text-xl leading-tight">{verificationResult.agreement.propertyAddress}</p>
                      </div>
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block mb-2">Total Value</label>
                        <p className="font-bold uppercase tracking-tighter text-xl">${verificationResult.agreement.monthlyRent} /mo</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-12 border-t border-slate-100 flex justify-between items-center">
                    <Button onClick={handleReset} variant="link" className="p-0 font-mono text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-950">
                      [ New_Scan ]
                    </Button>
                    <Link href="/dashboard">
                      <Button className="h-14 px-10 rounded-none bg-slate-950 uppercase tracking-[0.2em] font-bold text-[10px]">
                        Access Registry <ArrowRight className="ml-3 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}