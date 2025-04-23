"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Target, 
  Save, 
  DollarSign, 
  BarChart3, 
  Sparkles, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  Check, 
  ChevronRight 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { deleteBudget, updateBudgetAmount } from "@/actions/budget";
import { useCurrency } from "@/contexts/currency-context";

export function BudgetSetterCard({ currentBudgets = [], onSaveBudget }) {
  const { formatCurrency } = useCurrency();
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [activeTab, setActiveTab] = useState("create"); // "create" or "list"
  const router = useRouter();
  
  // LOCAL STATE FOR MANAGING BUDGETS
  const [localBudgets, setLocalBudgets] = useState(currentBudgets);

  // Update local budgets whenever the prop changes
  useEffect(() => {
    setLocalBudgets(currentBudgets);
  }, [currentBudgets]);

  // Auto-switch to list tab if we have budgets and create if we don't
  useEffect(() => {
    if (localBudgets.length > 0) {
      // Set list as the default tab when budgets exist
      setActiveTab("list");
    } else {
      // Only use create tab when no budgets exist
      setActiveTab("create");
    }
  }, [localBudgets.length]);

  const handleSaveBudget = async () => {
    if (!name.trim()) {
      toast.error("Please enter a budget name");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    try {
      setSaving(true);
      
      // Create budget data object
      const budgetData = {
        name: name.trim(),
        amount: parseFloat(amount),
        category,
      };
      
      // Call the server action
      if (typeof onSaveBudget === "function") {
        const result = await onSaveBudget(budgetData);
        
        if (result && result.error) {
          throw new Error(result.error);
        }
        
        toast.success(`Budget "${name}" set successfully!`);
        
        // Add to local state immediately
        if (result && result.budget) {
          setLocalBudgets(prev => [result.budget, ...prev]);
        }
        
        // Reset form
        setName("");
        setAmount("");
        setCategory("general");
        
        // Switch to list tab if there were no budgets before
        if (localBudgets.length === 0) {
          setActiveTab("list");
        }
        
        // Refresh data in the background
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save budget:", error);
      toast.error(error.message || "Failed to save budget. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id, budgetName) => {
    try {
      // Optimistically remove from UI first
      setLocalBudgets(prev => prev.filter(budget => budget.id !== id));
      
      // Then delete from server
      const result = await deleteBudget(id);
      
      if (result.error) {
        // Restore if server fails
        setLocalBudgets(currentBudgets);
        throw new Error(result.error);
      }
      
      toast.success(`Budget "${budgetName}" deleted successfully`);
      
      // Switch to create tab if no budgets left
      if (localBudgets.length <= 1) {
        setTimeout(() => setActiveTab("create"), 300);
      }
      
      // Refresh data in the background
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to delete budget");
    }
  };

  const startEditingBudget = (budget) => {
    setEditingBudgetId(budget.id);
    setEditAmount(budget.amount.toString());
  };

  const cancelEditingBudget = () => {
    setEditingBudgetId(null);
    setEditAmount("");
  };

  const saveEditedBudget = async (id, budgetName) => {
    try {
      if (!editAmount || isNaN(parseFloat(editAmount)) || parseFloat(editAmount) <= 0) {
        toast.error("Please enter a valid budget amount");
        return;
      }

      // Optimistically update UI first
      const newAmount = parseFloat(editAmount);
      setLocalBudgets(prev => prev.map(budget => 
        budget.id === id ? {...budget, amount: newAmount} : budget
      ));
      
      // Reset edit mode
      setEditingBudgetId(null);
      
      // Then update on server
      const result = await updateBudgetAmount(id, newAmount);
      
      if (result.error) {
        // Restore original data if server fails
        setLocalBudgets(currentBudgets);
        throw new Error(result.error);
      }
      
      toast.success(`Budget "${budgetName}" updated successfully`);
      
      // Refresh data in the background
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to update budget");
    }
  };

  const budgetCategories = [
    { value: "general", label: "General Budget", icon: "💰" },
    { value: "groceries", label: "Groceries", icon: "🛒" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
    { value: "utilities", label: "Utilities", icon: "💡" },
    { value: "housing", label: "Housing", icon: "🏠" },
    { value: "transportation", label: "Transportation", icon: "🚗" },
    { value: "healthcare", label: "Healthcare", icon: "🩺" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "savings", label: "Savings Goal", icon: "💎" },
    { value: "travel", label: "Travel & Vacation", icon: "✈️" },
    { value: "shopping", label: "Shopping", icon: "🛍️" }
  ];

  const getCategoryLabel = (catValue) => {
    const cat = budgetCategories.find(c => c.value === catValue);
    return cat ? cat.label : catValue;
  };

  const getCategoryIcon = (catValue) => {
    const cat = budgetCategories.find(c => c.value === catValue);
    return cat ? cat.icon : "💰";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage < 50) return "bg-emerald-500";
    if (percentage < 80) return "bg-amber-500";
    return "bg-rose-500";
  };

  const sortedBudgets = [...localBudgets].sort((a, b) => {
    // Sort by percentage spent (descending)
    const aPercent = a.spentAmount / a.amount;
    const bPercent = b.spentAmount / b.amount;
    return bPercent - aPercent;
  });

  // Calculate totals for budget summary
  const totalBudgeted = localBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const totalSpent = localBudgets.reduce((sum, budget) => sum + Number(budget.spentAmount), 0);
  const totalPercentage = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

  // Rest of the component remains the same
  return (
    <Card className="overflow-hidden border-0 shadow-xl transition-all duration-300 relative group dark:bg-slate-900">
      {/* Premium background styling */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/30 opacity-100 transition-opacity duration-300"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 rounded-full transform translate-x-16 -translate-y-16 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-teal-500/10 to-cyan-400/5 rounded-full transform -translate-x-20 translate-y-16 blur-2xl"></div>
      
      {/* Decorative dots and lines */}
      <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-12 right-4 h-1.5 w-1.5 rounded-full bg-teal-400"></div>
        <div className="absolute top-20 right-10 h-1 w-1 rounded-full bg-cyan-500"></div>
        <div className="absolute top-16 right-16 h-2 w-2 rounded-full bg-teal-300"></div>
        <div className="absolute top-28 right-20 h-1 w-1 rounded-full bg-cyan-400"></div>
        <div className="absolute top-4 left-12 h-1.5 w-1.5 rounded-full bg-teal-400"></div>
        <div className="absolute top-10 left-20 h-1 w-1 rounded-full bg-cyan-500"></div>
        <div className="absolute top-20 left-8 h-2 w-2 rounded-full bg-teal-300"></div>
      </div>
      
      {/* Accent bar at top */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-1/3 bg-gradient-to-r from-teal-300 via-cyan-400 to-teal-300 rounded-b-lg"></div>
      
      <CardHeader className="relative z-10 pb-3 pt-5">
        {/* ... rest of component ... */}
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
              <div className="p-1.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-md text-white shadow-sm">
                <Target className="h-5 w-5" />
              </div>
              Budget Planner
            </CardTitle>
            <CardDescription className="text-teal-600/80 dark:text-teal-400/80 mt-1">
              Set spending limits for better financial control
            </CardDescription>
          </div>
          
          {/* Tabs for mobile */}
          {localBudgets.length > 0 && (
            <div className="flex bg-gray-100/80 dark:bg-slate-800/80 p-0.5 rounded-md shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-md px-3 py-1 text-xs ${activeTab === 'create' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-300'}`}
                onClick={() => setActiveTab('create')}
              >
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-md px-3 py-1 text-xs ${activeTab === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-300'}`}
                onClick={() => setActiveTab('list')}
              >
                <span className="mr-1">View</span>
                <span className="flex items-center justify-center bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300 rounded-full h-4 w-4 text-[10px]">
                  {localBudgets.length}
                </span>
              </Button>
            </div>
          )}
        </div>
        
        {/* Budget Summary - only show when there are budgets & on list tab */}
        {localBudgets.length > 0 && activeTab === 'list' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg border border-teal-100/80 dark:border-teal-800/50 shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2" />
                <h3 className="text-sm font-medium text-teal-700 dark:text-teal-300">Budget Overview</h3>
              </div>
              <div className="text-sm font-medium text-teal-800 dark:text-teal-200">
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudgeted)}
              </div>
            </div>
            <div className="mt-2 h-2 bg-teal-100 dark:bg-teal-800/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(totalPercentage)} transition-all duration-500`}
                style={{ width: `${totalPercentage}%` }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between items-center text-xs">
              <span className="text-teal-700 dark:text-teal-300">{totalPercentage}% Spent</span>
              <span className="text-teal-700 dark:text-teal-300">{formatCurrency(totalBudgeted - totalSpent)} Remaining</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-4 relative z-20 px-4 sm:px-6">
        {/* Budget Create Form - Only show when create tab is active */}
        {activeTab === 'create' && (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-teal-100 dark:border-teal-800/50 animate-fadeIn">
            {/* ... create form ... */}
            <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center">
              <div className="p-1 bg-teal-100 dark:bg-teal-800 rounded-md mr-2">
                <Target className="h-4 w-4 text-teal-600 dark:text-teal-300" />
              </div>
              Create New Budget
            </h3>
            
            <div className="space-y-4">
              {/* Budget name input with icon */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  Budget Name
                </label>
                <div className="relative">
                  <Input
                    id="budget-name"
                    placeholder="e.g., Monthly Groceries"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 bg-white dark:bg-slate-700 border-teal-100 dark:border-teal-800 focus:border-teal-300 dark:focus:border-teal-600 focus:ring-teal-200 dark:focus:ring-teal-700 pl-10 dark:text-white"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 dark:text-teal-400">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* Amount input with dollar sign */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  Budget Amount
                </label>
                <div className="relative">
                  <Input
                    id="budget-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="h-10 bg-white dark:bg-slate-700 border-teal-100 dark:border-teal-800 focus:border-teal-300 dark:focus:border-teal-600 focus:ring-teal-200 dark:focus:ring-teal-700 pl-10 dark:text-white"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 dark:text-teal-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  Budget Category
                </label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                >
                  <SelectTrigger 
                    id="budget-category"
                    className="h-10 bg-white dark:bg-slate-700 w-full border-teal-100 dark:border-teal-800 focus:border-teal-300 dark:focus:border-teal-600 focus:ring-teal-200 dark:focus:ring-teal-700 dark:text-white"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[240px] z-[200] dark:bg-slate-800 dark:border-slate-700">
                    {budgetCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="flex items-center gap-2 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-5 w-5 bg-teal-50 dark:bg-teal-900 rounded-md text-teal-600 dark:text-teal-400">
                            {cat.icon}
                          </span>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Submit button with animation */}
              <Button 
                onClick={handleSaveBudget} 
                disabled={saving}
                className="w-full h-11 text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-sm font-medium transition-all duration-300"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full mr-2"></div>
                    Setting budget...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="h-4 w-4 mr-2" />
                    Set Budget Goal
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Budget list with progress bars - Show by default when budgets exist */}
        {localBudgets.length > 0 && activeTab === 'list' && (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-teal-100 dark:border-teal-800/50 animate-fadeIn">
            {/* ... budget list ... */}
            <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-1 bg-teal-100 dark:bg-teal-900 rounded-md mr-2">
                  <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span>Your Budget Goals</span>
              </div>
              
              <span className="text-xs text-teal-600 dark:text-teal-400 font-normal flex items-center">
                <Calendar className="h-3 w-3 mr-1 inline" />
                This Month
              </span>
            </h3>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {sortedBudgets.map((budget, index) => {
                const percentage = budget.amount > 0 
                  ? Math.min(100, Math.round((budget.spentAmount / budget.amount) * 100)) 
                  : 0;
                
                const progressColor = getProgressColor(percentage);
                const isOverBudget = budget.spentAmount > budget.amount;
                
                return (
                  <div 
                    key={budget.id}
                    className={`p-3 rounded-lg border transition-all duration-200 animate-fadeSlide ${
                      isOverBudget 
                        ? 'bg-rose-50/50 dark:bg-rose-900/30 border-rose-200/70 dark:border-rose-800/70 hover:bg-rose-50 dark:hover:bg-rose-900/50 hover:border-rose-200 dark:hover:border-rose-800' 
                        : 'bg-white dark:bg-slate-800 border-teal-50/70 dark:border-teal-900/50 hover:border-teal-200 dark:hover:border-teal-800'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded-md mr-2 ${
                          isOverBudget ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400' : 'bg-teal-50 dark:bg-teal-900 text-teal-600 dark:text-teal-400'
                        }`}>
                          <span className="text-base">{getCategoryIcon(budget.category || 'general')}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white flex items-center">
                            {budget.name}
                            {isOverBudget && (
                              <div className="ml-2 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-400 text-[10px] rounded-full flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-0.5" />
                                Over budget
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>{getCategoryLabel(budget.category || 'general')}</span>
                            {budget.createdAt && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{formatDate(budget.createdAt)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {editingBudgetId === budget.id ? (
                          <div className="flex items-center">
                            <div className="relative">
                              <Input 
                                type="number" 
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="h-8 w-24 pr-8 text-right dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 ml-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                              onClick={() => saveEditedBudget(budget.id, budget.name)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                              onClick={cancelEditingBudget}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className={`font-medium mr-2 ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-teal-700 dark:text-teal-300'}`}>
                              {formatCurrency(typeof budget.amount === 'number' ? budget.amount : 0)}
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 mr-1"
                              onClick={() => startEditingBudget(budget)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                              onClick={() => handleDeleteBudget(budget.id, budget.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {formatCurrency(budget.spentAmount)} spent
                        </span>
                        <span className={`font-medium ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'}`}>
                          {percentage}% used
                        </span>
                      </div>
                      <div className="relative h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      {/* Budget status message */}
                      <div className="flex items-center justify-between mt-1.5">
                        {isOverBudget ? (
                          <div className="flex items-center text-xs text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Over budget by {formatCurrency(budget.spentAmount - budget.amount)}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(budget.amount - budget.spentAmount)} remaining
                          </div>
                        )}
                        
                        {/* Percentage indicator */}
                        <div 
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            percentage >= 90 ? 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300' :
                            percentage >= 70 ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' :
                            'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Add Budget Button */}
            <Button 
              onClick={() => setActiveTab('create')}
              variant="outline" 
              className="w-full mt-4 border-dashed border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-900/30 hover:text-teal-800 dark:hover:text-teal-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Budget
            </Button>
          </div>
        )}

        {/* Empty state with animation - Only show when no budgets exist */}
        {localBudgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center mt-4 animate-fadeIn bg-white/70 dark:bg-slate-800/70 rounded-lg border border-dashed border-teal-200/80 dark:border-teal-800/50 shadow-sm">
            <div className="relative">
              <div className="absolute -inset-4 bg-teal-400/20 dark:bg-teal-600/20 rounded-full blur-xl opacity-70 animate-pulse"></div>
              <div className="relative rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 p-3 mb-3 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white mt-3">No budgets created yet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-md">
              Create your first budget above to start tracking your financial goals
            </p>
            <div className="flex items-center mt-4 text-teal-600 dark:text-teal-400 text-sm">
              <div className="animate-bounce mr-1">
                <ChevronRight className="h-4 w-4" /> 
              </div>
              Start by setting a budget goal
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="relative z-10 pb-6 pt-0">
        <div className="text-xs text-center w-full text-teal-600/70 dark:text-teal-400/70 flex items-center justify-center">
          <span className="mr-1">💡</span>
          <span>Setting a budget helps you stay on track with your financial goals</span>
        </div>
      </CardFooter>
      
      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-fadeSlide {
          animation: fadeSlide 0.3s ease-out forwards;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(20, 184, 166, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(20, 184, 166, 0.3);
          border-radius: 6px;
        }

        /* Fix z-index for any dropdowns in this component */
        .SelectContent,
        .SelectTrigger {
          z-index: 200;
        }
      `}</style>
    </Card>
  );
}