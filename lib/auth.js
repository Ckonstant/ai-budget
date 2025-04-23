import { auth as getAuth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";
import { db } from "@/lib/prisma";

// Helper function to get authenticated user details
export async function getAuthenticatedUserDetails() {
  try {
    // Get Clerk user ID - try multiple approaches for better reliability
    let clerkUserId = null;
    let clerkUserObj = null;
    
    // First try getAuth()
    const authResult = getAuth();
    if (authResult?.userId) {
      clerkUserId = authResult.userId;
      console.log("Got user ID from getAuth():", clerkUserId);
    }
    
    // If that doesn't work, try getting from request headers
    if (!clerkUserId && typeof headers === 'function') {
      try {
        const headerUserId = headers().get("x-clerk-user-id");
        if (headerUserId) {
          clerkUserId = headerUserId;
          console.log("Got user ID from headers:", clerkUserId);
        }
      } catch (headerError) {
        console.error("Error getting headers:", headerError);
      }
    }
    
    // If that doesn't work, try currentUser()
    if (!clerkUserId) {
      const user = await currentUser();
      if (user?.id) {
        clerkUserId = user.id;
        clerkUserObj = user;
        console.log("Got user ID from currentUser():", clerkUserId);
      }
    }
    
    // If still no user ID, try getting from session
    if (!clerkUserId && authResult?.sessionId) {
      try {
        const session = await clerkClient.sessions.getSession(authResult.sessionId);
        if (session?.userId) {
          clerkUserId = session.userId;
          console.log("Got user ID from session:", clerkUserId);
          
          // Also get the full user object if we don't have it yet
          if (!clerkUserObj) {
            clerkUserObj = await clerkClient.users.getUser(clerkUserId);
          }
        }
      } catch (sessionError) {
        console.error("Error getting session:", sessionError);
      }
    }
    
    if (!clerkUserId) {
      console.log("No clerk user ID found with any method");
      return { error: "Unauthorized - Please sign in", clerkUserId: null, user: null };
    }
    
    console.log("Looking up user with clerk ID:", clerkUserId);
    
    // Find the user in our database
    const user = await db.user.findUnique({
      where: { clerkUserId }
    });
    
    // If no user found with this clerk ID, attempt auto-onboarding
    if (!user) {
      console.log("No user found in database for clerk ID:", clerkUserId);
      
      // Get user details from Clerk if we don't have them yet
      if (!clerkUserObj) {
        clerkUserObj = await currentUser();
        if (!clerkUserObj && clerkUserId) {
          try {
            clerkUserObj = await clerkClient.users.getUser(clerkUserId);
          } catch (userError) {
            console.error("Error getting user from Clerk:", userError);
          }
        }
      }
      
      // If we have user details, auto-create the user record
      if (clerkUserObj) {
        try {
          // Get primary email
          let email = null;
          
          if (clerkUserObj.emailAddresses?.length > 0) {
            const primaryEmail = clerkUserObj.emailAddresses.find(
              email => email.id === clerkUserObj.primaryEmailAddressId
            );
            
            email = primaryEmail?.emailAddress || clerkUserObj.emailAddresses[0].emailAddress;
          }
          
          if (!email) {
            return {
              error: "No email address found - Please update your profile",
              clerkUserId,
              clerkUserDetails: clerkUserObj,
              user: null
            };
          }
          
          // Create the user
          const newUser = await db.user.create({
            data: {
              clerkUserId,
              name: `${clerkUserObj.firstName || ''} ${clerkUserObj.lastName || ''}`.trim() || 'New User',
              email,
              imageUrl: clerkUserObj.imageUrl,
            }
          });
          
          console.log("Created new user:", newUser.id);
          
          // Also create a default account
          await db.account.create({
            data: {
              name: "Main Account",
              type: "CHECKING",
              balance: 0,
              isDefault: true,
              userId: newUser.id
            }
          });
          
          return {
            clerkUserId,
            user: newUser,
            error: null,
            newlyCreated: true
          };
        } catch (createError) {
          console.error("Error auto-creating user:", createError);
          
          // Check if user with this email already exists
          if (createError.code === 'P2002' && email) {
            try {
              // Try to find user by email and update clerkUserId
              const existingUser = await db.user.findFirst({
                where: { email }
              });
              
              if (existingUser) {
                // Update the user with the new Clerk ID
                const updatedUser = await db.user.update({
                  where: { id: existingUser.id },
                  data: { clerkUserId }
                });
                
                console.log("Updated existing user with new Clerk ID:", updatedUser.id);
                
                return {
                  clerkUserId,
                  user: updatedUser,
                  error: null
                };
              }
            } catch (updateError) {
              console.error("Error updating existing user:", updateError);
            }
          }
          
          return {
            error: "Failed to create user account",
            clerkUserId,
            clerkUserDetails: clerkUserObj,
            user: null
          };
        }
      }
      
      return {
        error: "User not found in database and couldn't auto-create account",
        clerkUserId,
        clerkUserDetails: clerkUserObj,
        user: null
      };
    }
    
    console.log("Found user in database:", user.id);
    
    // Return the successful result
    return {
      clerkUserId,
      user,
      error: null
    };
  } catch (error) {
    console.error("Error in getAuthenticatedUserDetails:", error);
    return { error: error.message || "Authentication error", clerkUserId: null, user: null };
  }
}

// Helper function to create a new user from Clerk data (for onboarding)
export async function createUserFromClerkData(clerkUserDetails) {
  try {
    if (!clerkUserDetails?.id) {
      return { error: "No Clerk user details provided" };
    }
    
    // Extract email from clerk user
    const primaryEmail = clerkUserDetails.emailAddresses?.find(
      email => email.id === clerkUserDetails.primaryEmailAddressId
    )?.emailAddress;
    
    if (!primaryEmail) {
      return { error: "No email address found for user" };
    }
    
    // Check if user already exists with this email
    const existingUser = await db.user.findFirst({
      where: { email: primaryEmail }
    });
    
    if (existingUser) {
      // Update existing user with new Clerk ID if needed
      if (existingUser.clerkUserId !== clerkUserDetails.id) {
        const updatedUser = await db.user.update({
          where: { id: existingUser.id },
          data: { clerkUserId: clerkUserDetails.id }
        });
        
        return { user: updatedUser, error: null, updated: true };
      }
      
      return { user: existingUser, error: null, existing: true };
    }
    
    // Create a new user
    const user = await db.user.create({
      data: {
        clerkUserId: clerkUserDetails.id,
        email: primaryEmail,
        name: `${clerkUserDetails.firstName || ''} ${clerkUserDetails.lastName || ''}`.trim() || 'New User',
        imageUrl: clerkUserDetails.imageUrl,
      }
    });
    
    // Create a default account for the user
    await db.account.create({
      data: {
        name: "Main Account",
        type: "CHECKING",
        balance: 0,
        isDefault: true,
        userId: user.id
      }
    });
    
    return { user, error: null, created: true };
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Check for duplicate key error
    if (error.code === 'P2002') {
      return { error: "A user with this email already exists" };
    }
    
    return { error: error.message || "Failed to create user" };
  }
}