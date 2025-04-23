"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowUpRight, ArrowDownRight, Wallet, CreditCard, 
  ChevronDown, CircleDollarSign, BarChart3, TrendingUp, 
  TrendingDown, Calendar, FolderOpen, Tag as TagIcon 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import all needed Lucide icons
import * as LucideIcons from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";

export function CategoryCardClient({ 
  type, 
  accounts, 
  transactions,
  totalAmount,
  sortedCategories,
  categoryData
}) {
  const { formatCurrency } = useCurrency();
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [showAnimation, setShowAnimation] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 }); // Default center position
  const [isDarkMode, setIsDarkMode] = useState(false);
  const cardsRef = useRef(null);
  
  // Reset animation state when account changes
  useEffect(() => {
    setShowAnimation(false);
    setTimeout(() => setShowAnimation(true), 50);
  }, [selectedAccountId]);
  
  // Detect dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're in dark mode
      const checkDarkMode = () => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
      };
      
      // Initial check
      checkDarkMode();
      
      // Set up observer to detect theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            checkDarkMode();
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);
  
  // Mouse movement effect - only on desktop
  const handleMouseMove = (e) => {
    if (cardsRef.current && window.innerWidth > 768) {
      const rect = cardsRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    }
  };
  
  // Filter transactions based on selected account
  const filteredTransactions = selectedAccountId === "all" 
    ? transactions.filter(t => t.type === type) 
    : transactions.filter(t => t.type === type && t.accountId === selectedAccountId);
  
  // Calculate total for filtered transactions
  const filteredTotal = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  
  // Calculate month-to-month trend
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = filteredTransactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const previousMonthTransactions = filteredTransactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
  });
  
  const currentMonthTotal = currentMonthTransactions.reduce((acc, t) => acc + t.amount, 0);
  const previousMonthTotal = previousMonthTransactions.reduce((acc, t) => acc + t.amount, 0);
  
  const trendPercentage = previousMonthTotal === 0 
    ? 100 
    : ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
  
  // Recalculate categories based on filtered transactions
  const categorySummary = filteredTransactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += amount;
    return acc;
  }, {});
  
  // Sort categories by amount for the filtered transactions
  const filteredCategories = Object.entries(categorySummary)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .slice(0, 5); // Take top 5
  
  const isIncome = type === 'INCOME';
  const textColor = isIncome ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';
  const bgGradient = isIncome 
    ? 'from-green-50/90 via-emerald-50/70 dark:from-green-950/40 dark:via-emerald-950/30' 
    : 'from-rose-50/90 via-red-50/70 dark:from-rose-950/40 dark:via-red-950/30';
  const accentFrom = isIncome ? 'from-green-300' : 'from-red-300';
  const accentTo = isIncome ? 'to-emerald-500' : 'to-rose-500';
  const iconBg = isIncome ? 'from-green-400 to-emerald-600' : 'from-rose-400 to-red-600';
  const shadowColor = isIncome ? 'shadow-[0_4px_14px_rgba(34,197,94,0.2)]' : 'shadow-[0_4px_14px_rgba(244,63,94,0.2)]';
  const bannerGradient = isIncome 
    ? 'from-green-100/80 to-emerald-50/90 dark:from-green-900/20 dark:to-emerald-900/10' 
    : 'from-rose-100/80 to-red-50/90 dark:from-rose-900/20 dark:to-red-900/10';
  const ringColor = isIncome ? 'ring-green-100 dark:ring-green-900/50' : 'ring-red-100 dark:ring-red-900/50';
  const arrowColor = isIncome ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  const amountColor = isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const borderColor = isIncome ? 'border-green-100/80 dark:border-green-900/30' : 'border-red-100/80 dark:border-red-900/30';
  const emptyBorder = isIncome ? 'border-green-200 dark:border-green-800/40' : 'border-red-200 dark:border-red-800/40';
  const emptyBg = isIncome ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30';
  const emptyText = isIncome ? 'text-green-300 dark:text-green-500' : 'text-red-300 dark:text-red-500';
  const emptyTextDark = isIncome ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300';
  const itemBorder = isIncome 
    ? 'border-green-50 hover:border-green-100 dark:border-green-900/20 dark:hover:border-green-800/40' 
    : 'border-red-50 hover:border-red-100 dark:border-red-900/20 dark:hover:border-red-800/40';
  const selectBorder = isIncome 
    ? 'border-green-100 focus:ring-green-200 dark:border-green-800/40 dark:focus:ring-green-800/40' 
    : 'border-red-100 focus:ring-red-200 dark:border-red-800/40 dark:focus:ring-red-800/40';
  const selectGlow = isIncome 
    ? 'focus-within:shadow-[0_0_0_2px_rgba(34,197,94,0.1)] dark:focus-within:shadow-[0_0_0_2px_rgba(34,197,94,0.05)]' 
    : 'focus-within:shadow-[0_0_0_2px_rgba(244,63,94,0.1)] dark:focus-within:shadow-[0_0_0_2px_rgba(244,63,94,0.05)]';
  const gradientText = isIncome 
    ? 'bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-500 dark:to-emerald-400' 
    : 'bg-gradient-to-r from-rose-600 to-red-500 dark:from-rose-500 dark:to-red-400';
  const hoverHighlight = isIncome 
    ? 'bg-green-50/60 dark:bg-green-900/20' 
    : 'bg-rose-50/60 dark:bg-rose-900/20';
  const Icon = isIncome ? Wallet : CreditCard;
  const ArrowIcon = isIncome ? ArrowUpRight : ArrowDownRight;
  const ChartIcon = isIncome ? BarChart3 : CircleDollarSign;
  const TrendIcon = isIncome ? TrendingUp : TrendingDown;
  
  return (
    <Card 
      ref={cardsRef}
      onMouseMove={handleMouseMove}
      className={`overflow-hidden border-0 rounded-xl shadow-[0_10px_40px_-15px_rgba(${isIncome ? '34,197,94' : '244,63,94'},0.25)] hover:shadow-[0_20px_50px_-15px_rgba(${isIncome ? '34,197,94' : '244,63,94'},0.3)] transition-all duration-500 relative group cursor-default dark:bg-slate-900 dark:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]`}
    >
      {/* Dynamic gradient background with mouse tracking - updated for dark mode */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient} to-white dark:to-slate-900 opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${isIncome ? 'rgba(34, 197, 94, 0.08)' : 'rgba(244, 63, 94, 0.08)'} 0%, transparent 60%),
                    linear-gradient(to bottom right, 
                    ${isIncome 
                      ? (isDarkMode ? 'rgba(20, 83, 45, 0.3)' : 'rgba(220, 252, 231, 0.9)') 
                      : (isDarkMode ? 'rgba(127, 29, 29, 0.3)' : 'rgba(255, 228, 230, 0.9)')} 0%, 
                    ${isIncome 
                      ? (isDarkMode ? 'rgba(6, 78, 59, 0.2)' : 'rgba(167, 243, 208, 0.7)') 
                      : (isDarkMode ? 'rgba(153, 27, 27, 0.2)' : 'rgba(254, 205, 211, 0.7)')} 40%, 
                    ${isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'} 100%)`
        }}
      ></div>
      
      <CardHeader className="pb-2 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 md:mb-1">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${iconBg}`}></div>
            <div>
              <CardTitle className={`text-lg md:text-xl font-semibold ${textColor} dark:text-white flex items-center gap-1.5`}>
                <ChartIcon 
                  className={`h-5 w-5 text-current transform transition-transform group-hover:scale-110 duration-500`} 
                />
                <span className="tracking-tight">
                  Top {isIncome ? 'Income' : 'Expense'} Categories
                </span>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground dark:text-slate-400 ml-1">Based on transaction history</p>
                {filteredTransactions.length > 0 && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${isIncome ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                    <Calendar className="h-3 w-3 mr-0.5" />
                    {filteredTransactions.length} transactions
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced account selection with better mobile alignment */}
          <div className="flex flex-col space-y-1 relative z-10 w-full md:w-auto">
            <div className="flex items-center gap-1.5 justify-start md:justify-end mb-0.5">
              <span className={`text-xs ${isIncome ? 'text-green-600/70 dark:text-green-400/70' : 'text-red-600/70 dark:text-red-400/70'} font-medium`}>Filter by account</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-3.5 w-3.5 text-muted-foreground/70 dark:text-slate-400/70 cursor-help hover:text-muted-foreground dark:hover:text-slate-300 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center" className="max-w-[220px] p-3 shadow-lg backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 border-0 text-slate-700 dark:text-slate-200">
                    <p className="text-sm">
                      Select an account to view only {isIncome ? 'income' : 'expense'} categories for that specific account, or view all accounts combined.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className={`w-full md:w-[180px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${selectBorder} ${selectGlow} rounded-lg transition-shadow group/select dark:text-white dark:border-slate-700`}>
                <div className="flex items-center justify-between w-full overflow-hidden">
                  <span className="truncate flex items-center gap-1.5">
                    {selectedAccountId === "all" ? (
                      <>
                        <FolderOpen className={`h-3.5 w-3.5 ${arrowColor}`} />
                        All Accounts
                      </>
                    ) : (
                      <>
                        <div 
                          className="h-3.5 w-3.5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: accounts.find(a => a.id === selectedAccountId)?.color || '#94a3b8' }}
                        ></div>
                        {accounts.find(a => a.id === selectedAccountId)?.name || "Account"}
                      </>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-slate-400 opacity-70 group-hover/select:opacity-100 shrink-0 ml-1" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="py-1 px-1 mb-1 bg-slate-50/60 dark:bg-slate-900/60 rounded border border-slate-100 dark:border-slate-700">
                  <p className={`text-xs ${textColor} font-medium px-2 py-1`}>Choose account</p>
                </div>
                <SelectItem 
                  value="all" 
                  className={`rounded-md my-0.5 dark:text-white ${selectedAccountId === 'all' 
                    ? `bg-gradient-to-r ${bannerGradient} text-slate-800 dark:text-white` 
                    : 'dark:hover:bg-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full bg-gradient-to-br ${isIncome ? 'from-green-400 to-teal-500' : 'from-rose-400 to-red-500'} flex items-center justify-center`}>
                      <span className="text-[8px] text-white">All</span>
                    </div>
                    All Accounts
                  </div>
                </SelectItem>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                {accounts.map((account) => (
                  <SelectItem 
                    key={account.id} 
                    value={account.id}
                    className={`rounded-md my-0.5 dark:text-white ${selectedAccountId === account.id 
                      ? `bg-gradient-to-r ${bannerGradient} text-slate-800 dark:text-white` 
                      : 'dark:hover:bg-slate-700'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div 
                        className={`h-4 w-4 rounded-full flex items-center justify-center`}
                        style={{ backgroundColor: account.color || 'bg-slate-400' }}
                      >
                        <span className="text-[8px] text-white">{account.name?.charAt(0) || 'A'}</span>
                      </div>
                      <span className="truncate">{account.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <CardDescription className={`${isIncome ? 'text-green-600/80 dark:text-green-500/80' : 'text-red-600/80 dark:text-red-500/80'} ml-2.5 mt-0.5`}>
          {isIncome ? 'Your main sources of income' : 'Where your money is going'}
        </CardDescription>
        
        {/* Animated bottom accent line with enhanced glow */}
        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${accentFrom} ${accentTo} w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}></div>
      </CardHeader>
      
      <CardContent className="space-y-5 relative z-10">
        {/* Mobile-optimized banner with flex column on small screens */}
        <div 
          className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 md:p-5 bg-gradient-to-r ${bannerGradient} rounded-xl shadow-sm backdrop-blur-sm border ${borderColor}`}
        >
          <div className="flex items-center justify-center md:justify-start">
            <div className="relative">
              <div 
                className={`absolute -inset-1 bg-gradient-to-br ${accentFrom} ${accentTo} rounded-full opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300`}
              ></div>
              <div className={`relative h-14 w-14 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md ring-2 ${ringColor} group-hover:scale-105 transition-transform duration-300`}>
                <ArrowIcon className={`h-7 w-7 ${arrowColor} animate-subtle-pulse`} />
              </div>
            </div>
            <div className="ml-4">
              <div className={`text-xs font-bold uppercase tracking-wider ${textColor}/70 text-center md:text-left`}>
                {selectedAccountId === "all" 
                  ? `Total ${isIncome ? 'Income' : 'Expenses'}` 
                  : `${accounts.find(a => a.id === selectedAccountId)?.name || 'Account'} ${isIncome ? 'Income' : 'Expenses'}`}
              </div>
              <div className={`text-2xl font-bold tracking-tight bg-clip-text text-transparent ${gradientText} text-center md:text-left`}>
                {formatCurrency(filteredTotal)}
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400 mt-1 text-center md:text-left">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} | {filteredTransactions.length} transactions
              </div>
            </div>
          </div>
          
          {/* Monthly trend indicator - centered on mobile */}
          {previousMonthTotal > 0 && (
            <div className={`flex items-center justify-center px-4 py-3 rounded-lg ${
              trendPercentage > 0 
                ? (isIncome ? 'bg-green-100/60 dark:bg-green-900/30' : 'bg-rose-100/60 dark:bg-rose-900/30') 
                : (isIncome ? 'bg-rose-100/60 dark:bg-rose-900/30' : 'bg-green-100/60 dark:bg-green-900/30')
            } border ${borderColor} lg:self-auto self-stretch`}>
              <TrendIcon 
                className={`h-7 w-7 mr-3 ${
                  trendPercentage > 0 
                    ? (isIncome ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400') 
                    : (isIncome ? 'text-rose-600 dark:text-rose-400' : 'text-green-600 dark:text-green-400')
                }`} 
              />
              <div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {trendPercentage > 0 ? 'Increased by' : 'Decreased by'} 
                </div>
                <div className={`text-lg font-bold ${
                  trendPercentage > 0 
                    ? (isIncome ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400') 
                    : (isIncome ? 'text-rose-600 dark:text-rose-400' : 'text-green-600 dark:text-green-400')
                }`}>
                  {Math.abs(trendPercentage).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">vs. previous month</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced categories list with mobile-optimized styling */}
        {filteredCategories.length > 0 ? (
          <div className={`space-y-5 transition-opacity duration-300 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
            {filteredCategories.map(([category, amount], index) => {
              // Get icon and color from precomputed data
              const categoryInfo = categoryData[category] || { 
                icon: "Tag", 
                color: "#94a3b8" 
              };
              
              // Get the icon component from Lucide
              const CategoryIcon = LucideIcons[categoryInfo.icon] || LucideIcons.Tag;
              const percent = Math.round((amount / filteredTotal) * 100);
              const transactions = filteredTransactions.filter(t => t.category === category);
              
              return (
                <div 
                  key={category} 
                  className={`group/item bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-sm border ${itemBorder} dark:border-slate-700 hover:shadow-lg transition-all animate-fade-slide-in relative overflow-hidden`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Subtle background pattern for hovered item */}
                  <div 
                    className={`absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    style={{ 
                      backgroundSize: '12px 12px',
                      backgroundImage: `radial-gradient(${categoryInfo.color}10 1px, transparent 0)`
                    }}
                  ></div>
                  
                  {/* Hover highlight for category sections */}
                  <div className={`absolute inset-0 ${hoverHighlight} transform origin-left scale-x-0 group-hover/item:scale-x-100 transition-transform duration-300 opacity-60`}></div>
                  
                  {/* Mobile-optimized layout with flex-col on small screens */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 relative">
                    <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                      <div className="relative">
                        <div 
                          className="relative w-14 h-14 rounded-xl mr-3 flex items-center justify-center shadow-sm group-hover/item:shadow-md transition-shadow"
                          style={{ 
                            backgroundColor: `${categoryInfo.color}10`
                          }}
                        >
                          <CategoryIcon 
                            className="h-6 w-6 text-current transition-transform group-hover/item:scale-110 duration-300" 
                            style={{ color: categoryInfo.color }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="capitalize text-base md:text-lg font-medium tracking-tight flex flex-wrap items-center dark:text-white">
                          {category}
                          {percent > 40 && (
                            <span className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${isIncome ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                              Top
                            </span>
                          )}
                        </span>
                        <div className="flex flex-wrap items-center mt-1 gap-2">
                          <span className="text-xs font-medium text-muted-foreground dark:text-slate-400">{percent}% of total</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">|</span>
                          <span 
                            className={`text-xs font-medium flex items-center gap-1 ${isIncome ? 'text-green-600/70 dark:text-green-500/70' : 'text-rose-600/70 dark:text-rose-500/70'}`}
                          >
                            <TagIcon className="h-3 w-3" />
                            {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex flex-col sm:items-end w-full sm:w-auto">
                      <span className={`font-bold ${amountColor} text-lg md:text-xl tracking-tight`}>
                        {formatCurrency(amount)}
                      </span>
                      <div className="flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-700/80 self-start sm:self-auto">
                        <div className="w-2 h-2 rounded-full animate-subtle-pulse" style={{ backgroundColor: categoryInfo.color }}></div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          Rank {filteredCategories.findIndex(([_, val]) => val <= amount) + 1} of {filteredCategories.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced progress bar with glow and animation */}
                  <div className="mt-4 w-full bg-slate-100/70 dark:bg-slate-700/40 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full relative transition-all duration-500 ease-out-expo group-hover/item:shadow-sm transform group-hover/item:scale-y-110"
                      style={{ 
                        width: `${Math.max(percent, 3)}%`,
                        background: `linear-gradient(90deg, ${categoryInfo.color}85, ${categoryInfo.color})`
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 dark:via-white/20 animate-shimmer"></div>
                      
                      {/* Percentage marker */}
                      <div 
                        className={`absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isIncome ? 'text-green-700 dark:text-green-400' : 'text-rose-700 dark:text-rose-400'
                        } opacity-0 group-hover/item:opacity-100 transition-opacity`}
                        style={{ right: `${Math.min(100 - percent + 2, 95)}%` }}
                      >
                        {percent}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Transaction details on hover - mobile friendly */}
                  <div 
                    className="mt-4 grid grid-cols-1 gap-1 opacity-0 max-h-0 overflow-hidden group-hover/item:opacity-100 group-hover/item:max-h-[200px] transition-all duration-300"
                    style={{ 
                      transitionProperty: 'opacity, max-height',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Recent transactions:</div>
                    {transactions.slice(0, 3).map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className={`px-3 py-2 rounded-lg flex items-center justify-between ${isIncome 
                          ? 'bg-green-50/40 dark:bg-green-900/20' 
                          : 'bg-rose-50/40 dark:bg-rose-900/20'} border ${borderColor}`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className={`h-3 w-3 ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`} />
                          <span className="text-xs dark:text-slate-300">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-xs font-medium ${isIncome ? 'text-green-700 dark:text-green-400' : 'text-rose-700 dark:text-rose-400'}`}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                    {transactions.length > 3 && (
                      <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">
                        +{transactions.length - 3} more transactions
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center py-12 px-6 text-center bg-white/70 dark:bg-slate-800/70 rounded-lg border border-dashed ${emptyBorder} dark:border-slate-700 shadow-sm`}>
            <div className={`h-20 w-20 rounded-full ${emptyBg} flex items-center justify-center mb-4 relative`}>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: isIncome ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)', animationDuration: '3s' }}></div>
              <Icon className={`h-10 w-10 ${emptyText}`} />
            </div>
            <p className={`font-medium ${emptyTextDark} text-lg`}>No {isIncome ? 'income' : 'expense'} transactions recorded yet</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">Your {isIncome ? 'income' : 'expense'} categories will appear here once you add transactions to your account.</p>
            
            <div className={`mt-6 px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-700/80 shadow-sm border ${borderColor}`}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full ${isIncome ? 'bg-green-50 dark:bg-green-900/50' : 'bg-rose-50 dark:bg-rose-900/50'} flex items-center justify-center`}>
                  <ArrowIcon className={`h-4 w-4 ${arrowColor}`} />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-medium ${textColor}`}>Tip</p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Add your first {isIncome ? 'income' : 'expense'} transaction to start tracking your categories</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Premium information footer - centered on mobile */}
        {filteredCategories.length > 0 && (
          <div className={`flex flex-col sm:flex-row justify-between items-center rounded-lg px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 mt-2 gap-2`}>
            <div className="text-center sm:text-left">Analysis based on <span className="font-medium">
              {filteredTransactions.length}</span> transactions</div>
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Enhanced animation styles */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes subtlePulse {
          0% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.85; transform: scale(1); }
        }
        
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        
        .animate-fade-slide-in {
          animation-name: fadeSlideIn;
          animation-duration: 0.8s;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: both;
        }
        
        .animate-subtle-pulse {
          animation: subtlePulse 3s ease-in-out infinite;
        }
        
        .ease-out-expo {
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </Card>
  );
}