"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard, ChevronRight, Trash2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/use-fetch";
import { useCurrency } from "@/contexts/currency-context";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount, deleteAccount } from "@/actions/account";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AccountCard({ account, onDelete, onDefaultChanged }) {
  const { formatCurrency } = useCurrency();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateDefaultLoading, setUpdateDefaultLoading] = useState(false);
  
  const {
    id,
    name,
    type,
    balance,
    isDefault,
  } = account;

  // Account UI elements
  const isPositiveBalance = balance >= 0;
  const formattedType = type.charAt(0) + type.slice(1).toLowerCase();
  
  // Account styling
  let accentColor, bgColor;
  
  switch (type) {
    case "CHECKING":
      accentColor = "#3b82f6"; // blue-500
      bgColor = "#dbeafe"; // blue-100
      break;
    case "SAVINGS":
      accentColor = "#10b981"; // emerald-500
      bgColor = "#d1fae5"; // emerald-100
      break;
    case "CREDIT":
      accentColor = "#6366f1"; // indigo-500
      bgColor = "#e0e7ff"; // indigo-100
      break;
    case "INVESTMENT":
      accentColor = "#f59e0b"; // amber-500
      bgColor = "#fef3c7"; // amber-100
      break;
    case "CASH":
      accentColor = "#64748b"; // slate-500
      bgColor = "#f1f5f9"; // slate-100
      break;
    default:
      accentColor = "#6b7280"; // gray-500
      bgColor = "#f3f4f6"; // gray-100
  }
  
  // Account Icon component
  const AccountIcon = ({ className, style }) => {
    return <CreditCard className={className} style={style} />;
  };
  
  // Handler functions
  const handleDefaultChange = async () => {
    if (isDefault) return; // Can't unset a default account
    setUpdateDefaultLoading(true);
    
    try {
      const result = await updateDefaultAccount(id);
      if (result.success) {
        // Call the callback to update UI
        if (typeof onDefaultChanged === 'function') {
          onDefaultChanged(id);
        }
        toast.success("Default account updated");
      } else {
        toast.error(result.error || "Failed to update default account");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setUpdateDefaultLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccount(id);
      if (result.success) {
        toast.success("Account deleted successfully");
        
        // Call the onDelete callback instead of manipulating DOM directly
        if (onDelete) {
          onDelete(id);
        }
        
        // Close the dialog
        setShowDeleteDialog(false);
        
        // Remove the manual page refresh
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
      } else {
        toast.error(result.error || "Failed to delete account");
        setShowDeleteDialog(false);
      }
    } catch (error) {
      toast.error("An error occurred");
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card 
        id={`account-card-${id}`}
        className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 relative group rounded-lg dark:bg-slate-900"
      >
        <div 
          className="absolute top-0 left-0 w-full h-1.5"
          style={{ backgroundColor: accentColor }}
        ></div>
        
        <div className="block relative h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href={`/account/${id}`} className="flex items-center gap-2.5 flex-1">
              <div 
                className="w-9 h-9 rounded-md flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <AccountIcon 
                  className="h-5 w-5"
                  style={{ color: accentColor }} 
                />
              </div>
              <div>
                <CardTitle className="text-sm font-medium line-clamp-1 dark:text-white">
                  {name}
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formattedType}</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-2 z-10">
              {!isDefault && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 dark:hover:text-rose-400 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  title="Delete account"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={isDefault}
                  onClick={handleDefaultChange}
                  disabled={updateDefaultLoading}
                  className={isDefault ? "bg-blue-600" : ""}
                />
              </div>
            </div>
          </CardHeader>
          
          <Link href={`/account/${id}`} className="block">
            <CardContent className="pb-3 pt-1">
              <div className="flex items-end justify-between">
                <div className={`text-2xl font-semibold ${
                  isPositiveBalance ? 'text-slate-800 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {formatCurrency(balance)}
                </div>

                {isDefault && (
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md">
                    Default
                  </span>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="font-medium">Last updated:</span>
                <span>Today</span>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-blue-600 dark:text-blue-400">
                <span className="text-xs font-medium">View Details</span>
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </div>
            </CardFooter>
          </Link>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-full">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <AlertDialogTitle className="dark:text-white">Delete Account</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-medium text-slate-700 dark:text-white">{name}</span>? 
            </AlertDialogDescription>
            <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900 rounded-md text-rose-700 dark:text-rose-300 text-sm">
              This will permanently remove this account and all associated transactions. This action cannot be undone.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2 animate-spin"></span>
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}