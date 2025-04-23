"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser"; 
import { revalidatePath } from "next/cache";

// Helper for serializing decimal values
const serializeDecimal = (obj) => {
  if (!obj) return obj;
  
  const serialized = { ...obj };
  if (obj.amount) {
    serialized.amount = Number(obj.amount);
  }
  if (obj.spentAmount) {
    serialized.spentAmount = Number(obj.spentAmount);
  }
  return serialized;
};

// Create a new budget
export async function saveBudget(budgetData) {
  try {
    console.log("saveBudget called with:", budgetData);
    
    // Get user from database using checkUser
    const user = await checkUser();
    
    if (!user) {
      console.error("No user found in saveBudget");
      return { error: "User not found - Please sign in again" };
    }
    
    console.log("Found user:", user.id);
    
    // Data validation
    if (!budgetData.name || !budgetData.amount) {
      return { error: "Budget name and amount are required" };
    }

    if (isNaN(parseFloat(budgetData.amount)) || parseFloat(budgetData.amount) <= 0) {
      return { error: "Budget amount must be a positive number" };
    }

    // Create a new budget
    const budget = await db.budget.create({
      data: {
        name: budgetData.name,
        amount: parseFloat(budgetData.amount),
        category: budgetData.category || "general",
        userId: user.id,
        spentAmount: 0,
        createdAt: new Date()
      }
    });

    console.log("Successfully created budget:", budget.id);
    
    revalidatePath("/dashboard");
    
    return { 
      success: true, 
      budget: serializeDecimal(budget)
    };
  } catch (error) {
    console.error("Failed to save budget:", error);
    
    // More detailed error handling
    if (error.code === 'P2002') {
      return { error: "A budget with this name already exists" };
    }
    
    if (error.code === 'P2003') {
      return { error: "User account not found. Please refresh the page and try again." };
    }
    
    return { 
      error: "Failed to save budget. Please try again." 
    };
  }
}

// Similarly update getUserBudgets, deleteBudget, and updateBudgetAmount to use checkUser()
export async function getUserBudgets() {
  try {
    // Get user using checkUser
    const user = await checkUser();
    
    if (!user) {
      console.log("No user found in getUserBudgets");
      return [];
    }

    console.log("Getting budgets for user:", user.id);
    
    // Get current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all budgets
    const budgets = await db.budget.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${budgets.length} budgets for user`);

    // If there are no budgets, return early
    if (budgets.length === 0) {
      return [];
    }

    // Get transactions for the current month by category
    const transactions = await db.transaction.findMany({
      where: { 
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      }
    });

    console.log(`Found ${transactions.length} transactions for this month`);

    // Calculate spent amount for each budget based on transaction categories
    const updatedBudgets = await Promise.all(budgets.map(async (budget) => {
      try {
        // Find transactions that match this budget's category
        const categoryTransactions = transactions.filter(t => t.category === budget.category);
        const spentAmount = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        
        console.log(`Budget ${budget.name}: spent ${spentAmount} of ${budget.amount}`);
        
        // Update the spent amount in the database
        await db.budget.update({
          where: { id: budget.id },
          data: { spentAmount }
        });
        
        return {
          ...budget,
          spentAmount,
        };
      } catch (err) {
        console.error(`Error processing budget ${budget.id}:`, err);
        return {
          ...budget,
          spentAmount: 0,
        };
      }
    }));

    // Convert Decimal to Number before returning
    return updatedBudgets.map(budget => serializeDecimal(budget));
  } catch (error) {
    console.error("Failed to fetch user budgets:", error);
    return [];
  }
}

// Delete a budget
export async function deleteBudget(id) {
  try {
    // Get user using checkUser
    const user = await checkUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Check if the budget exists and belongs to the user
    const budget = await db.budget.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!budget) {
      return { error: "Budget not found or you don't have permission to delete it" };
    }

    // Delete the budget
    await db.budget.delete({
      where: { id }
    });

    console.log("Budget deleted successfully");
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete budget:", error);
    return { error: "Failed to delete budget" };
  }
}

// Update budget amount
export async function updateBudgetAmount(id, newAmount) {
  try {
    // Get user using checkUser
    const user = await checkUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }
    
    if (!newAmount || isNaN(parseFloat(newAmount)) || parseFloat(newAmount) <= 0) {
      return { error: "Please provide a valid budget amount" };
    }
    
    // Check if the budget exists and belongs to the user
    const budget = await db.budget.findFirst({
      where: {
        id,
        userId: user.id
      }
    });
    
    if (!budget) {
      return { error: "Budget not found" };
    }
    
    // Update the budget amount
    const updatedBudget = await db.budget.update({
      where: { id },
      data: { amount: parseFloat(newAmount) }
    });
    
    revalidatePath("/dashboard");
    return { success: true, budget: serializeDecimal(updatedBudget) };
  } catch (error) {
    console.error("Failed to update budget amount:", error);
    return { error: "Failed to update budget amount" };
  }
}