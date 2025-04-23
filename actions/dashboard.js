"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { serializeData } from "@/lib/serializer";
import { getFinanceTips } from "@/actions/getFinanceTips";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getUserAccounts() {
  try {
    console.log("Getting user accounts...");
    
    const user = await checkUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return [];
    }
    
    console.log("Getting accounts for user:", user.id);
    
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    console.log(`Found ${accounts.length} accounts`);
    
    const formattedAccounts = accounts.map(account => ({
      ...account,
      balance: Number(account.balance),
    }));
    
    return formattedAccounts;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
}

export async function createAccount(data) {
  try {
    const user = await checkUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return { success: false, error: "Authentication required" };
    }

    const req = await request();

    const decision = await aj.protect(req, {
      userId: user.clerkUserId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        return { success: false, error: "Too many requests. Please try again later." };
      }

      return { success: false, error: "Request blocked" };
    }

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      return { success: false, error: "Invalid balance amount" };
    }

    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        name: data.name,
        type: data.type || "CURRENT",
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    console.error("Error in createAccount:", error);
    return { success: false, error: error.message };
  }
}

export async function getDashboardData() {
  try {
    const user = await checkUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return [];
    }

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return [];
  }
}

export async function getLatestDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("No authenticated user found");
      return { success: false, data: null };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      console.log("User not found");
      return { success: false, data: null };
    }

    // Get current date information for filtering
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get all needed data in parallel for efficiency
    const [accounts, transactions, budgets, goals] = await Promise.all([
      db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      
      db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        include: { account: true },
      }),
      
      db.budget.findMany({
        where: { userId: user.id },
      }),
      
      db.goal ? db.goal.findMany({
        where: { userId: user.id },
      }) : Promise.resolve([])
    ]);

    // Serialize the data to handle Decimal types
    const serializedAccounts = serializeData(accounts);
    const serializedTransactions = serializeData(transactions);
    const serializedBudgets = serializeData(budgets);
    const serializedGoals = serializeData(goals || []);
    
    // Calculate budget spending for the current month
    const currentMonthTransactions = serializedTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= firstDayOfMonth && tx.type === "EXPENSE";
    });
    
    // Update budget spending based on current month transactions
    const updatedBudgets = serializedBudgets.map(budget => {
      // Find transactions that match this budget's category
      const categoryTransactions = currentMonthTransactions.filter(
        tx => tx.category === budget.category
      );
      
      // Calculate the total spent for this budget category
      const spentAmount = categoryTransactions.reduce(
        (total, tx) => total + tx.amount, 
        0
      );
      
      // Return budget with updated spent amount
      return {
        ...budget,
        spentAmount: spentAmount
      };
    });
    
    // Rest of your calculation code...
    
    return { 
      success: true, 
      data: {
        accounts: serializedAccounts,
        transactions: serializedTransactions,
        budgets: updatedBudgets,  // Use the updated budgets with spending calculated
        goals: serializedGoals,
        // ...other data
      }
    };
  } catch (error) {
    console.error("Error fetching latest dashboard data:", error);
    return { success: false, data: null, error: error.message };
  }
}
