import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEncryptedContent } from "../lib/crypto";
import api from "../lib/axios";
import type { DashboardProps, Note } from "../types/note";
import { useDarkMode } from "../hooks/useDarkMode";
import { useNotes } from "../hooks/useNotes";
import { useFilteredNotes } from "../hooks/useFilteredNotes";
import { DashboardHeader } from "../components/Dashboard/DashboardHeader";
import { FolderNavigation } from "../components/Dashboard/FolderNavigation";
import { NoteGrid } from "../components/Dashboard/NoteGrid";
import { NoteList } from "../components/Dashboard/NoteList";
import { EmptyState } from "../components/Dashboard/EmptyState";
import PasswordModal from "../components/PasswordModel";

const Dashboard = ({ searchQuery, searchFilter }: DashboardProps) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useDarkMode();
  const { notes, setNotes } = useNotes();

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "title" | "folder">("date");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const filteredNotes = useFilteredNotes(notes, searchQuery, searchFilter, selectedFolder, sortBy);
  const folders = Array.from(new Set(notes.map((n) => n.folder || "General")));

  // Function to determine if note is unlocked
  const isNoteUnlocked = (noteId: string) => {
    const note = notes.find((n) => n._id === noteId);
    return note ? !note.isPasswordProtected : true;
  };

  // Delete note
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting note");
    }
  };

  // Pin/unpin note
  const togglePin = async (note: Note) => {
    try {
      const res = await api.put(`/notes/pin/${note._id}`, {});
      const updatedNote = res.data;
      setNotes((prev) => prev.map((n) => (n._id === updatedNote._id ? updatedNote : n)));
    } catch (err) {
      console.error(err);
      alert("Failed to pin/unpin note");
    }
  };

  // Export note
  const handleExport = async (id: string, format: "pdf" | "md" | "txt") => {
    try {
      const res = await api.get(`/notes/export/${id}/${format}`, { responseType: "blob" });
      const contentDisposition = res.headers["content-disposition"];
      let filename = `note-${id}.${format}`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export note");
    }
  };

  // Click note
  const handleNoteClick = async (note: Note) => {
    if (isEncryptedContent(note.content) || note.isPasswordProtected) {
      setSelectedNote(note);
      setIsPasswordModalOpen(true);
    } else {
      navigate("/add-note", { state: { note } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <DashboardHeader
        filteredNotesCount={filteredNotes.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onNewNote={() => navigate("/add-note")}
      />

      <div className="container mx-auto px-6 py-6">
        <FolderNavigation
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
        />

        {filteredNotes.length === 0 ? (
          <EmptyState
            selectedFolder={selectedFolder}
            onNewNote={() => navigate("/add-note")}
          />
        ) : viewMode === "grid" ? (
          <NoteGrid
            notes={filteredNotes}
            onNoteClick={handleNoteClick}
            onTogglePin={togglePin}
            onDelete={handleDelete}
            onExport={handleExport}
            isNoteUnlocked={isNoteUnlocked}
          />
        ) : (
          <NoteList
            notes={filteredNotes}
            onNoteClick={handleNoteClick}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        )}
      </div>

      {selectedNote && (
        <PasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          note={{
            id: selectedNote._id,
            title: selectedNote.title,
            content: selectedNote.content,
          }}
        />
      )}

      <style>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default Dashboard;
