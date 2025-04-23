"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BudgetList({ budgets = [], currentExpenses = 0, accountId }) {
  const router = useRouter();
  const [editingBudget, setEditingBudget] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", amount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const nameInputRef = useRef(null);
  
  // When starting to edit, focus on the name input
  useEffect(() => {
    if (editingBudget && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingBudget]);

  const handleEdit = (budget) => {
    setEditingBudget(budget.id);
    setEditValues({ 
      name: budget.name || "Monthly Budget", 
      amount: budget.amount 
    });
  };

  const handleSave = async () => {
    if (!editingBudget) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/budget/${editingBudget}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editValues.name,
          amount: Number(editValues.amount),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update budget");
      }
      
      toast.success("Budget updated successfully");
      setEditingBudget(null);
      router.refresh(); // This refreshes the page to get updated data
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingBudget(null);
  };
  
  // If no budgets exist yet, show a message
  if (!budgets || budgets.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Budgets</h2>
        <Card className="p-6 text-center text-muted-foreground">
          <p>No budgets created yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Budgets</h2>
        <Link href="/budget" className="text-sm text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {budgets.map((budget) => {
          const progress = Math.min(100, (currentExpenses / budget.amount) * 100);
          const isOverBudget = currentExpenses > budget.amount;
          const isEditing = editingBudget === budget.id;
          
          return (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex justify-between">
                  <div className="flex items-center space-x-2 w-full">
                    {isEditing ? (
                      <Input
                        ref={nameInputRef}
                        value={editValues.name}
                        onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        className="h-8 text-lg font-medium w-1/2"
                        placeholder="Budget Name"
                      />
                    ) : (
                      <span>{budget.name || "Monthly Budget"}</span>
                    )}
                    
                    {!isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => handleEdit(budget)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center space-x-1">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                        <Input
                          type="number"
                          value={editValues.amount}
                          onChange={(e) => setEditValues(prev => ({ ...prev, amount: e.target.value }))}
                          className="h-8 pl-6 w-24"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-50"
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className={isOverBudget ? "text-red-500" : "text-green-500"}>
                      ${currentExpenses.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={progress}
                  className="h-3"
                  extraStyles={isOverBudget ? "bg-red-500" : "bg-green-500"}
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span>{progress.toFixed(0)}% used</span>
                  <span className={isOverBudget ? "text-red-500" : "text-green-500"}>
                    {isOverBudget ? 
                      `$${(currentExpenses - budget.amount).toFixed(2)} over budget` : 
                      `$${(budget.amount - currentExpenses).toFixed(2)} remaining`}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full py-8">
            <Plus className="h-10 w-10 mb-2" />
            <p className="text-sm font-medium">Create New Budget</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}