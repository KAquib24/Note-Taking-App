import { useState, useEffect } from "react";
import type { Note, NoteFormData, PasswordState } from "../types/note";
import api from "../lib/axios";

export const useNoteForm = (editNote?: Note) => {
  const [formData, setFormData] = useState<NoteFormData>({
    title: editNote?.title || "",
    tags: editNote?.tags?.join(", ") || "",
    folder: editNote?.folder || "",
    newFolder: "",
    dueDate: editNote?.dueDate || "",
    reminder: editNote?.reminder || "", // Fix: use string initially
    files: [],
  });

  const [passwordState, setPasswordState] = useState<PasswordState>({
    password: "",
    isPasswordProtected: editNote?.isPasswordProtected || false,
    isUnlocked: !editNote?.isPasswordProtected,
  });

  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await api.get("/notes");
        const notes: { folder?: string }[] = res.data;
        const allFolders = Array.from(
          new Set(notes.map((n) => n.folder || "General"))
        );
        setFolders(allFolders);
      } catch (err) {
        console.error("Failed to fetch folders", err);
      }
    };
    fetchFolders();
  }, []);

  const updateFormData = (updates: Partial<NoteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updatePasswordState = (updates: Partial<PasswordState>) => {
    setPasswordState(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    passwordState,
    folders,
    updateFormData,
    updatePasswordState,
  };
};