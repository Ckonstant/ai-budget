"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  PenBox, 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Menu, 
  X,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { CreateTransactionDrawer } from "@/components/create-transaction-drawer";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function HeaderClient({ accounts }) {
  const [mounted, setMounted] = useState(false);
  const [refreshedAccounts, setRefreshedAccounts] = useState(accounts || []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu') && 
          !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Only render on client side to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTransactionComplete = async (updatedData) => {
    console.log("Transaction completed in header:", {
      accounts: updatedData.accounts?.length || 0,
    });

    // Update accounts list if available for future transactions
    if (updatedData.accounts) {
      setRefreshedAccounts(updatedData.accounts);
    }

    // If we're on the dashboard, we need to refresh it
    if (pathname === "/dashboard") {
      console.log("On dashboard page, triggering update");

      // Method 1: Use a custom event to notify the dashboard
      try {
        const event = new CustomEvent("dashboard:update", {
          detail: updatedData,
        });
        window.dispatchEvent(event);
        console.log("Dispatched dashboard:update event");
      } catch (error) {
        console.error("Error dispatching event:", error);
      }
    } else {
      // If not on dashboard, just show a success message
      toast.success("Transaction added", {
        description: "View in dashboard for details",
        action: {
          label: "Go to Dashboard",
          onClick: () => router.push("/dashboard"),
        },
      });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/90 backdrop-blur-md z-50 border-b dark:border-slate-800 shadow-sm dark:shadow-slate-800/10">
      <nav className="container mx-auto px-4 py-2 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative h-10 md:h-12 w-auto">
            <Image
              src="/yes1.png"
              alt="Finance AI Platform - Light Mode"
              width={150}
              height={40}
              className="h-10 md:h-12 w-auto object-contain dark:hidden"
            />
            <Image
              src="/logo.png"
              alt="Finance AI Platform - Dark Mode"
              width={150}
              height={40}
              className="h-10 md:h-12 w-auto object-contain hidden dark:block"
            />
          </div>
        </Link>

        {/* This is a spacer div that grows to push the desktop navigation to the right */}
        <div className="flex-grow hidden md:block"></div>

        {/* Desktop Navigation - Now on the far right */}
        <div className="hidden md:flex md:items-center md:space-x-4 ml-auto">
          <SignedOut>
            <a
              href="#features"
              className="text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2"
            >
              Testimonials
            </a>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600"
              >
                <LayoutDashboard
                  size={18}
                  className="text-blue-600 dark:text-blue-400 mr-2"
                />
                Dashboard
              </Button>
            </Link>

            <CreateTransactionDrawer
              accounts={refreshedAccounts}
              onTransactionComplete={handleTransactionComplete}
            >
              <Button className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-sm text-white dark:text-white">
                <PenBox size={18} className="text-white dark:text-white mr-2" />
                Add Transaction
              </Button>
            </CreateTransactionDrawer>

            <Link href="/settings">
              <Button
                variant="outline"
                className="border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600"
              >
                <Settings
                  size={18}
                  className="text-gray-500 dark:text-slate-400 mr-2"
                />
                Settings
              </Button>
            </Link>

            <Link href="/notes">
              <Button
                variant="outline"
                className={`border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600 ${
                  pathname === "/notes" 
                    ? "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20" 
                    : ""
                }`}
              >
                <FileText
                  size={18}
                  className={`mr-2 ${
                    pathname === "/notes"
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-slate-400"
                  }`}
                />
                Notes
              </Button>
            </Link>
          </SignedIn>
        </div>

        {/* Mobile and Universal Auth Elements */}
        <div className="flex items-center space-x-2 ml-4">
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant="outline"
                className="border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600"
              >
                Login
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {/* Quick Add Transaction Button for Mobile */}
            <div className="md:hidden">
              <CreateTransactionDrawer
                accounts={refreshedAccounts}
                onTransactionComplete={handleTransactionComplete}
              >
                <Button 
                  size="icon" 
                  className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700"
                >
                  <PenBox className="h-5 w-5 text-white" />
                </Button>
              </CreateTransactionDrawer>
            </div>
            
            {/* User Profile Button - Always visible */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                  userButtonPopoverCard:
                    "dark:bg-slate-800 dark:border-slate-700",
                  userPreviewMainIdentifier: "dark:text-white",
                  userPreviewSecondaryIdentifier: "dark:text-slate-300",
                  userButtonPopoverActionButton: "dark:hover:bg-slate-700",
                  userButtonPopoverActionButtonText: "dark:text-slate-200",
                  userButtonPopoverFooter: "dark:border-slate-700",
                },
              }}
            />
            
            {/* Mobile Menu Toggle - Only for mobile */}
            <div className="md:hidden relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="h-9 w-9 mobile-menu-button"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-700 dark:text-slate-400" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-700 dark:text-slate-400" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
              
              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden mobile-menu z-50">
                  <div className="py-1">
                    <Link href="/dashboard" className="block">
                      <div className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center">
                        <LayoutDashboard size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                        Dashboard
                      </div>
                    </Link>
                    <Link href="/settings" className="block">
                      <div className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center">
                        <Settings size={16} className="mr-2 text-gray-500 dark:text-slate-400" />
                        Settings
                      </div>
                    </Link>
                    <Link href="/notes" className="block">
                      <div className={`px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center ${
                        pathname === "/notes" ? "bg-purple-50 dark:bg-purple-900/20" : ""
                      }`}>
                        <FileText size={16} className={`mr-2 ${
                          pathname === "/notes" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-slate-400"
                        }`} />
                        Notes
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}