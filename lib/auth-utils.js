import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma"; // Adjust import path as needed

export async function getAuthenticatedUser() {
  try {
    // Get Clerk auth info
    const { userId } = auth();
    
    if (!userId) {
      return null;
    }
    
    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    // If user exists, return it
    if (user) {
      return user;
    }
    
    // If user doesn't exist in database, get details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    
    if (!clerkUser) {
      return null;
    }
    
    // Get email address
    const primaryEmailId = clerkUser.primaryEmailAddressId;
    const primaryEmail = clerkUser.emailAddresses.find(
      email => email.id === primaryEmailId
    )?.emailAddress;
    
    if (!primaryEmail) {
      return null;
    }
    
    // Create user in database
    const newUser = await db.user.create({
      data: {
        clerkUserId: userId,
        email: primaryEmail,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || primaryEmail,
        imageUrl: clerkUser.imageUrl || "",
      },
    });
    
    // Create a default account for new users
    await db.account.create({
      data: {
        userId: newUser.id,
        name: "My Account",
        type: "CURRENT",
        balance: 0,
        isDefault: true,
      },
    });
    
    return newUser;
  } catch (error) {
    console.error("Error in getAuthenticatedUser:", error);
    return null;
  }
}