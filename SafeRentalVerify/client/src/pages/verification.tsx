import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/file-upload";
import { Hash, FileText, CheckCircle, XCircle, Home, Search } from "lucide-react";
import { Link } from "wouter";

export default function Verification() {
  const [agreementId, setAgreementId] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const { data: verificationResult, isLoading, error } = useQuery({
    queryKey: ['/api/agreements/verify', agreementId],
    enabled: shouldFetch && !!agreementId,
  });

  const handleVerifyById = () => {
    if (agreementId.trim()) {
      setShouldFetch(true);
    }
  };

  const handleVerifyByPdf = () => {
    // TODO: Implement PDF verification logic
    console.log('PDF verification not yet implemented', pdfFile);
  };

  const handleReset = () => {
    setAgreementId("");
    setShouldFetch(false);
    setPdfFile(null);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg" data-testid="verification-card">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Verify Rental Agreement</CardTitle>
            <p className="text-muted-foreground">
              Enter agreement ID or upload PDF to verify authenticity
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {!verificationResult && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Method 1: Agreement ID */}
                <Card className="border border-border" data-testid="verify-by-id-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Hash className="h-5 w-5 text-primary" />
                      <span>Verify by Agreement ID</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Agreement ID</label>
                      <Input
                        placeholder="SR-2024-001234"
                        value={agreementId}
                        onChange={(e) => setAgreementId(e.target.value)}
                        data-testid="input-agreement-id"
                      />
                    </div>
                    <Button 
                      onClick={handleVerifyById}
                      disabled={!agreementId.trim() || isLoading}
                      className="w-full"
                      data-testid="button-verify-by-id"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {isLoading ? 'Verifying...' : 'Verify Agreement'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Method 2: PDF Upload */}
                <Card className="border border-border" data-testid="verify-by-pdf-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-destructive" />
                      <span>Verify by PDF Upload</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FileUpload
                      onFileSelect={setPdfFile}
                      accept=".pdf"
                      maxSize={10 * 1024 * 1024} // 10MB
                      label=""
                      description="Upload agreement PDF"
                    />
                    <Button 
                      onClick={handleVerifyByPdf}
                      disabled={!pdfFile}
                      className="w-full"
                      variant="secondary"
                      data-testid="button-verify-by-pdf"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive bg-destructive/5" data-testid="verification-error">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
                      <XCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-destructive mb-2">
                      Agreement Not Found ❌
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      The agreement ID you entered could not be found or is not verified.
                    </p>
                    <Button onClick={handleReset} variant="outline" data-testid="button-try-again">
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success State */}
            {verificationResult?.verified && (
              <Card className="border-secondary bg-secondary/5" data-testid="verification-success">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-secondary mb-2">
                      Agreement Verified ✅
                    </h3>
                    <p className="text-muted-foreground">
                      This rental agreement is authentic and verified.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Agreement ID:</span>
                        <span className="text-muted-foreground" data-testid="result-agreement-id">
                          {verificationResult.agreement.agreementNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Created Date:</span>
                        <span className="text-muted-foreground" data-testid="result-created-date">
                          {new Date(verificationResult.agreement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Tenant:</span>
                        <span className="text-muted-foreground" data-testid="result-tenant-name">
                          {verificationResult.agreement.tenantName}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Landlord:</span>
                        <span className="text-muted-foreground" data-testid="result-landlord-name">
                          {verificationResult.agreement.landlordName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Property:</span>
                        <span className="text-muted-foreground" data-testid="result-property-address">
                          {verificationResult.agreement.propertyAddress}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Monthly Rent:</span>
                        <span className="text-muted-foreground" data-testid="result-rent-amount">
                          ${verificationResult.agreement.monthlyRent}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button onClick={handleReset} variant="outline" data-testid="button-verify-another">
                      Verify Another Agreement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Back to Home */}
            <div className="flex justify-center">
              <Link href="/">
                <Button variant="outline" data-testid="button-back-home">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
