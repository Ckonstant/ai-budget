import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Activity, Shield, Sparkles, Wallet, BarChart, TrendingUp, ChevronRight } from "lucide-react";
import HeroSection from "@/components/hero";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section - Simplified and Mobile-friendly */}
      <section id="features" className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Premium Financial Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
              Our platform combines intelligent analytics with intuitive design to transform your financial experience.
            </p>
          </div>

          {/* Responsive Grid - Adjusts columns for different screen sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <Card className="group border-0 shadow-lg hover:shadow-xl transition-all dark:bg-slate-900/90 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <CardContent className="p-6 md:p-8">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 md:mb-6">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-900 dark:text-white">Real-time Analytics</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm md:text-base">
                  Track your finances with instant updates and intelligent insights that help you make informed decisions.
                </p>
                <Link href="/dashboard" className="inline-flex items-center font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm md:text-base">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group border-0 shadow-lg hover:shadow-xl transition-all dark:bg-slate-900/90 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <CardContent className="p-6 md:p-8">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 md:mb-6">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-900 dark:text-white">AI-Powered Insights</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm md:text-base">
                  Receive personalized financial insights and recommendations tailored to your spending patterns and goals.
                </p>
                <Link href="/dashboard" className="inline-flex items-center font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm md:text-base">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group border-0 shadow-lg hover:shadow-xl transition-all dark:bg-slate-900/90 overflow-hidden relative md:col-span-2 lg:col-span-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <CardContent className="p-6 md:p-8">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 md:mb-6">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-900 dark:text-white">Secure & Private</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm md:text-base">
                  Bank-level encryption and strict privacy controls ensure your financial data remains secure and private.
                </p>
                <Link href="/dashboard" className="inline-flex items-center font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm md:text-base">
                  Learn more <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Showcase Section - Better image handling */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
                Visualize Your Financial Journey
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-base md:text-lg">
                Our intuitive dashboard provides a comprehensive view of your financial health with elegant visualizations.
              </p>
              
              <ul className="space-y-4 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: <BarChart className="h-5 w-5" />, text: "Advanced financial analytics" },
                  { icon: <Wallet className="h-5 w-5" />, text: "Multi-account management" },
                  { icon: <TrendingUp className="h-5 w-5" />, text: "Automated savings strategies" }
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm md:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                    Explore Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Improved Dashboard Preview Image */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-xl shadow-2xl max-w-xl mx-auto">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  <Image
                    src="/dashboard-preview.png"
                    alt="Dashboard Preview"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 40vw"
                    priority={false} // Not above the fold
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified and Mobile-optimized */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
              Take Control of Your Financial Future Today
            </h2>
            <p className="text-blue-100 mb-8 text-base md:text-lg">
              Join thousands of users who have transformed their financial management experience.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 px-6 md:px-8 shadow-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Using proper logo images from public folder */}
      <footer className="py-8 md:py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-4 md:mb-6">
                <Image
                  src="/logo.png"
                  alt="Finance AI Platform"
                  width={180}
                  height={50}
                  className="h-8 w-auto dark:hidden"
                />
                <Image
                  src="/logo.png"
                  alt="Finance AI Platform"
                  width={180}
                  height={50}
                  className="h-8 w-auto hidden dark:block"
                />
              </Link>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-xs text-sm md:text-base">
                Transforming personal finance management with intelligent analytics and beautiful design.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 md:mb-4 text-base md:text-lg">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Integrations"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 md:mb-4 text-base md:text-lg">Company</h3>
              <ul className="space-y-2">
                {["About", "Contact", "Support"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 md:mb-4 text-base md:text-lg">Legal</h3>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Security"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-6 mt-6 md:pt-8 md:mt-8 border-t border-slate-200 dark:border-slate-800 text-center md:flex md:justify-between md:items-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © {new Date().getFullYear()} Finance AI Platform. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-4">
              <a href="#" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;