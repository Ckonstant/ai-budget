"use server";

import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Get user's financial goals
export async function getUserGoals() {
  try {
    const user = await checkUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    const goals = await db.financialGoal.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return goals.map(goal => ({
      ...goal,
      currentAmount: goal.currentAmount.toNumber(),
      targetAmount: goal.targetAmount.toNumber(),
    }));
  } catch (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
}

// Create a new financial goal
export async function createGoal(data) {
  try {
    const user = await checkUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Validate data
    if (!data.name || !data.type || !data.targetAmount) {
      return { success: false, error: "Missing required fields" };
    }
    
    // Create goal in database
    const goal = await db.financialGoal.create({
      data: {
        name: data.name,
        type: data.type,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline ? new Date(data.deadline) : null,
        description: data.description || "",
        userId: user.id
      }
    });
    
    revalidatePath("/dashboard");
    
    return { 
      success: true, 
      data: {
        ...goal,
        currentAmount: goal.currentAmount.toNumber(),
        targetAmount: goal.targetAmount.toNumber(),
      }
    };
  } catch (error) {
    console.error("Error creating goal:", error);
    return { success: false, error: error.message };
  }
}

// Update an existing financial goal
export async function updateGoal(goalId, data) {
  try {
    const user = await checkUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Validate data
    if (!goalId || !data.name || !data.type || !data.targetAmount) {
      return { success: false, error: "Missing required fields" };
    }
    
    // Check if goal exists and belongs to user
    const existingGoal = await db.financialGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id
      }
    });
    
    if (!existingGoal) {
      return { success: false, error: "Goal not found" };
    }
    
    // Update goal
    const updatedGoal = await db.financialGoal.update({
      where: {
        id: goalId
      },
      data: {
        name: data.name,
        type: data.type,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline ? new Date(data.deadline) : null,
        description: data.description || ""
      }
    });
    
    revalidatePath("/dashboard");
    
    return { 
      success: true, 
      data: {
        ...updatedGoal,
        currentAmount: updatedGoal.currentAmount.toNumber(),
        targetAmount: updatedGoal.targetAmount.toNumber(),
      }
    };
  } catch (error) {
    console.error("Error updating goal:", error);
    return { success: false, error: error.message };
  }
}

// Delete a financial goal
export async function deleteGoal(goalId) {
  try {
    const user = await checkUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if goal exists and belongs to user
    const existingGoal = await db.financialGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id
      }
    });
    
    if (!existingGoal) {
      return { success: false, error: "Goal not found" };
    }
    
    // Delete goal
    await db.financialGoal.delete({
      where: {
        id: goalId
      }
    });
    
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: error.message };
  }
}