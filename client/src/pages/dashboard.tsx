import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Clock, Archive, Home, Search, Plus, Eye, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Agreement } from "@shared/schema";
import { cn } from "@/lib/utils";

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
    if (searchEmail.trim()) setShouldFetch(true);
  };

  const handleDownloadAgreement = (agreement: Agreement) => {
    if (!agreement.tenantVerified || !agreement.landlordVerified) {
      toast({
        title: "Agreement Not Ready",
        description: "Verification pending for one or both parties.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "PDF Agreement",
      description: `Sent to authorized emails for ID: ${agreement.agreementNumber}`,
    });
  };

  const getStatusBadge = (agreement: Agreement) => {
    if (!agreement.tenantVerified || !agreement.landlordVerified) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600 rounded-none font-mono text-[10px]">PENDING_AUTH</Badge>;
    }
    if (agreement.isActive) {
      return <Badge variant="outline" className="border-emerald-500 text-emerald-600 rounded-none font-mono text-[10px]">ACTIVE_LEASE</Badge>;
    }
    return <Badge variant="outline" className="border-slate-300 text-slate-400 rounded-none font-mono text-[10px]">ARCHIVED</Badge>;
  };

  const activeAgreements = agreements.filter(a => a.isActive && a.tenantVerified && a.landlordVerified);
  const pendingAgreements = agreements.filter(a => !a.tenantVerified || !a.landlordVerified);
  const expiredAgreements = agreements.filter(a => !a.isActive);

  const AgreementCard = ({ agreement }: { agreement: Agreement }) => (
    <div 
      key={agreement.id} 
      className="group border border-slate-200 bg-white hover:border-slate-950 transition-all p-0 flex flex-col"
      data-testid={`agreement-card-${agreement.id}`}
    >
      <div className="p-6 border-b border-slate-100 flex justify-between items-start">
        {getStatusBadge(agreement)}
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-tighter">ID: {agreement.agreementNumber}</span>
      </div>
      
      <div className="p-8 flex-1">
        <h3 className="text-2xl font-bold uppercase tracking-tighter mb-6 leading-tight group-hover:text-primary transition-colors">
          {agreement.propertyAddress}
        </h3>
        
        <div className="space-y-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span>Rent</span>
            <span className="text-slate-950 font-bold">${agreement.monthlyRent}</span>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span>Lease Start</span>
            <span className="text-slate-950">{new Date(agreement.leaseStartDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 border-t border-slate-200">
        <button 
          onClick={() => setViewingAgreement(agreement)}
          className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-r border-slate-200 hover:bg-slate-950 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Eye size={14} /> Details
        </button>
        <button 
          onClick={() => handleDownloadAgreement(agreement)}
          className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Download size={14} /> PDF
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-950 selection:bg-primary selection:text-white">
      {/* Editorial Header */}
      <header className="border-b border-slate-200 bg-white pt-24 pb-16 px-6">
        <div className="max-w-[1400px] mx-auto">
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-primary mb-6 block">/ User Dashboard</span>
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.85]">
            My <span className="text-slate-300 italic">Agreements</span>
          </h1>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Search - Studio Style */}
        <div className="mb-20 grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-4 block">Archive Search</label>
            <div className="relative group">
              <Input
                placeholder="EMAIL_ADDRESS@DOMAIN.COM"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="h-20 rounded-none border-0 border-b-2 border-slate-200 bg-transparent text-3xl md:text-4xl font-bold tracking-tighter placeholder:text-slate-100 focus-visible:ring-0 focus-visible:border-primary transition-all px-0"
              />
              <div className="absolute right-0 bottom-4">
                <Button 
                  onClick={handleSearch}
                  size="lg"
                  className="h-12 w-12 rounded-none bg-slate-950"
                  disabled={!searchEmail.trim() || isLoading}
                >
                  <Search size={20} />
                </Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <Link href="/agreement-form">
              <Button variant="outline" size="lg" className="h-20 w-full lg:w-auto px-12 rounded-none border-slate-950 uppercase tracking-widest font-bold text-xs hover:bg-slate-950 hover:text-white">
                <Plus className="mr-4 h-4 w-4" /> Create New Record
              </Button>
            </Link>
          </div>
        </div>

        {shouldFetch ? (
          <Tabs defaultValue="active" className="space-y-12">
            <TabsList className="h-auto bg-transparent border-b border-slate-200 w-full justify-start rounded-none p-0 gap-12">
              {['active', 'pending', 'expired'].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab} 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 py-4 font-mono text-[11px] uppercase tracking-[0.2em] font-bold"
                >
                  {tab} Records ({tab === 'active' ? activeAgreements.length : tab === 'pending' ? pendingAgreements.length : expiredAgreements.length})
                </TabsTrigger>
              ))}
            </TabsList>

            {['active', 'pending', 'expired'].map((status) => (
              <TabsContent key={status} value={status}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-slate-200">
                  {(status === 'active' ? activeAgreements : status === 'pending' ? pendingAgreements : expiredAgreements).map(agreement => (
                    <div key={agreement.id} className="border-r border-b border-slate-200">
                      <AgreementCard agreement={agreement} />
                    </div>
                  ))}
                  {(status === 'active' ? activeAgreements : status === 'pending' ? pendingAgreements : expiredAgreements).length === 0 && (
                    <div className="col-span-full py-32 text-center border-r border-b border-slate-200 bg-white">
                      <Archive size={48} className="mx-auto mb-6 text-slate-100" />
                      <p className="font-mono text-xs uppercase tracking-widest text-slate-400">No records found in this category.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="py-40 text-center border-2 border-dashed border-slate-100">
            <Clock size={64} className="mx-auto mb-8 text-slate-100" />
            <h3 className="text-4xl font-bold uppercase tracking-tighter mb-4">Awaiting Input</h3>
            <p className="text-slate-400 font-light max-w-sm mx-auto uppercase text-[10px] tracking-widest">
              Please enter your authorized email address above to retrieve your encrypted rental agreements.
            </p>
          </div>
        )}
      </main>

      {/* Details Dialog - Architectural Modern */}
      <Dialog open={!!viewingAgreement} onOpenChange={() => setViewingAgreement(null)}>
        <DialogContent className="max-w-5xl rounded-none border-slate-950 p-0 overflow-hidden bg-white max-h-[95vh]">
          <div className="flex h-full flex-col md:flex-row">
            {/* Sidebar / Status */}
            <div className="md:w-1/3 bg-slate-950 text-white p-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary mb-8 block">Record Metadata</span>
              <h2 className="text-4xl font-bold uppercase tracking-tighter mb-12">
                Lease <br />Details
              </h2>
              <div className="space-y-8">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-slate-500 block mb-2">Auth Status</label>
                  {viewingAgreement && getStatusBadge(viewingAgreement)}
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-slate-500 block mb-2">Agreement UUID</label>
                  <p className="font-mono text-xs">{viewingAgreement?.agreementNumber}</p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="md:w-2/3 p-12 overflow-y-auto">
              <div className="grid gap-12">
                <section>
                  <h4 className="font-bold uppercase tracking-widest text-xs border-b border-slate-100 pb-4 mb-6">01. Premises & Financials</h4>
                  <div className="grid grid-cols-2 gap-8 font-light italic text-slate-600">
                    <div>
                      <span className="block font-bold not-italic uppercase text-[10px] text-slate-950 mb-1">Address</span>
                      {viewingAgreement?.propertyAddress}
                    </div>
                    <div>
                      <span className="block font-bold not-italic uppercase text-[10px] text-slate-950 mb-1">Monthly Yield</span>
                      ${viewingAgreement?.monthlyRent}
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="font-bold uppercase tracking-widest text-xs border-b border-slate-100 pb-4 mb-6">02. Parties Involved</h4>
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-primary uppercase tracking-widest">[Tenant]</span>
                      <p className="text-xl font-bold uppercase">{viewingAgreement?.tenantFullName}</p>
                      <p className="text-xs font-mono text-slate-400">{viewingAgreement?.tenantEmail}</p>
                    </div>
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">[Landlord]</span>
                      <p className="text-xl font-bold uppercase">{viewingAgreement?.landlordFullName}</p>
                      <p className="text-xs font-mono text-slate-400">{viewingAgreement?.landlordEmail}</p>
                    </div>
                  </div>
                </section>
                
                <Button 
                  className="w-full h-16 rounded-none bg-slate-950 font-bold uppercase tracking-widest text-xs mt-8"
                  onClick={() => viewingAgreement && handleDownloadAgreement(viewingAgreement)}
                >
                  Download Formal PDF Agreement
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}