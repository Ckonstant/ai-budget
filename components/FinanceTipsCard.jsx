"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Lightbulb, CheckCircle, RefreshCw, TrendingUp, TrendingDown, 
  DollarSign, Brain, Sparkles, ArrowRight, Shield, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFinanceTips } from "@/actions/getFinanceTips";
import { Progress } from "@/components/ui/progress";

export function FinanceTipsCard({ expenses, budget = 0, accountBalance, income, initialTips }) {
  const [tips, setTips] = useState(initialTips || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [tipCategory, setTipCategory] = useState('all');
  const [progressWidth, setProgressWidth] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Financial metrics
  const spendingRatio = income > 0 ? (expenses / income) * 100 : 0;
  const savingsRatio = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const financialHealth = calculateFinancialHealth(expenses, income, accountBalance);
  
  // Categorize tips
  const categorizedTips = {
    saving: tips.filter(tip => tip.toLowerCase().includes('save') || tip.toLowerCase().includes('saving')),
    spending: tips.filter(tip => tip.toLowerCase().includes('spend') || tip.toLowerCase().includes('budget')),
    growth: tips.filter(tip => tip.toLowerCase().includes('invest') || tip.toLowerCase().includes('grow')),
    all: tips
  };

  const displayTips = categorizedTips[tipCategory];

  // Auto rotate tips
  useEffect(() => {
    if (!showAll && displayTips.length > 0) {
      const interval = setInterval(() => {
        setActiveTipIndex((prev) => (prev + 1) % displayTips.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [displayTips, showAll]);

  // Animate progress bar without framer-motion
  useEffect(() => {
    if (financialHealth > 0) {
      setProgressWidth(0);
      const timer = setTimeout(() => {
        setProgressWidth(financialHealth);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [financialHealth]);

  const fetchTips = async () => {
    setLoading(true);
    setError(null);
    try {
      const newTips = await getFinanceTips(expenses, budget, accountBalance, income);
      setTips(newTips);
      setActiveTipIndex(0);
    } catch (err) {
      setError("Failed to fetch finance tips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function calculateFinancialHealth(expenses, income, balance) {
    if (income <= 0) return 25; // Default low score if no income
    
    // Calculate factors
    const savingsRate = income > 0 ? (income - expenses) / income : 0;
    const balanceCushion = income > 0 ? balance / income : 0;
    const expenseRatio = income > 0 ? expenses / income : 1;
    
    // Calculate score (0-100)
    let score = 0;
    score += Math.min(savingsRate * 100, 40); // Up to 40 points for savings rate
    score += Math.min(balanceCushion * 15, 40); // Up to 40 points for emergency fund
    score -= Math.max(0, Math.min((expenseRatio - 0.7) * 50, 20)); // Deduct up to 20 points for high expense ratio
    
    return Math.max(5, Math.min(Math.round(score), 100)); // Ensure score is between 5 and 100
  }

  function getHealthDescription(score) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Needs Attention";
    return "Critical";
  }

  function getHealthColor(score) {
    if (score >= 80) return "emerald";
    if (score >= 60) return "green";
    if (score >= 40) return "yellow";
    if (score >= 20) return "orange";
    return "red";
  }

  // Get tip icon based on content
  const getTipIcon = (tip) => {
    if (tip.toLowerCase().includes('save')) return Shield;
    if (tip.toLowerCase().includes('invest')) return TrendingUp;
    if (tip.toLowerCase().includes('spend')) return DollarSign;
    if (tip.toLowerCase().includes('budget')) return Target;
    return Sparkles;
  };

  // Helper function to get appropriate color classes
  const getColorClasses = (type, score) => {
    const color = getHealthColor(score);
    
    const colorMap = {
      emerald: {
        bg: "bg-emerald-500",
        bgLight: "bg-emerald-100 dark:bg-emerald-900/40",
        text: "text-emerald-700 dark:text-emerald-400"
      },
      green: {
        bg: "bg-green-500",
        bgLight: "bg-green-100 dark:bg-green-900/40",
        text: "text-green-700 dark:text-green-400"
      },
      yellow: {
        bg: "bg-yellow-500",
        bgLight: "bg-yellow-100 dark:bg-yellow-900/40",
        text: "text-yellow-700 dark:text-yellow-400"
      },
      orange: {
        bg: "bg-orange-500",
        bgLight: "bg-orange-100 dark:bg-orange-900/40",
        text: "text-orange-700 dark:text-orange-400"
      },
      red: {
        bg: "bg-red-500",
        bgLight: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-700 dark:text-red-400"
      }
    };
    
    return colorMap[color][type];
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative group dark:bg-slate-900 dark:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]">
      {/* Elegant background gradient - updated for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-white dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-slate-900 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Decorative elements */}
      <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <Brain className="h-40 w-40 text-indigo-400 dark:text-indigo-300 rotate-12" />
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-500 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      
      <CardHeader className="pb-2 relative z-10 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md">
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            AI Finance Insights
          </CardTitle>
          <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70 mt-1">
            Personalized tips based on your financial activity
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTips}
          disabled={loading}
          className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 shadow-sm"
        >
          {loading ? (
            <RefreshCw className="animate-spin h-4 w-4 mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          <span>{loading ? "Analyzing..." : "New Tips"}</span>
        </Button>
      </CardHeader>

      <CardContent className="pb-6 relative z-10">
        {/* Financial health meter */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-5 border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800 dark:text-slate-200">Financial Health Score</h3>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${getColorClasses('bgLight', financialHealth)} ${getColorClasses('text', financialHealth)}`}>
              {getHealthDescription(financialHealth)}
            </span>
          </div>
          
          <div className="relative pt-1">
            <div className="flex mb-1 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50">
                  {financialHealth}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-slate-700">
              <div 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getColorClasses('bg', financialHealth)} transition-all duration-1000 ease-out`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
          
          {/* Key financial metrics */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
              <TrendingUp className={`h-4 w-4 ${income > expenses ? "text-green-500 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`} />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Savings Rate</p>
                <p className={`text-sm font-medium ${
                  savingsRatio > 20 
                    ? "text-green-600 dark:text-green-400" 
                    : savingsRatio > 0 
                      ? "text-yellow-600 dark:text-yellow-400" 
                      : "text-red-600 dark:text-red-400"
                }`}>
                  {savingsRatio.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
              <TrendingDown className={`h-4 w-4 ${spendingRatio < 70 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`} />
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Expense Ratio</p>
                <p className={`text-sm font-medium ${
                  spendingRatio < 70 
                    ? "text-green-600 dark:text-green-400" 
                    : spendingRatio < 100 
                      ? "text-yellow-600 dark:text-yellow-400" 
                      : "text-red-600 dark:text-red-400"
                }`}>
                  {spendingRatio.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tip category selector */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {['all', 'saving', 'spending', 'growth'].map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => {
                setTipCategory(category);
                setActiveTipIndex(0);
                setShowAll(false);
              }}
              className={`rounded-full px-3 whitespace-nowrap text-xs ${
                tipCategory === category 
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' 
                  : 'text-gray-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)} Tips
            </Button>
          ))}
        </div>
        
        {error && (
          <div className="text-sm text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-3 flex items-center">
            <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-indigo-100/70 dark:bg-indigo-900/30 p-4 rounded-full">
              <RefreshCw className="h-6 w-6 text-indigo-500 dark:text-indigo-400 animate-spin" />
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-3">Analyzing your financial data...</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Generating personalized tips</p>
          </div>
        ) : displayTips && displayTips.length > 0 ? (
          <>
            {showAll ? (
              <div className="space-y-3 mt-1">
                {displayTips.map((tip, index) => {
                  const TipIcon = getTipIcon(tip);
                  return (
                    <div
                      key={index} 
                      className="flex items-start p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900/30 shadow-sm"
                      style={{ 
                        animation: 'fadeIn 0.3s ease-out forwards', 
                        animationDelay: `${index * 100}ms` 
                      }}
                    >
                      <div className="bg-indigo-50 dark:bg-indigo-900/50 p-1.5 rounded-md mr-3 mt-0.5">
                        <TipIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-slate-300">{tip}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/30 shadow-sm min-h-[120px] flex items-start">
                <div
                  key={activeTipIndex}
                  className="flex items-start animate-fadeIn"
                >
                  <div className="bg-indigo-50 dark:bg-indigo-900/50 p-1.5 rounded-md mr-3 mt-0.5">
                    {(() => {
                      const TipIcon = getTipIcon(displayTips[activeTipIndex]);
                      return <TipIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
                    })()}
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-300 mb-1">Tip #{activeTipIndex + 1}</h4>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{displayTips[activeTipIndex]}</p>
                  </div>
                </div>
                
                {/* Tip navigation dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                  {displayTips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTipIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === activeTipIndex 
                          ? 'w-4 bg-indigo-500 dark:bg-indigo-400' 
                          : 'w-1.5 bg-indigo-200 dark:bg-indigo-700 hover:bg-indigo-300 dark:hover:bg-indigo-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center"
              >
                {showAll ? "Show One at a Time" : "View All Tips"}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex items-center justify-center h-[120px]">
            <div className="text-center">
              <Lightbulb className="h-8 w-8 text-yellow-400 dark:text-yellow-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-gray-500 dark:text-slate-400">No tips available. Click "New Tips" to generate insights.</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-3 px-6 relative z-10">
        <div className="w-full text-center">
          <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">
            Powered by AI financial analysis
          </p>
        </div>
      </CardFooter>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </Card>
  );
}