import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield } from "lucide-react"; // Replaced font-awesome with Lucide for consistency
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/#features", label: "Features" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center group" data-testid="logo-link">
            <div className="text-2xl font-black text-black flex items-center bg-yellow-400 border-2 border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
              <Shield className="mr-2 h-6 w-6 fill-black" />
              SafeRental
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-lg font-bold transition-all hover:text-primary underline-offset-4 hover:underline decoration-2",
                  location === item.href ? "text-primary underline" : "text-black"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white"
                data-testid="button-dashboard"
              >
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="outline" 
                size="icon" 
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                data-testid="button-menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-l-4 border-black p-6 bg-white">
              <div className="flex flex-col space-y-6 mt-12">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-2xl font-black text-black hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                    data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t-2 border-black">
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button 
                      className="w-full text-lg border-2 border-black py-6 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all" 
                      data-testid="mobile-button-dashboard"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}