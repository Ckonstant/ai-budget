"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

// This is a temporary in-memory storage since we don't have a database yet
// In a real app, you'd use your Prisma client to interact with the database
let notesStore = [
  {
    id: "1",
    title: "Monthly Budget Planning",
    content: "Need to allocate $500 for groceries, $200 for utilities, and $300 for entertainment this month. Remember to set aside 20% of income for savings.",
    category: "budget",
    labels: ["planning", "monthly"],
    createdAt: new Date("2025-03-20").toISOString(),
    updatedAt: new Date("2025-03-22").toISOString(),
  },
  {
    id: "2",
    title: "Investment Strategies for 2025",
    content: "Research index funds vs ETFs. Consider increasing 401k contribution to 15%. Look into dividend stocks for passive income.",
    category: "investment",
    labels: ["stocks", "retirement", "planning"],
    createdAt: new Date("2025-03-15").toISOString(),
    updatedAt: new Date("2025-03-15").toISOString(),
  },
  {
    id: "3",
    title: "Debt Payoff Schedule",
    content: "Pay off credit card ($2,500) by June. Then focus on student loans. Use snowball method - smallest debts first to build momentum.",
    category: "debt",
    labels: ["planning", "payoff"],
    createdAt: new Date("2025-03-10").toISOString(),
    updatedAt: new Date("2025-03-14").toISOString(),
  },
];

/**
 * Get all notes
 */
export async function getNotes() {
  // In a real app with a database:
  // return await prisma.note.findMany({
  //   orderBy: { updatedAt: 'desc' }
  // });
  
  // Return sample data sorted by updatedAt
  return [...notesStore].sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}

/**
 * Create a new note
 */
export async function createNote({ title, content, category, labels }) {
  try {
    const now = new Date().toISOString();
    
    const newNote = {
      id: uuidv4(),
      title,
      content,
      category,
      labels: labels || [],
      createdAt: now,
      updatedAt: now,
    };
    
    // In a real app with a database:
    // const newNote = await prisma.note.create({
    //   data: { title, content, category, labels, userId: session.user.id }
    // });
    
    // Add to our in-memory store
    notesStore = [newNote, ...notesStore];
    
    revalidatePath("/notes");
    return newNote;
  } catch (error) {
    console.error("Error creating note:", error);
    throw new Error("Failed to create note");
  }
}

/**
 * Update an existing note
 */
export async function updateNote({ id, title, content, category, labels }) {
  try {
    const now = new Date().toISOString();
    
    // In a real app with a database:
    // const updatedNote = await prisma.note.update({
    //   where: { id },
    //   data: { title, content, category, labels, updatedAt: new Date() }
    // });
    
    // Find and update the note in our in-memory store
    const noteIndex = notesStore.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      throw new Error("Note not found");
    }
    
    const updatedNote = {
      ...notesStore[noteIndex],
      title,
      content,
      category,
      labels: labels || [],
      updatedAt: now,
    };
    
    notesStore[noteIndex] = updatedNote;
    
    revalidatePath("/notes");
    return updatedNote;
  } catch (error) {
    console.error("Error updating note:", error);
    throw new Error("Failed to update note");
  }
}

/**
 * Delete a note
 */
export async function deleteNote(id) {
  try {
    // In a real app with a database:
    // await prisma.note.delete({
    //   where: { id }
    // });
    
    // Remove the note from our in-memory store
    notesStore = notesStore.filter(note => note.id !== id);
    
    revalidatePath("/notes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    throw new Error("Failed to delete note");
  }
}