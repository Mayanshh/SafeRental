import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Download, CheckCircle, User, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Secure Rental Agreements
              <span className="block text-secondary">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Generate legally compliant rental agreements with built-in verification. 
              Protect both tenants and landlords with our trusted platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agreement-form">
                <Button 
                  size="lg"
                  className="bg-white text-primary px-8 py-4 text-lg hover:bg-gray-50 shadow-lg"
                  data-testid="button-create-agreement"
                >
                  <User className="mr-2 h-5 w-5" />
                  Create Agreement (Tenant)
                </Button>
              </Link>
              <Link href="/verification">
                <Button 
                  size="lg"
                  variant="secondary"
                  className="px-8 py-4 text-lg shadow-lg"
                  data-testid="button-verify-agreement"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verify Agreement (Landlord)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SafeRental?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform ensures secure, verified, and legally compliant rental agreements for peace of mind.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border border-border">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verified Identities</h3>
                <p className="text-muted-foreground">
                  Both tenant and landlord identities are verified through phone and email OTP verification for maximum security.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border border-border">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Legal Compliance</h3>
                <p className="text-muted-foreground">
                  Professionally generated PDF agreements that comply with local rental laws and regulations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border border-border">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Delivery</h3>
                <p className="text-muted-foreground">
                  Generated agreements are instantly delivered to both parties via email with secure storage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to create and verify your rental agreement
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-primary">For Tenants</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Fill Agreement Form</h4>
                    <p className="text-muted-foreground text-sm">Enter tenant, landlord, and rental property details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Upload ID Proof</h4>
                    <p className="text-muted-foreground text-sm">Upload identification documents for verification</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Verify Contacts</h4>
                    <p className="text-muted-foreground text-sm">Complete OTP verification for both parties</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Receive Agreement</h4>
                    <p className="text-muted-foreground text-sm">Get the signed PDF via email</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6 text-secondary">For Landlords</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Receive Notification</h4>
                    <p className="text-muted-foreground text-sm">Get notified when tenant creates agreement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Verify Identity</h4>
                    <p className="text-muted-foreground text-sm">Complete OTP verification process</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Review & Approve</h4>
                    <p className="text-muted-foreground text-sm">Review agreement details and approve</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Verify Anytime</h4>
                    <p className="text-muted-foreground text-sm">Use agreement ID to verify authenticity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
