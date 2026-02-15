import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Download, CheckCircle, User, Github, Linkedin, Twitter, Mail, Code2, Heart, ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-950 font-sans selection:bg-primary selection:text-white">
      {/* Navigation / Header Mockup */}
      <nav className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-50">
        <span className="font-bold tracking-tighter text-xl italic">SAFERENTAL.</span>
        <div className="hidden md:flex gap-8 text-xs font-medium uppercase tracking-widest">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">Process</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <Link href="/agreement-form">
          <Button variant="outline" className="rounded-none border-slate-950 px-6 uppercase text-[10px] tracking-[0.2em] font-bold">
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-32 border-b border-slate-200 bg-white" data-testid="hero-section">
        <div className="max-w-[1400px] mx-auto">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-8 block">/ Premium Rental Verification</span>
          <h1 className="text-[12vw] md:text-[8vw] font-bold leading-[0.85] tracking-tighter mb-12 uppercase">
            Secure Rental <br />
            <span className="text-slate-400">Agreements</span>
          </h1>
          
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-5">
              <p className="text-xl md:text-2xl leading-relaxed text-slate-600 mb-8 font-light italic">
                A high-fidelity platform designed to bridge trust between tenants and landlords through automated verification and legal precision.
              </p>
            </div>
            <div className="md:col-span-7 flex flex-wrap gap-4 justify-start md:justify-end">
              <Link href="/agreement-form">
                <Button size="lg" className="h-16 px-10 rounded-none bg-slate-950 text-white hover:bg-primary transition-all uppercase text-xs tracking-widest font-bold">
                  <User className="mr-3 h-4 w-4" /> Create Agreement
                </Button>
              </Link>
              <Link href="/verification">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-none border-slate-950 hover:bg-slate-50 uppercase text-xs tracking-widest font-bold">
                  <CheckCircle className="mr-3 h-4 w-4" /> Verify Document
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Awwwards Style (Visible Borders) */}
      <section id="features" className="bg-white" data-testid="features-section">
        <div className="grid md:grid-cols-3 border-b border-slate-200">
          {[
            { 
              icon: <Shield className="h-10 w-10" />, 
              title: "Verified Identities", 
              desc: "Multi-factor verification including phone and email OTP to ensure you're dealing with real people.",
              num: "01"
            },
            { 
              icon: <FileText className="h-10 w-10" />, 
              title: "Legal Compliance", 
              desc: "Documents drafted by professionals to match local housing regulations and legal standards.",
              num: "02"
            },
            { 
              icon: <Download className="h-10 w-10" />, 
              title: "Instant Delivery", 
              desc: "Automated generation and secure cloud storage with immediate PDF delivery to all parties.",
              num: "03"
            }
          ].map((feature, i) => (
            <div key={i} className="p-12 border-b md:border-b-0 md:border-r border-slate-200 group hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-16">
                <span className="font-mono text-sm text-slate-400">[{feature.num}]</span>
                <div className="text-slate-950 group-hover:text-primary transition-colors">{feature.icon}</div>
              </div>
              <h3 className="text-3xl font-bold uppercase tracking-tighter mb-6">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-light">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Architectural Layout */}
      <section id="how-it-works" className="py-32 px-6 bg-slate-950 text-white" data-testid="how-it-works-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-24 border-b border-slate-800 pb-12">
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">The Process</h2>
            <span className="font-mono text-primary text-sm uppercase tracking-widest mt-4">Simple. Secure. Systematic.</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-24">
            {/* Tenants Column */}
            <div>
              <div className="flex items-center gap-4 mb-12">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <h3 className="text-2xl font-bold uppercase tracking-widest">For Tenants</h3>
              </div>
              <div className="space-y-12">
                {[
                  { t: "Fill Form", d: "Digital entry of all lease terms and premises details." },
                  { t: "ID Upload", d: "Secure encryption of identity documents for background checks." },
                  { t: "Verification", d: "Instant OTP authentication for both contact channels." },
                  { t: "Finalization", d: "Digital signatures applied and PDF vaults created." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className="font-mono text-slate-700 text-xl">/0{i+1}</span>
                    <div>
                      <h4 className="text-xl font-bold uppercase mb-2 group-hover:text-primary transition-colors">{step.t}</h4>
                      <p className="text-slate-400 font-light max-w-md">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Landlords Column */}
            <div className="bg-slate-900/50 p-8 md:p-12 border border-slate-800">
               <div className="flex items-center gap-4 mb-12">
                <div className="h-2 w-2 bg-slate-400 rounded-full" />
                <h3 className="text-2xl font-bold uppercase tracking-widest">For Landlords</h3>
              </div>
              <div className="space-y-12">
                {[
                  { t: "Notification", d: "Receive instant alerts when a tenant initiates an agreement." },
                  { t: "Identity Check", d: "Review verified credentials before document approval." },
                  { t: "Review", d: "One-click audit of all lease clauses and financial terms." },
                  { t: "Vault Access", d: "Permanent access to the secure agreement via unique ID." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className="font-mono text-slate-700 text-xl">/0{i+1}</span>
                    <div>
                      <h4 className="text-xl font-bold uppercase mb-2 group-hover:text-white transition-colors">{step.t}</h4>
                      <p className="text-slate-500 font-light max-w-md">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Studio Colophon Style */}
      <section id="contact" className="py-32 px-6 bg-white border-t border-slate-200" data-testid="contact-section">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-12">Let's Talk.</h2>
              <div className="space-y-6">
                <p className="text-xl text-slate-500 font-light italic max-w-md">
                  Currently open for collaborations and technical inquiries regarding secure document architecture.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest pt-8">
                  Built by <span className="font-bold text-slate-900 border-b border-slate-950">Mayansh Bangali & Rajshree Rikame</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400">Socials</h4>
                <div className="space-y-4">
                  {[
                    { label: "Github", href: "https://github.com/Mayanshh", icon: <Github size={16}/> },
                    { label: "LinkedIn", href: "https://in.linkedin.com/in/mayansh-bangali-17ab86331", icon: <Linkedin size={16}/> },
                    { label: "Twitter / X", href: "https://x.com/MayanshB", icon: <Twitter size={16}/> }
                  ].map((link) => (
                    <a key={link.label} href={link.href} className="flex items-center justify-between py-3 border-b border-slate-100 hover:border-primary group transition-all">
                      <span className="font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                        {link.icon} {link.label}
                      </span>
                      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400">Direct Support</h4>
                <a href="mailto:mayanshbangali49@gmail.com" className="block p-6 bg-slate-50 border border-slate-100 group hover:bg-primary hover:text-white transition-all">
                  <Mail className="mb-4 h-6 w-6" />
                  <span className="block font-bold uppercase text-[10px] tracking-widest mb-1">Email Inquiry</span>
                  <span className="text-sm font-light">mayanshbangali49@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-32 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              © 2026 SafeRental / Modular Verification Systems
            </p>
            <div className="flex gap-6 items-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Tech Stack:</span>
              <div className="flex gap-4 text-slate-950 opacity-50 italic font-medium text-xs">
                <span>React</span>
                <span>MongoDB</span>
                <span>Firebase</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}