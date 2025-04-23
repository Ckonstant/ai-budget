"use client";

import { useState, useEffect } from "react";
import { FileText, Pencil, Plus, Search, TagIcon, Trash2, Star, StopCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotes, createNote, updateNote, deleteNote } from "@/actions/notes";
import { format } from "date-fns";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form state for creating/editing notes
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("general");
  const [noteLabels, setNoteLabels] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchNotes() {
      try {
        setLoading(true);
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes || []);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, []);

  // Reset form function
  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("general");
    setNoteLabels([]);
    setErrorMessage("");
    setSelectedNote(null);
    setEditMode(false);
  };

  // Handle creating a new note
  const handleCreateNote = async () => {
    if (!noteTitle.trim()) {
      setErrorMessage("Please enter a title for your note");
      return;
    }

    try {
      const newNote = await createNote({
        title: noteTitle,
        content: noteContent,
        category: noteCategory,
        labels: noteLabels,
      });

      setNotes((prev) => [newNote, ...prev]);
      resetForm();
    } catch (error) {
      console.error("Error creating note:", error);
      setErrorMessage("Failed to create note. Please try again.");
    }
  };

  // Handle updating a note
  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    
    if (!noteTitle.trim()) {
      setErrorMessage("Please enter a title for your note");
      return;
    }

    try {
      const updatedNote = await updateNote({
        id: selectedNote.id,
        title: noteTitle,
        content: noteContent,
        category: noteCategory,
        labels: noteLabels,
      });

      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      
      resetForm();
    } catch (error) {
      console.error("Error updating note:", error);
      setErrorMessage("Failed to update note. Please try again.");
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (noteId) => {
    if (!noteId) return;

    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      
      if (selectedNote?.id === noteId) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Handle selecting a note for viewing/editing
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category || "general");
    setNoteLabels(note.labels || []);
    setEditMode(false);
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter((note) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      (note.category && note.category.toLowerCase().includes(searchLower)) ||
      (note.labels &&
        note.labels.some((label) => label.toLowerCase().includes(searchLower)))
    );
  });

  // Placeholder implementation until we have the backend
  const noteCategories = [
    { value: "general", label: "General" },
    { value: "budget", label: "Budget" },
    { value: "investment", label: "Investment" },
    { value: "savings", label: "Savings" },
    { value: "debt", label: "Debt" },
    { value: "goals", label: "Financial Goals" },
    { value: "taxes", label: "Taxes" },
  ];

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 dark:bg-slate-950">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-300 dark:to-indigo-300 mb-2">
          Financial Notes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Keep track of your financial ideas, goals, and strategies
        </p>
      </div>

      {/* Main content area with left sidebar and right content panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Left sidebar with search and note list */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden border-0 shadow-xl transition-all duration-300 relative group dark:bg-slate-900 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30 opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 rounded-full transform translate-x-16 -translate-y-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-500/10 to-purple-400/5 rounded-full transform -translate-x-20 translate-y-16 blur-2xl"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-1/3 bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500 rounded-b-lg"></div>
            
            <CardHeader className="relative z-10 pb-2 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
                  My Notes
                </CardTitle>
                <Button 
                  size="sm" 
                  className="h-8 px-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                  onClick={() => {
                    resetForm();
                    setEditMode(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pb-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-purple-300 dark:focus:border-purple-600"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Notes list */}
              <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 custom-scrollbar">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No notes match your search" : "No notes yet. Create your first note!"}
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedNote?.id === note.id
                          ? "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800 border-transparent"
                      } border flex items-start justify-between`}
                      onClick={() => handleSelectNote(note)}
                    >
                      <div className="overflow-hidden">
                        <h3 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                          {note.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-1">
                          {note.content || "No content"}
                        </p>
                        <div className="flex items-center mt-2">
                          {note.category && (
                            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300 mr-1">
                              {note.category}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {note.updatedAt
                              ? format(new Date(note.updatedAt), "MMM d, yyyy")
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 flex flex-shrink-0">
                        <button
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right content panel for viewing/editing notes */}
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="overflow-hidden border-0 shadow-xl transition-all duration-300 relative dark:bg-slate-900 h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full transform translate-x-20 -translate-y-20 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-indigo-400/5 rounded-full transform -translate-x-24 translate-y-24 blur-2xl"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-1/3 bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 rounded-b-lg"></div>
            
            <CardContent className="relative z-10 p-6">
              {editMode ? (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {selectedNote ? 'Edit Note' : 'Create New Note'}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={resetForm}
                    >
                      <StopCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                  
                  {errorMessage && (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm p-3 rounded-md mb-4">
                      {errorMessage}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <Input
                        placeholder="Note title"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value)}
                        className="w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-800 dark:text-white focus:border-purple-300 dark:focus:border-purple-600 focus:outline-none"
                      >
                        {noteCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Content
                      </label>
                      <textarea
                        placeholder="Write your note here..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={10}
                        className="w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-gray-800 dark:text-white focus:border-purple-300 dark:focus:border-purple-600 focus:outline-none resize-none"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-2"
                        onClick={selectedNote ? handleUpdateNote : handleCreateNote}
                      >
                        {selectedNote ? (
                          <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Update Note
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Save Note
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : selectedNote ? (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {selectedNote.title}
                    </h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                        onClick={() => setEditMode(true)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                        onClick={() => handleDeleteNote(selectedNote.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {selectedNote.category || "General"}
                    </span>
                    
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedNote.updatedAt
                        ? `Last updated ${format(new Date(selectedNote.updatedAt), "MMM d, yyyy")}`
                        : ""}
                    </span>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-4">
                    <div className="prose prose-purple dark:prose-invert max-w-none">
                      {selectedNote.content ? (
                        <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                          {selectedNote.content}
                        </pre>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          No content added to this note.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
                    Select a note or create a new one
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    Record your financial thoughts, goals, and strategies to keep track of your financial journey
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                    onClick={() => {
                      resetForm();
                      setEditMode(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Note
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(147, 51, 234, 0.3) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(147, 51, 234, 0.3);
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}