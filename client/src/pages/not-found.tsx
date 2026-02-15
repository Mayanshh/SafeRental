import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#fafafa] text-slate-950 selection:bg-primary selection:text-white">
      {/* Editorial Navigation Mask */}
      <nav className="p-8 flex justify-between items-center border-b border-slate-200 bg-white">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400">
          Error_Protocol // 404
        </span>
        <Link href="/">
          <Button variant="link" className="font-mono text-[10px] uppercase tracking-widest p-0 h-auto">
            [ Return to Safety ]
          </Button>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col justify-center px-6 md:px-24">
        <div className="max-w-[1400px] w-full mx-auto">
          {/* Large Impact Typography */}
          <div className="relative">
            <h1 className="text-[15vw] md:text-[20vw] font-bold leading-[0.8] uppercase tracking-tighter opacity-5 select-none absolute -top-[0.5em] -left-[0.05em]">
              Lost
            </h1>
            
            <h2 className="text-6xl md:text-9xl font-bold uppercase tracking-tighter leading-none mb-8 relative z-10">
              Page <span className="text-slate-300 italic">Not Found</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-6 border-l-2 border-primary pl-8 py-4">
              <p className="text-xl md:text-2xl text-slate-600 font-light mb-8 max-w-md">
                The requested resource has been moved, deleted, or never existed in this architectural framework.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/">
                  <Button className="rounded-none h-16 px-10 uppercase tracking-[0.2em] font-bold text-xs">
                    <Home className="mr-3 h-4 w-4" /> Go Home
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  className="rounded-none h-16 px-10 uppercase tracking-[0.2em] font-bold text-xs border-slate-950"
                >
                  <ArrowLeft className="mr-3 h-4 w-4" /> Go Back
                </Button>
              </div>
            </div>

            <div className="md:col-span-6">
              <div className="border border-slate-200 bg-white p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold">System_Diagnostic</span>
                </div>
                
                <p className="font-mono text-xs leading-relaxed text-slate-500 italic">
                  "Did you forget to add the page to the router? Check your application manifest and routing definitions. If this persists, contact the system architect."
                </p>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between font-mono text-[9px] text-slate-300 uppercase">
                    <span>Code: 0x404</span>
                    <span>Status: UNRESOLVED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Aesthetic Footer Grid */}
      <footer className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-200 bg-white">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-r border-slate-200 p-6 last:border-r-0 hidden md:block">
            <div className="h-1 w-full bg-slate-50" />
          </div>
        ))}
      </footer>
    </div>
  );
}