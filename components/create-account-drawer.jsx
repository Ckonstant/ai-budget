"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CreditCard, PiggyBank, Info, DollarSign, CheckCircle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

export function CreateAccountDrawer({ children, onAccountCreated }) {
  const [open, setOpen] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("CURRENT");
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
    mode: "onChange",
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get form data
      const formData = watch();
      console.log("Submitting account form with data:", formData);
      
      // Call the server action
      const result = await createAccount(formData);
      console.log("Account creation result:", result);
      
      if (result && result.success) {
        // Success! Show animation
        setAnimateSuccess(true);
        
        // Call the callback with the new account data
        if (typeof onAccountCreated === 'function' && result.data) {
          console.log("Calling onAccountCreated with:", result.data);
          onAccountCreated(result.data);
        }
        
        // Show success toast and close drawer
        toast.success("Account created successfully");
        
        // Close drawer after animation
        setTimeout(() => {
          reset();
          setOpen(false);
          setAnimateSuccess(false);
        }, 1000);
      } else {
        toast.error(result?.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Error in account creation:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  const getAccountTypeIcon = () => {
    switch(selectedAccountType) {
      case "SAVINGS":
        return <PiggyBank className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
      default:
        return <CreditCard className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-w-md mx-auto dark:border-slate-700 dark:bg-slate-900">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
        
        <DrawerHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg border-b pb-5 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-md shadow-sm">
              {getAccountTypeIcon()}
            </div>
            <DrawerTitle className="text-lg text-gray-800 dark:text-slate-200">Create New Account</DrawerTitle>
          </div>
          <DrawerDescription className="text-sm text-gray-600 dark:text-slate-400">
            Add a new financial account to track your transactions and balances
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-5 dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Name Field with enhanced styling */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-slate-300"
              >
                Account Name
              </label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="e.g., Main Checking"
                  className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500/20 focus:ring-opacity-50 dark:text-white"
                  {...register("name")}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Account Type Selector with visual enhancements */}
            <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => {
                  setValue("type", value);
                  setSelectedAccountType(value);
                }}
                defaultValue={watch("type")}
              >
                <SelectTrigger 
                  id="type" 
                  className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500/20 focus:ring-opacity-50 dark:text-white"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 shadow-lg border-gray-200 dark:border-slate-700 dark:text-white">
                  <SelectItem value="CURRENT" className="focus:bg-blue-50 dark:focus:bg-blue-900/20 dark:hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <span>Current Account</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SAVINGS" className="focus:bg-emerald-50 dark:focus:bg-emerald-900/20 dark:hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <span>Savings Account</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Initial Balance with currency symbol */}
            <div className="space-y-2">
              <label
                htmlFor="balance"
                className="text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Initial Balance
              </label>
              <div className="relative">
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-blue-300 dark:focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500/20 focus:ring-opacity-50 dark:text-white"
                  {...register("balance")}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-500">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              {errors.balance && (
                <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  {errors.balance.message}
                </p>
              )}
            </div>

            {/* Set as Default with elegant toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition duration-200">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-base font-medium text-gray-700 dark:text-slate-300 cursor-pointer"
                >
                  Set as Default
                </label>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Premium styled footer with action buttons */}
        <DrawerFooter className="border-t bg-gray-50 dark:bg-slate-800 dark:border-slate-700 px-6 pb-6 pt-4">
          <div className="flex gap-4">
            <DrawerClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white text-gray-700 dark:text-slate-300 dark:bg-slate-800"
              >
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              className={`flex-1 relative ${!isValid ? 'bg-blue-400 dark:bg-blue-600/70' : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'} transition-all duration-300`}
              disabled={createAccountLoading || !isValid || isSubmitting}
              onClick={handleSubmit}
            >
              {createAccountLoading || isSubmitting ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                  <span className="opacity-0">Create Account</span>
                </>
              ) : animateSuccess ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="opacity-0">Create Account</span>
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-500 dark:text-slate-400 mt-4">
            You can edit account details and customize colors later
          </p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}