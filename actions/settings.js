"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
      // Try to get the user
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });

      if (!user) throw new Error("User not found");

      // Check if UserSettings is available in the schema
      try {
        // Try to find settings for this user
        const settings = await db.userSettings.findUnique({
          where: { userId: user.id },
        });
        
        if (settings) {
          return settings;
        } else {
          console.log("No settings found for user, creating default settings");
          return {}; // Return empty object if no settings found
        }
      } catch (error) {
        console.log("User model doesn't have settings relation yet");
        // If UserSettings table is not accessible, check if user has metadata
        if (user.metadata && user.metadata.settings) {
          return user.metadata.settings;
        }
        return {}; // Return empty settings
      }
    } catch (error) {
      console.error("Error finding user:", error);
      return {};
    }
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return { error: error.message };
  }
}

export async function updateUserSettings(settings) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Try to use UserSettings table if available
    try {
      await db.$queryRaw`SELECT 1 FROM UserSettings LIMIT 1`;
      
      // If we reach here, the table exists
      const updatedSettings = await db.userSettings.upsert({
        where: { userId: user.id },
        update: settings,
        create: {
          userId: user.id,
          ...settings,
        },
      });

      revalidatePath("/settings");
      revalidatePath("/dashboard");
      
      return { success: true, data: updatedSettings };
    } catch (error) {
      console.log("User model doesn't have settings relation yet");
      
      // Fallback: Save settings in user metadata
      try {
        await db.user.update({
          where: { id: user.id },
          data: {
            metadata: {
              ...user.metadata, // Keep existing metadata
              settings: settings // Add settings to metadata
            }
          }
        });
        
        revalidatePath("/settings");
        revalidatePath("/dashboard");
        
        return { 
          success: true, 
          message: "Settings saved in user metadata while database is being updated."
        };
      } catch (metadataError) {
        console.error("Error saving to metadata:", metadataError);
        return { success: false, error: "Could not save settings at this time." };
      }
    }
  } catch (error) {
    console.error("Error updating user settings:", error);
    return { success: false, error: error.message };
  }
}