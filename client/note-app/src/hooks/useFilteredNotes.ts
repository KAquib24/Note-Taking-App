import { useMemo } from "react";
import type { Note } from "../types/note";

export const useFilteredNotes = (
  notes: Note[],
  searchQuery: string,
  searchFilter: string,
  selectedFolder: string | null,
  sortBy: "date" | "title" | "folder"
) => {
  return useMemo(() => {
    let tempNotes = notes;

    // Filter by folder
    if (selectedFolder) {
      tempNotes = tempNotes.filter((n) => n.folder === selectedFolder);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      tempNotes = tempNotes.filter((n) => {
        if (searchFilter === "title") {
          return n.title.toLowerCase().includes(lowerQuery);
        }
        if (searchFilter === "content") {
          return n.content.toLowerCase().includes(lowerQuery);
        }
        if (searchFilter === "tags") {
          return n.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
        }
        if (searchFilter === "folder") {
          return n.folder?.toLowerCase().includes(lowerQuery);
        }
        // Default search across all fields
        return (
          n.title.toLowerCase().includes(lowerQuery) ||
          n.content.toLowerCase().includes(lowerQuery) ||
          n.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          n.folder?.toLowerCase().includes(lowerQuery)
        );
      });
    }

    // Sort notes
    return [...tempNotes].sort((a, b) => {
      // Pinned notes first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Then by selected sort criteria
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "folder":
          return (a.folder || "General").localeCompare(b.folder || "General");
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [notes, searchQuery, searchFilter, selectedFolder, sortBy]);
};