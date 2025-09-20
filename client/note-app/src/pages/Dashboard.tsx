import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  folder?: string;
  createdAt: string;
  attachments?: string[];
  dueDate?: string;
  reminder?: number;
  pinned?: boolean;
}

interface DashboardProps {
  searchQuery: string;
  searchFilter: string;
}

const Dashboard = ({ searchQuery, searchFilter }: DashboardProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const navigate = useNavigate();

  // ✅ Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // ✅ Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // ✅ Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/notes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch notes");

        const data = await res.json();
        setNotes(data);
        setFilteredNotes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // ✅ Apply search/filter/folder
  useEffect(() => {
    let tempNotes = notes;

    if (selectedFolder)
      tempNotes = tempNotes.filter((n) => n.folder === selectedFolder);

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      tempNotes = tempNotes.filter((n) => {
        if (searchFilter === "title")
          return n.title.toLowerCase().includes(lowerQuery);
        if (searchFilter === "content")
          return n.content.toLowerCase().includes(lowerQuery);
        if (searchFilter === "tags")
          return n.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
        if (searchFilter === "folder")
          return n.folder?.toLowerCase().includes(lowerQuery);
        return (
          n.title.toLowerCase().includes(lowerQuery) ||
          n.content.toLowerCase().includes(lowerQuery) ||
          n.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          n.folder?.toLowerCase().includes(lowerQuery)
        );
      });
    }

    setFilteredNotes(tempNotes);
  }, [notes, searchQuery, searchFilter, selectedFolder]);

  // ✅ Delete note
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setFilteredNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting note");
    }
  };

  // ✅ Toggle pin
  const togglePin = async (note: Note) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/notes/pin/${note._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedNote = await res.json();
      setNotes((prev) =>
        prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
      setFilteredNotes((prev) =>
        prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to pin/unpin note");
    }
  };

  // ✅ Export Notes - Improved version
  const handleExport = async (id: string, format: "pdf" | "md" | "txt") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/notes/export/${id}/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Export failed");

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `note-${id}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await res.blob();
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

  // ✅ Handle note click - navigate to edit page
  const handleNoteClick = (note: Note) => {
    navigate("/add-note", { state: { note } });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-700 dark:text-gray-300">Loading notes...</p>
      </div>
    );

  const folders = Array.from(new Set(notes.map((n) => n.folder || "General")));

  // ✅ Sort notes: pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Notes
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/add-note")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 极速飞艇 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2极速飞艇h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Note
            </button>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded极速飞艇-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 极速飞艇0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  Light Mode
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Folder List */}
        <div className="mb-8">
          <h2 className="text-lg font-semib极速飞艇old mb-3">Folders</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-full transition-all ${
                selectedFolder === null
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
              }`}
              onClick={() => setSelectedFolder(null)}
            >
              All
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedFolder === folder
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
                }`}
                onClick={() => setSelectedFolder(folder)}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>

        {sortedNotes.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">No notes found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedFolder ? `No notes in the "${selectedFolder}" folder` : 'Try changing your search or create a new note'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNotes.map((note) => (
              <div
                key={note._id}
                className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  note.pinned ? "ring-2 ring-yellow-400" : ""
                } ${
                  darkMode
                    ? "bg-gray-800 shadow-lg"
                    : "bg-white shadow-md"
                }`}
                onClick={() => handleNoteClick(note)}
              >
                {note.pinned && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01极速飞艇-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                    </svg>
                    Pinned
                  </div>
                )}
                
                <div className="p-5">
                  {/* Note Display */}
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold break-words pr-2">{note.title}</h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(note);
                      }}
                      className={`p-2 rounded-full hover:bg-opacity-20 ${
                        note.pinned
                          ? "text-yellow-500 hover:bg-yellow-500"
                          : "text-gray-400 hover:bg-gray-400"
                      }`}
                      aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2极速飞艇V6z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Show only a preview of the content */}
                  <div className="mt-2 mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                    {note.content.length > 150 ? '...' : ''}
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                        <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                      </svg>
                      Folder: <span className="font-medium ml-1">{note.folder || "General"}</span>
                    </div>

                    {note.dueDate && (
                      <div className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Due: <span className="font-medium ml-1">{new Date(note.dueDate).toLocaleString()}</span>
                        {note.reminder && (
                          <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 px极速飞艇-2 py-0.5 rounded-full">
                            Reminder: {note.reminder} mins before
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V极速飞艇6z" clipRule="evenodd" />
                      </svg>
                      Created: {new Date(note.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        Attachments:
                      </h3>
                      <ul className="space-y-2">
                        {note.attachments.map((file, idx) => {
                          const ext = file.split(".").pop()?.toLowerCase();
                          if (
                            ["png", "jpg", "jpeg", "gif", "webp"].includes(
                              ext || ""
                            )
                          )
                            return (
                              <li key={idx}>
                                <img
                                  src={`http://localhost:5000/${file}`}
                                  alt="attachment"
                                  className="max-w-full rounded-lg shadow-sm"
                                />
                              </li>
                            );
                          if (["mp3", "wav", "ogg"].includes(ext || ""))
                            return (
                              <li key={idx}>
                                <audio
                                  controls
                                  src={`http://localhost:5000/${file}`}
                                  className="w-full"
                                />
                              </li>
                            );
                          if (["mp4", "webm", "ogg"].includes(ext || ""))
                            return (
                              <li key={idx}>
                                <video
                                  controls
                                  src={`http://localhost:5000/${file}`}
                                  className="w-full rounded-lg shadow-sm"
                                />
                              </li>
                            );
                          return (
                            <li key={idx}>
                              <a
                                href={`http://localhost:5000/${file}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                {file.split("/").pop()}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleNoteClick(note)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-极速飞艇4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17极速飞艇h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                    
                    <div className="flex gap-1 ml-auto">
                      <button
                        onClick={() => handleExport(note._id, "pdf")}
                        className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        title="Export as PDF"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 极速飞艇0 011-1zm0 10a1 1 极速飞艇0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport(note._id, "md")}
                        className="flex items-center gap-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        title="Export as Markdown"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1极速飞艇v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        MD
                      </button>
                      <button
                        onClick={() => handleExport(note._id, "txt")}
                        className="flex items-center gap-1 bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm"
                        title="Export as Text"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        TXT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;