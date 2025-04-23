"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = Number(obj.balance);
  }
  if (obj.amount) {
    serialized.amount = Number(obj.amount);
  }
  return serialized;
};

export async function getAccountWithTransactions(accountId) {
  try {
    // Use checkUser instead of auth
    const user = await checkUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return null;
    }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) {
      console.log("Account not found");
      return null;
    }

    return {
      ...serializeDecimal(account),
      transactions: account.transactions.map(serializeDecimal),
    };
  } catch (error) {
    console.error("Error in getAccountWithTransactions:", error);
    return null;
  }
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    // Use checkUser instead of auth
    const user = await checkUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return { success: false, error: "Authentication required" };
    }

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    if (transactions.length === 0) {
      console.log("No transactions found to delete");
      return { success: false, error: "No transactions found" };
    }

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    console.error("Error in bulkDeleteTransactions:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDefaultAccount(accountId) {
  try {
    // Use checkUser instead of auth
    const user = await checkUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return { success: false, error: "Authentication required" };
    }

    // First, unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeDecimal(account) };
  } catch (error) {
    console.error("Error in updateDefaultAccount:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(accountId) {
  try {
    console.log("deleteAccount called for account:", accountId);
    
    // Use checkUser instead of auth
    const user = await checkUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return { success: false, error: "Authentication required" };
    }

    console.log("User authenticated:", user.id);

    // Check if account exists and belongs to user
    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      console.log("Account not found or doesn't belong to user");
      return { 
        success: false, 
        error: "Account not found or you don't have permission to delete it" 
      };
    }

    // Don't allow deleting default account
    if (account.isDefault) {
      console.log("Cannot delete default account");
      return { 
        success: false, 
        error: "Cannot delete the default account. Please set another account as default first." 
      };
    }

    console.log("Deleting transactions for account");
    
    // Delete related transactions first
    await db.transaction.deleteMany({
      where: {
        accountId: accountId,
        userId: user.id,
      },
    });
    
    console.log("Deleting account");
    
    // Then delete the account
    await db.account.delete({
      where: {
        id: accountId,
      },
    });

    console.log("Account deleted successfully");
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    return { success: false, error: error.message };
  }
}

// Add a new function to create accounts using checkUser
export async function createAccount(data) {
  try {
    console.log("createAccount called with data:", data);
    
    // Use checkUser instead of auth
    const user = await checkUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return { success: false, error: "Authentication required" };
    }

    console.log("User authenticated:", user.id);

    // Convert balance to float before saving
    let balanceFloat;
    try {
      // Handle different formats of balance input
      balanceFloat = typeof data.balance === 'string' 
        ? parseFloat(data.balance.replace(/,/g, ''))  // Handle commas in input
        : Number(data.balance);
        
      if (isNaN(balanceFloat)) {
        console.error("Invalid balance value:", data.balance);
        return { success: false, error: "Invalid balance amount" };
      }
      
      console.log("Parsed balance:", balanceFloat);
    } catch (parseError) {
      console.error("Error parsing balance:", parseError, "Value was:", data.balance);
      return { success: false, error: "Could not process balance amount" };
    }

    // Format account data properly
    const accountData = {
      name: data.name,
      type: data.type || "CURRENT",
      balance: balanceFloat,
      userId: user.id,
      isDefault: !!data.isDefault,
    };
    
    console.log("Prepared account data:", accountData);

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;
    
    console.log("Account should be default:", shouldBeDefault);

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        name: accountData.name,
        type: accountData.type,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    console.log("Account created successfully:", account);

    revalidatePath("/dashboard");
    return { 
      success: true, 
      data: account  // Return the created account
    };
  } catch (error) {
    console.error("Error in createAccount:", error);
    return { success: false, error: error.message };
  }
}