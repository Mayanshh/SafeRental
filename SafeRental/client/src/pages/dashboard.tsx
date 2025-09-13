import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Clock, Archive, Home, Search, Plus } from "lucide-react";
import { Link } from "wouter";
import type { Agreement } from "@shared/schema";

export default function Dashboard() {
  const [searchEmail, setSearchEmail] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: agreements = [], isLoading } = useQuery<Agreement[]>({
    queryKey: ['/api/agreements/user', searchEmail],
    enabled: shouldFetch && !!searchEmail,
  });

  const handleSearch = () => {
    if (searchEmail.trim()) {
      setShouldFetch(true);
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
              <Button onClick={handleSearch} disabled={!searchEmail.trim() || isLoading} data-testid="button-search">
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link href="/agreement-form">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="quick-action-create">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create New Agreement</h3>
                    <p className="text-sm text-muted-foreground">Start a new rental agreement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/verification">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="quick-action-verify">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Verify Agreement</h3>
                    <p className="text-sm text-muted-foreground">Check agreement authenticity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Agreements Display */}
        {shouldFetch && (
          <Tabs defaultValue="all" className="space-y-6" data-testid="agreements-tabs">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({agreements.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeAgreements.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingAgreements.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({expiredAgreements.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <AgreementGrid agreements={agreements} />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <AgreementGrid agreements={activeAgreements} />
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <AgreementGrid agreements={pendingAgreements} />
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              <AgreementGrid agreements={expiredAgreements} />
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {shouldFetch && agreements.length === 0 && !isLoading && (
          <Card className="text-center py-12" data-testid="empty-state">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Agreements Found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any agreements associated with this email address.
              </p>
              <Link href="/agreement-form">
                <Button data-testid="button-create-first">Create Your First Agreement</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Back to Home */}
        <div className="flex justify-center mt-8">
          <Link href="/">
            <Button variant="outline" data-testid="button-back-home">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AgreementGrid({ agreements }: { agreements: Agreement[] }) {
  const getStatusBadge = (agreement: Agreement) => {
    if (!agreement.tenantVerified || !agreement.landlordVerified) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    if (agreement.isActive) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-100 text-gray-800">Expired</Badge>;
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="agreement-grid">
      {agreements.map((agreement) => (
        <Card key={agreement.id} className="hover:shadow-md transition-shadow" data-testid={`agreement-card-${agreement.id}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {getStatusBadge(agreement)}
              <Button variant="ghost" size="icon" data-testid={`button-download-${agreement.id}`}>
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
                disabled={!agreement.tenantVerified || !agreement.landlordVerified}
                data-testid={`button-view-${agreement.id}`}
              >
                {agreement.tenantVerified && agreement.landlordVerified ? 'View Agreement' : 'Complete Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
