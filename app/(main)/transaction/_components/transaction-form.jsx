"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CalendarIcon, 
  Loader2, 
  PlusCircle, 
  MinusCircle,
  ArrowRight,
  CheckCircle2,
  ArrowLeftToLine,
  ChevronDown,
  Calendar as CalendarIcon2,
  DollarSign,
  CircleHelp,
  ListTodo
} from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";
import {
  ShoppingBag, 
  Utensils, 
  Home, 
  Car, 
  Plane,
  HeartPulse, 
  Gamepad2, 
  GraduationCap,
  Laptop, 
  Shirt, 
  Coffee, 
  Banknote,
  Briefcase, 
  Gift, 
  Wallet, 
  CreditCard,
  Receipt,
  Building,
  Bus,
  Wifi,
  Smartphone,
  CircleDollarSign,
  Tag
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper function to get category icons based on category name
const getCategoryIcon = (categoryName) => {
  const lowerCaseName = categoryName.toLowerCase();
  
  // Map common category names to icons
  if (lowerCaseName.includes('shopping')) return ShoppingBag;
  if (lowerCaseName.includes('grocery') || lowerCaseName.includes('groceries')) return ShoppingBag;
  if (lowerCaseName.includes('food') || lowerCaseName.includes('restaurant') || lowerCaseName.includes('dining')) return Utensils;
  if (lowerCaseName.includes('home') || lowerCaseName.includes('rent') || lowerCaseName.includes('mortgage')) return Home;
  if (lowerCaseName.includes('car') || lowerCaseName.includes('auto') || lowerCaseName.includes('fuel')) return Car;
  if (lowerCaseName.includes('travel') || lowerCaseName.includes('flight') || lowerCaseName.includes('vacation')) return Plane;
  if (lowerCaseName.includes('health') || lowerCaseName.includes('medical') || lowerCaseName.includes('doctor')) return HeartPulse;
  if (lowerCaseName.includes('game') || lowerCaseName.includes('entertainment')) return Gamepad2;
  if (lowerCaseName.includes('education') || lowerCaseName.includes('school') || lowerCaseName.includes('college')) return GraduationCap;
  if (lowerCaseName.includes('tech') || lowerCaseName.includes('computer') || lowerCaseName.includes('software')) return Laptop;
  if (lowerCaseName.includes('cloth') || lowerCaseName.includes('apparel') || lowerCaseName.includes('fashion')) return Shirt;
  if (lowerCaseName.includes('coffee') || lowerCaseName.includes('cafe')) return Coffee;
  if (lowerCaseName.includes('salary') || lowerCaseName.includes('wage')) return Briefcase;
  if (lowerCaseName.includes('income') || lowerCaseName.includes('revenue')) return Banknote;
  if (lowerCaseName.includes('gift')) return Gift;
  if (lowerCaseName.includes('refund') || lowerCaseName.includes('return')) return Wallet;
  if (lowerCaseName.includes('invest') || lowerCaseName.includes('stock') || lowerCaseName.includes('dividend')) return CircleDollarSign;
  if (lowerCaseName.includes('credit') || lowerCaseName.includes('card')) return CreditCard;
  if (lowerCaseName.includes('bill') || lowerCaseName.includes('receipt')) return Receipt;
  if (lowerCaseName.includes('insurance')) return Building;
  if (lowerCaseName.includes('transport') || lowerCaseName.includes('transit')) return Bus;
  if (lowerCaseName.includes('internet') || lowerCaseName.includes('subscription')) return Wifi;
  if (lowerCaseName.includes('phone') || lowerCaseName.includes('mobile')) return Smartphone;
  
  // Default icon for unmatched categories
  return Tag;
};

// Update the AddTransactionForm component to accept these new props:
export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
  inDrawer = false,  // Add this prop
  onComplete = null,  // Add this prop for callback
  centered = false  // Add this prop
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const formRef = useRef(null);
  const [formStep, setFormStep] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMouseMove = (e) => {
    if (formRef.current && window.innerWidth > 768) {
      const rect = formRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting transaction form:", data);
      
      // Format the data
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount),
        date: data.date || new Date(),
      };
      
      // Call the server action
      let result;
      if (editMode && initialData?.id) {
        console.log("Updating existing transaction");
        const { updateTransaction } = await import("@/actions/transaction");
        result = await updateTransaction(initialData.id, formattedData);
      } else {
        console.log("Creating new transaction");
        const { createTransaction } = await import("@/actions/transaction");
        result = await createTransaction(formattedData);
      }
      
      console.log("Transaction result:", result);
      
      if (result && result.success) {
        console.log("Transaction successful:", result.data);
        
        // For new transactions, reset the form
        if (!editMode) {
          reset();
          setFormStep(1);
        }
        
        // Call the callback with the transaction data
        if (onComplete && typeof onComplete === 'function') {
          console.log("Calling onComplete with transaction data");
          onComplete(result.data);
        } else if (!inDrawer) {
          // Only navigate if not in drawer
          toast.success(editMode ? "Transaction updated" : "Transaction created");
          router.push(`/account/${result.data.accountId}`);
        }
      } else {
        console.error("Transaction result error:", result?.error);
        toast.error(result?.error || "Failed to save transaction");
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("An error occurred: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully", {
        style: { 
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        },
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    }
  };

  const nextStep = async () => {
    const stepValidation = await trigger(['type', 'amount', 'accountId', 'category']);
    if (stepValidation) {
      setFormStep(2);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setFormStep(1);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      
      return () => observer.disconnect();
    }
  }, []);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const amount = watch("amount");
  const selectedAccount = watch("accountId");
  
  const account = accounts.find((acc) => acc.id === selectedAccount);
  const accountColor = account?.color || "#64748b";

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const [categoryState, setCategoryState] = useState("");

  useEffect(() => {
    setValue("category", "");
    setCategoryState("");
  }, [type, setValue]);

  const handleCategoryChange = (value) => {
    setValue("category", value);
    setCategoryState(value);
  };

  const isExpense = type === "EXPENSE";
  const typeColor = isExpense ? "rose" : "emerald";
  const typeTextColor = isExpense 
    ? "text-rose-600 dark:text-rose-300" 
    : "text-emerald-600 dark:text-emerald-300";
  const typeBgColor = isExpense 
    ? "bg-rose-50 dark:bg-rose-950/40" 
    : "bg-emerald-50 dark:bg-emerald-950/40";
  const typeBorderColor = isExpense 
    ? "border-rose-100 dark:border-rose-800/50" 
    : "border-emerald-100 dark:border-emerald-800/50";
  const typeLightColor = isExpense 
    ? "text-rose-500 dark:text-rose-300" 
    : "text-emerald-500 dark:text-emerald-300";
  const typeGradientFrom = isExpense ? "from-rose-500" : "from-emerald-500";
  const typeGradientTo = isExpense ? "to-red-600" : "to-green-600";

  const formClassName = inDrawer 
    ? `${centered ? 'px-6 md:px-10 pb-6 pt-0' : 'p-0'}`
    : 'p-8';

  return (
    <div 
      ref={formRef}
      onMouseMove={handleMouseMove}
      className={`relative ${inDrawer ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl'} bg-white dark:bg-slate-900 overflow-hidden shadow-md ${inDrawer ? 'border-0' : 'border border-slate-100 dark:border-slate-800'} ${centered ? 'mx-auto' : ''}`}
    >
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              ${isExpense 
                ? 'rgba(244, 63, 94, 0.06)' 
                : 'rgba(16, 185, 129, 0.06)'} 0%, 
              transparent 60%),
            linear-gradient(to bottom, 
              ${isExpense 
                ? (isDarkMode ? 'rgba(255, 241, 242, 0.1)' : 'rgba(255, 241, 242, 0.4)') 
                : (isDarkMode ? 'rgba(236, 253, 245, 0.1)' : 'rgba(236, 253, 245, 0.4)')} 0%, 
              ${isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'} 100%)
          `
        }}
      />
      
      <div className={`relative py-6 ${centered ? 'px-6 md:px-8' : 'px-8'} border-b ${typeBorderColor} dark:border-slate-800`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight dark:text-white">
              {editMode ? "Edit Transaction" : "Add New Transaction"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {formStep === 1 ? 
                "Enter transaction details" : 
                "Add additional information"}
            </p>
          </div>
          <div 
            className={`h-12 w-12 rounded-full flex items-center justify-center ${typeBgColor} dark:bg-opacity-20`}
          >
            {isExpense ? (
              <MinusCircle className={`h-6 w-6 ${typeTextColor}`} />
            ) : (
              <PlusCircle className={`h-6 w-6 ${typeTextColor}`} />
            )}
          </div>
        </div>
        
        <div className="flex mt-6 items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep >= 1 ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="ml-2 text-sm font-medium dark:text-white">Basic Info</span>
            </div>
          </div>
          
          <div className={`h-px w-12 ${formStep >= 2 ? 'bg-slate-800 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep >= 2 ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm font-medium dark:text-white">Details</span>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className={formClassName}>
        {formStep === 1 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {!editMode && (
              <div className={`p-5 rounded-xl border ${typeBorderColor} dark:border-opacity-50 ${typeBgColor} dark:bg-opacity-10 bg-opacity-30 mb-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-medium text-lg ${typeTextColor}`}>Scan Receipt</h3>
                    <Receipt className={`h-5 w-5 ${typeTextColor}`} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Quickly add transaction details by scanning your receipt
                  </p>
                  <ReceiptScanner onScanComplete={handleScanComplete} />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-white gap-1.5">
                Transaction Type
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px] p-3 text-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm dark:text-slate-200">
                      Choose whether this transaction is an expense (money out) or income (money in)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue("type", "EXPENSE")}
                  className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                    type === "EXPENSE" 
                    ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40" 
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                    type === "EXPENSE" 
                    ? "bg-rose-100 dark:bg-rose-900/70 text-rose-600 dark:text-rose-400" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    <MinusCircle className="h-5 w-5" />
                  </div>
                  <span className={`font-medium ${
                    type === "EXPENSE" 
                    ? "text-rose-700 dark:text-rose-400" 
                    : "text-slate-600 dark:text-slate-300"
                  }`}>Expense</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Money out</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setValue("type", "INCOME")}
                  className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                    type === "INCOME" 
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40" 
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                    type === "INCOME" 
                    ? "bg-emerald-100 dark:bg-emerald-900/70 text-emerald-600 dark:text-emerald-400" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    <PlusCircle className="h-5 w-5" />
                  </div>
                  <span className={`font-medium ${
                    type === "INCOME" 
                    ? "text-emerald-700 dark:text-emerald-400" 
                    : "text-slate-600 dark:text-slate-300"
                  }`}>Income</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Money in</span>
                </button>
              </div>
              {errors.type && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1.5">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-white gap-1.5">
                Amount
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px] p-3 text-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm dark:text-slate-200">
                      Enter the transaction amount without currency symbols
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign className={`h-5 w-5 ${typeLightColor}`} />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`pl-10 text-lg py-6 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.amount ? 'border-red-300 dark:border-red-900 focus:border-red-500 dark:focus:border-red-700 focus:ring-red-500 dark:focus:ring-red-700' : 'border-slate-200 dark:border-slate-700'}`}
                  {...register("amount")}
                />
              </div>
              {errors.amount ? (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1.5">{errors.amount.message}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-1.5">Enter the transaction amount</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-white gap-1.5">
                Account
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px] p-3 text-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm dark:text-slate-200">
                      Select the account associated with this transaction
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <Select
                onValueChange={(value) => setValue("accountId", value)}
                defaultValue={getValues("accountId")}
              >
                <SelectTrigger className={`py-6 dark:bg-slate-800 dark:text-white dark:border-slate-700 ${errors.accountId ? 'border-red-300 dark:border-red-900' : 'border-slate-200 dark:border-slate-700'}`}>
                  <SelectValue placeholder="Select account">
                    {selectedAccount && (() => {
                      const acc = accounts.find(a => a.id === selectedAccount);
                      if (!acc) return "Select account";
                      return (
                        <div className="flex items-center">
                          <div 
                            className="h-4 w-4 rounded-full mr-2"
                            style={{ backgroundColor: acc.color }}
                          ></div>
                          <span>{acc.name}</span>
                          <span className="ml-1 text-slate-500 dark:text-slate-400">(${parseFloat(acc.balance).toFixed(2)})</span>
                        </div>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white dark:bg-slate-800 border dark:border-slate-700">
                  <div className="py-2 px-2 bg-slate-50 dark:bg-slate-900 mb-1 rounded-md">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Select an account</p>
                  </div>
                  {accounts.map((account) => (
                    <SelectItem 
                      key={account.id} 
                      value={account.id}
                      className="rounded-md my-0.5 focus:bg-slate-100 dark:focus:bg-slate-700 dark:text-white"
                    >
                      <div className="flex items-center">
                        <div 
                          className="h-4 w-4 rounded-full mr-2"
                          style={{ backgroundColor: account.color }}
                        ></div>
                        <span>{account.name}</span>
                        <span className="ml-1 text-slate-500 dark:text-slate-400">(${parseFloat(account.balance).toFixed(2)})</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <CreateAccountDrawer>
                      <Button
                        variant="ghost"
                        className="relative flex w-full cursor-default select-none items-center rounded-md py-2 pl-2 pr-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white dark:text-slate-300"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mr-2">+</span>
                        <span>Create New Account</span>
                      </Button>
                    </CreateAccountDrawer>
                  </div>
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1.5">{errors.accountId.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-white gap-1.5">
                Category
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px] p-3 text-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm dark:text-slate-200">
                      Categorize your transaction to better track spending patterns
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <Select
                onValueChange={handleCategoryChange}
                value={categoryState}
              >
                <SelectTrigger className={`py-6 dark:bg-slate-800 dark:text-white dark:border-slate-700 ${errors.category ? 'border-red-300 dark:border-red-900' : 'border-slate-200 dark:border-slate-700'}`}>
                  <SelectValue placeholder="Select category">
                    {categoryState && (() => {
                      const category = filteredCategories.find(c => c.id === categoryState);
                      if (!category) return null;
                      const Icon = getCategoryIcon(category.name);
                      return (
                        <div className="flex items-center">
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center mr-2 ${typeBgColor} dark:bg-opacity-40`}>
                            <Icon className={`h-4 w-4 ${typeTextColor}`} />
                          </div>
                          <span className="dark:text-white">{category.name}</span>
                        </div>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white dark:bg-slate-800 border dark:border-slate-700">
                  <div className="py-2 px-2 bg-slate-50 dark:bg-slate-900 mb-1 rounded-md">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{isExpense ? 'Expense' : 'Income'} Categories</p>
                  </div>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => {
                      const Icon = getCategoryIcon(category.name);
                      return (
                        <SelectItem 
                          key={category.id} 
                          value={category.id}
                          className="rounded-md my-0.5 focus:bg-slate-100 dark:focus:bg-slate-700 dark:text-white"
                        >
                          <div className="flex items-center">
                            <div className={`h-6 w-6 rounded-md flex items-center justify-center mr-2 ${typeBgColor} dark:bg-opacity-40`}>
                              <Icon className={`h-4 w-4 ${typeTextColor}`} />
                            </div>
                            <span className="dark:text-white">{category.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                      No categories available for this type
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 dark:text-red-400 mt-1.5">{errors.category.message}</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="button"
                className={`w-full py-6 text-base font-medium bg-gradient-to-r ${typeGradientFrom} ${typeGradientTo} hover:opacity-90 transition-opacity text-white`}
                onClick={nextStep}
                disabled={!getValues("type") || !getValues("amount") || !getValues("accountId") || !getValues("category")}
              >
                <span>Continue to Details</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className={`p-5 rounded-xl border ${typeBorderColor} dark:border-opacity-50 bg-opacity-10 ${typeBgColor} dark:bg-opacity-20 mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm`}>
              <h3 className="font-medium text-lg text-slate-800 dark:text-white mb-3">Transaction Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Type</p>
                  <div className="flex items-center mt-1">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center mr-1.5 ${typeTextColor}`}>
                      {isExpense ? <MinusCircle className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                    </div>
                    <p className={`font-medium ${typeTextColor}`}>{isExpense ? "Expense" : "Income"}</p>
                  </div>
                </div>
                <div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Account</p>
                  <div className="flex items-center mt-1">
                    <div 
                      className="h-3.5 w-3.5 rounded-full mr-1.5"
                      style={{ backgroundColor: accountColor }}
                    ></div>
                    <p className="font-medium text-slate-700 dark:text-white">
                      {account?.name || "Not selected"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Category</p>
                  {categoryState && (() => {
                    const category = filteredCategories.find(c => c.id === categoryState);
                    if (!category) return <p className="font-medium text-slate-700 dark:text-white">Not selected</p>;
                    const Icon = getCategoryIcon(category.name);
                    return (
                      <div className="flex items-center mt-1">
                        <Icon className={`h-3.5 w-3.5 mr-1.5 ${typeTextColor}`} />
                        <p className="font-medium text-slate-700 dark:text-white">{category.name}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-white gap-1.5">
                Transaction Date
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400 dark:text-slate-300" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px] p-3 text-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm dark:text-white">
                      Select the date when the transaction occurred
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start p-6 text-left font-normal border-slate-200 hover:border-slate-300 ${errors.date ? 'border-red-300' : ''}`}
                  >
                    <div className="flex items-center">
                      <CalendarIcon2 className={`mr-2 h-5 w-5 ${typeLightColor}`} />
                      {date ? (
                        <span>{format(date, "MMMM d, yyyy")}</span>
                      ) : (
                        <span className="text-slate-500">Select a date</span>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b border-slate-100">
                    <h3 className="font-medium text-sm">Select Date</h3>
                    <p className="text-xs text-slate-500">Choose when this transaction occurred</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => setValue("date", date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className={`${isExpense ? 'rose-calendar' : 'emerald-calendar'}`}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-500 mt-1.5">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-white gap-1.5">
                Description
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400 dark:text-slate-300" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[250px] p-3 text-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm dark:text-white">
                      Add notes or details about this transaction
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <ListTodo className="h-5 w-5 text-slate-400 dark:text-slate-300" />
                </div>
                <Input 
                  placeholder="Enter description (e.g. Groceries at Walmart)" 
                  className="pl-10 py-6 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  {...register("description")} 
                />
              </div>
              {errors.description ? (
                <p className="text-sm text-red-500 mt-1.5">{errors.description.message}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-1.5">Add details that help you remember this transaction</p>
              )}
            </div>

            <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all dark:bg-slate-800/50">
              <div className="space-y-1">
                <label className="text-base font-medium text-slate-800 dark:text-white">Recurring Transaction</label>
                <div className="text-sm text-slate-500 dark:text-slate-300">
                  Set up a recurring schedule for this transaction
                </div>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                className={isRecurring ? `bg-${typeColor}-500` : 'bg-slate-200 dark:bg-slate-700'}
              />
            </div>

            {isRecurring && (
              <div className="space-y-3 pt-2 pl-3 border-l-2 border-slate-200 dark:border-slate-700 animate-fadeIn">
                <label className="flex items-center text-sm font-medium text-slate-700 dark:text-white gap-1.5">
                  Recurring Interval
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CircleHelp className="h-3.5 w-3.5 text-slate-400 dark:text-slate-300" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[250px] p-3 text-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm dark:text-white">
                        How often this transaction will repeat
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <Select
                  onValueChange={(value) => setValue("recurringInterval", value)}
                  defaultValue={getValues("recurringInterval")}
                >
                  <SelectTrigger className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <SelectItem 
                      value="DAILY" 
                      className="rounded-md my-0.5 focus:bg-slate-100 dark:focus:bg-slate-700 dark:text-slate-200"
                    >
                      <div className="flex items-center">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center mr-2 ${typeBgColor} dark:bg-opacity-30`}>
                          <CalendarIcon2 className={`h-4 w-4 ${typeTextColor} dark:text-${typeColor}-400`} />
                        </div>
                        <span>Daily</span>
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="WEEKLY" 
                      className="rounded-md my-0.5 focus:bg-slate-100 dark:focus:bg-slate-700 dark:text-slate-200"
                    >
                      <div className="flex items-center">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center mr-2 ${typeBgColor} dark:bg-opacity-30`}>
                          <CalendarIcon2 className={`h-4 w-4 ${typeTextColor} dark:text-${typeColor}-400`} />
                        </div>
                        <span>Weekly</span>
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="MONTHLY" 
                      className="rounded-md my-0.5 focus:bg-slate-100 dark:focus:bg-slate-700 dark:text-slate-200"
                    >
                      <div className="flex items-center">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center mr-2 ${typeBgColor} dark:bg-opacity-30`}>
                          <CalendarIcon2 className={`h-4 w-4 ${typeTextColor} dark:text-${typeColor}-400`} />
                        </div>
                        <span>Monthly</span>
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="YEARLY" 
                      className="rounded-md my-0.5 focus:bg-slate-100 dark:focus:bg-slate-700 dark:text-slate-200"
                    >
                      <div className="flex items-center">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center mr-2 ${typeBgColor} dark:bg-opacity-30`}>
                          <CalendarIcon2 className={`h-4 w-4 ${typeTextColor} dark:text-${typeColor}-400`} />
                        </div>
                        <span>Yearly</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.recurringInterval && (
                  <p className="text-sm text-red-500 mt-1.5">
                    {errors.recurringInterval.message}
                  </p>
                )}
              </div>
            )}

            <div className={`flex justify-between items-center mt-8 ${inDrawer ? 'mb-6' : 'mb-0'}`}>
              {formStep === 2 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormStep(1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftToLine size={16} />
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {formStep === 1 ? (
                <Button
                  type="button"
                  onClick={() => setFormStep(2)}
                  className={`${isExpense ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white flex items-center gap-2`}
                  disabled={!isValid}
                >
                  Continue
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button 
                  type="submit"
                  className={`${isExpense ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white flex items-center gap-2`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editMode ? "Update" : "Save"} Transaction
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </form>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .rose-calendar .react-calendar__tile--active,
        .rose-calendar .react-calendar__tile--active:enabled:hover,
        .rose-calendar .react-calendar__tile--active:enabled:focus {
          background: #f43f5e;
          color: white;
        }
        
        .rose-calendar .react-calendar__tile--now {
          background: rgba(244, 63, 94, 0.1);
        }
        
        .emerald-calendar .react-calendar__tile--active,
        .emerald-calendar .react-calendar__tile--active:enabled:hover,
        .emerald-calendar .react-calendar__tile--active:enabled:focus {
          background: #10b981;
          color: white;
        }
        
        .emerald-calendar .react-calendar__tile--now {
          background: rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </div>
  );
}