"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChartBar, Shield, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const HeroSection = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <section className="relative py-12 sm:py-16 md:py-24 min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden border-b border-slate-200 dark:border-slate-800">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/60 to-white dark:from-slate-950 dark:via-blue-950/10 dark:to-slate-950"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/30 to-purple-100/30 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full transform translate-x-1/4 -translate-y-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/20 to-blue-100/20 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 md:gap-16">
          {/* Text Content - Enhanced for mobile */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-slate-900 dark:text-white">
              Intelligent <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Finance</span> Management
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0">
              Take control of your financial future with AI-powered insights and elegant visualization. Make better decisions and achieve your financial goals.
            </p>
            
            {/* Enhanced Buttons with Auth Check - Mobile optimized */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 md:gap-4">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
              
              <Link href="#features" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 text-sm sm:text-base md:text-lg hover:bg-slate-100 dark:hover:bg-slate-800/70">
                  Explore Features
                </Button>
              </Link>
            </div>
            
            {/* Key Benefits Section - Enhanced for mobile */}
            <div className="mt-8 sm:mt-10 md:mt-12">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 sm:mb-2">
                    <ChartBar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 text-center lg:text-left">Real-time Analytics</p>
                </div>
                
                <div className="flex flex-col items-center lg:items-start">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1 sm:mb-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 text-center lg:text-left">AI-Powered Insights</p>
                </div>
                
                <div className="flex flex-col items-center lg:items-start">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1 sm:mb-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 text-center lg:text-left">Bank-Level Security</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section - Enhanced for mobile */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <div className="relative mx-auto max-w-[320px] sm:max-w-md lg:max-w-full">
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-1">
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                
                {/* Clean, elegant image presentation */}
                <div className="relative rounded-lg overflow-hidden aspect-[16/9]">
                  <Image
                    src="/banner.jpeg"
                    alt="Financial Dashboard Preview"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    className="rounded-lg"
                    priority
                    sizes="(max-width: 640px) 90vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 40vw"
                  />
                  
                  {/* Subtle image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent"></div>
                </div>
                
                {/* Image caption */}
                <div className="p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Interactive dashboards with real-time financial insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;