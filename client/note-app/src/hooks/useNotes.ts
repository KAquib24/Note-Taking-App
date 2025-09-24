import { useState, useEffect } from "react";
import type { Note } from "../types/note";
import api from "../lib/axios";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await api.get("/notes");
        setNotes(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setError("Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, []);

  return { notes, loading, error, setNotes };
};