import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Clock, Archive, Home, Search, Plus, Eye } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Agreement } from "@shared/schema";

export default function Dashboard() {
  const [searchEmail, setSearchEmail] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [viewingAgreement, setViewingAgreement] = useState<Agreement | null>(null);
  const { toast } = useToast();

  const { data: agreements = [], isLoading } = useQuery<Agreement[]>({
    queryKey: ['/api/agreements/user', searchEmail],
    enabled: shouldFetch && !!searchEmail,
  });

  const handleSearch = () => {
    if (searchEmail.trim()) {
      setShouldFetch(true);
    }
  };

  // Handlers for button actions
  const handleViewAgreement = (agreement: Agreement) => {
    setViewingAgreement(agreement);
  };

  const handleDownloadAgreement = async (agreement: Agreement) => {
    try {
      // Check if agreement is fully verified
      if (!agreement.tenantVerified || !agreement.landlordVerified) {
        toast({
          title: "Agreement Not Ready",
          description: "Both tenant and landlord must verify before downloading the agreement.",
          variant: "destructive",
        });
        return;
      }

      // Show message that PDF was emailed
      toast({
        title: "PDF Agreement",
        description: `The rental agreement PDF was emailed to both parties when verification was completed for agreement ${agreement.agreementNumber}.`,
      });
      
      // Note: In a production app, you might want to add a backend endpoint 
      // to regenerate and download the PDF directly
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to process download request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (agreement: Agreement) => {
    if (!agreement.tenantVerified || !agreement.landlordVerified) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    if (agreement.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-100 text-gray-800">Expired</Badge>;
  };

  const activeAgreements = agreements.filter(a => a.isActive && a.tenantVerified && a.landlordVerified);
  const pendingAgreements = agreements.filter(a => !a.tenantVerified || !a.landlordVerified);
  const expiredAgreements = agreements.filter(a => !a.isActive);

  const AgreementCard = ({ agreement }: { agreement: Agreement }) => (
    <Card key={agreement.id} className="hover:shadow-md transition-shadow" data-testid={`agreement-card-${agreement.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          {getStatusBadge(agreement)}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDownloadAgreement(agreement)}
            data-testid={`button-download-${agreement.id}`}
            title="Download Agreement PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        <h3 className="font-semibold mb-2 line-clamp-2" data-testid={`agreement-address-${agreement.id}`}>
          {agreement.propertyAddress}
        </h3>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Agreement ID:</span>
            <span data-testid={`agreement-number-${agreement.id}`}>{agreement.agreementNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Monthly Rent:</span>
            <span data-testid={`agreement-rent-${agreement.id}`}>${agreement.monthlyRent}</span>
          </div>
          <div className="flex justify-between">
            <span>Start Date:</span>
            <span data-testid={`agreement-start-${agreement.id}`}>
              {new Date(agreement.leaseStartDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span data-testid={`agreement-duration-${agreement.id}`}>{agreement.leaseDuration}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <Button 
            className="w-full" 
            size="sm"
            onClick={() => handleViewAgreement(agreement)}
            disabled={!agreement.tenantVerified || !agreement.landlordVerified}
            data-testid={`button-view-${agreement.id}`}
          >
            <Eye className="mr-2 h-4 w-4" />
            {agreement.tenantVerified && agreement.landlordVerified ? 'View Agreement' : 'Complete Verification'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAgreementGrid = (agreements: Agreement[]) => {
    if (agreements.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No agreements found</h3>
          <p className="text-muted-foreground mb-6">
            Create your first rental agreement to get started.
          </p>
          <Link href="/agreement-form">
            <Button data-testid="button-create-first">
              <Plus className="mr-2 h-4 w-4" />
              Create Agreement
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="agreement-grid">
        {agreements.map((agreement) => (
          <AgreementCard key={agreement.id} agreement={agreement} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Agreements</h1>
          <p className="text-muted-foreground">Manage and view your rental agreements</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8" data-testid="search-card">
          <CardHeader>
            <CardTitle>Find Your Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter your email address"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1"
                data-testid="input-search-email"
              />
              <Button 
                onClick={handleSearch}
                disabled={!searchEmail.trim() || isLoading}
                data-testid="button-search"
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the email address used when creating or receiving the agreement
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {shouldFetch && (
          <div>
            {agreements.length > 0 && (
              <Tabs defaultValue="active" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active" data-testid="tab-active">
                    Active ({activeAgreements.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending" data-testid="tab-pending">
                    Pending ({pendingAgreements.length})
                  </TabsTrigger>
                  <TabsTrigger value="expired" data-testid="tab-expired">
                    Expired ({expiredAgreements.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" data-testid="tab-content-active">
                  {renderAgreementGrid(activeAgreements)}
                </TabsContent>

                <TabsContent value="pending" data-testid="tab-content-pending">
                  {renderAgreementGrid(pendingAgreements)}
                </TabsContent>

                <TabsContent value="expired" data-testid="tab-content-expired">
                  {renderAgreementGrid(expiredAgreements)}
                </TabsContent>
              </Tabs>
            )}

            {agreements.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No agreements found</h3>
                <p className="text-muted-foreground mb-6">
                  No rental agreements found for this email address.
                </p>
                <Link href="/agreement-form">
                  <Button data-testid="button-create-new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Agreement
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {!shouldFetch && (
          <div className="text-center py-16">
            <Clock className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-medium mb-4">Ready to find your agreements?</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Enter your email address above to search for rental agreements associated with your account.
            </p>
            <div className="space-x-4">
              <Link href="/agreement-form">
                <Button data-testid="button-create-welcome">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Agreement
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" data-testid="button-back-home">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Agreement Details Modal */}
        <Dialog open={!!viewingAgreement} onOpenChange={() => setViewingAgreement(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agreement Details - {viewingAgreement?.agreementNumber}</DialogTitle>
            </DialogHeader>
            
            {viewingAgreement && (
              <div className="space-y-6">
                {/* Agreement Status */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(viewingAgreement)}
                  <Button 
                    variant="outline"
                    onClick={() => handleDownloadAgreement(viewingAgreement)}
                    disabled={!viewingAgreement.tenantVerified || !viewingAgreement.landlordVerified}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
                
                {/* Property Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Property Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Property Address</label>
                        <p className="text-sm">{viewingAgreement.propertyAddress}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Monthly Rent</label>
                        <p className="text-sm font-semibold">${viewingAgreement.monthlyRent}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Security Deposit</label>
                        <p className="text-sm">${viewingAgreement.securityDeposit || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Lease Duration</label>
                        <p className="text-sm">{viewingAgreement.leaseDuration}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tenant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tenant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-sm">{viewingAgreement.tenantFullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{viewingAgreement.tenantEmail}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-sm">{viewingAgreement.tenantPhone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                        <p className="text-sm">
                          {viewingAgreement.tenantVerified ? (
                            <span className="text-green-600 font-medium">✓ Verified</span>
                          ) : (
                            <span className="text-yellow-600 font-medium">⏳ Pending</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Landlord Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Landlord Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-sm">{viewingAgreement.landlordFullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{viewingAgreement.landlordEmail}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-sm">{viewingAgreement.landlordPhone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                        <p className="text-sm">
                          {viewingAgreement.landlordVerified ? (
                            <span className="text-green-600 font-medium">✓ Verified</span>
                          ) : (
                            <span className="text-yellow-600 font-medium">⏳ Pending</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lease Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lease Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                        <p className="text-sm">{new Date(viewingAgreement.leaseStartDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">End Date</label>
                        <p className="text-sm">{new Date(viewingAgreement.leaseEndDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Created</label>
                        <p className="text-sm">{new Date(viewingAgreement.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Agreement ID</label>
                        <p className="text-sm font-mono">{viewingAgreement.agreementNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}