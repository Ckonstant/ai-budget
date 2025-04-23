import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    // Get Clerk user
    const user = await currentUser();

    if (!user) {
      console.log("No Clerk user found");
      return null;
    }

    console.log("Checking user with Clerk ID:", user.id);

    // Try to find user by Clerk ID
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      console.log("Found existing user by Clerk ID:", loggedInUser.id);
      return loggedInUser;
    }

    // Get primary email
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress || user.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      console.log("No email address found for user");
      return null;
    }

    // Check if user exists with this email
    const userByEmail = await db.user.findUnique({
      where: { email: primaryEmail },
    });

    if (userByEmail) {
      // Update existing user with new Clerk ID
      console.log("Found user by email, updating Clerk ID");
      const updatedUser = await db.user.update({
        where: { id: userByEmail.id },
        data: { clerkUserId: user.id },
      });
      return updatedUser;
    }

    // Create new user
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'New User';
    
    console.log("Creating new user with email:", primaryEmail);
    
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: primaryEmail,
      },
    });

    // Create a default account for the new user
    await db.account.create({
      data: {
        name: "Main Account",
        type: "CURRENT",
        balance: 0,
        isDefault: true,
        userId: newUser.id
      }
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
};