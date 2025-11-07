import type { Note } from "../../types/note";
import { isEncryptedContent } from "../../lib/crypto";
import { PinIcon, EditIcon, DeleteIcon } from "../icons";

interface NoteGridProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, format: "pdf" | "md" | "txt") => void;
}

export const NoteGrid = ({ notes, onNoteClick, onTogglePin, onDelete, onExport }: NoteGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onNoteClick={onNoteClick}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          onExport={onExport}
        />
      ))}
    </div>
  );
};

const NoteCard = ({ note, onNoteClick, onTogglePin, onDelete, onExport }: {
  note: Note;
  onNoteClick: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, format: "pdf" | "md" | "txt") => void;
}) => {
  const isEncrypted = isEncryptedContent(note.content);

  return (
    <div
      className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group hover:scale-105 ${
        note.pinned ? "ring-2 ring-yellow-400" : ""
      }`}
      onClick={() => onNoteClick(note)}
    >
      <CardHeader 
        note={note} 
        isEncrypted={isEncrypted}
        onTogglePin={onTogglePin}
      />
      <CardContent note={note} isEncrypted={isEncrypted} />
      <CardActions 
        note={note} 
        onNoteClick={onNoteClick}
        onDelete={onDelete}
        onExport={onExport}
      />
    </div>
  );
};

const CardHeader = ({ note, isEncrypted, onTogglePin }: {
  note: Note;
  isEncrypted: boolean;
  onTogglePin: (note: Note) => void;
}) => (
  <div className="p-6 border-b border-white/20 dark:border-gray-700/50">
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 text-lg">
        {note.title}
      </h3>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(note);
        }}
        className={`p-2 rounded-lg transition-all duration-200 ${
          note.pinned
            ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"
            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title="Pin Note"
      >
        <PinIcon />
      </button>
      {isEncrypted && (
        <span className="p-2 rounded-lg text-yellow-500 bg-yellow-500/10" title="Password Protected">
          🔒
        </span>
      )}
    </div>
    <div className="flex items-center justify-between text-sm">
      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg font-medium">
        {note.folder || "General"}
      </span>
      <span className="text-gray-500 dark:text-gray-400 font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
    </div>
  </div>
);

const CardContent = ({ note, isEncrypted }: { note: Note; isEncrypted: boolean }) => (
  <div className="p-6">
    <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
      {isEncrypted ? "This masterpiece is securely protected." : (note.content.replace(/<[^>]*>/g, '').substring(0, 120))}
      {!isEncrypted && note.content.length > 120 ? '...' : ''}
    </p>

    {note.tags && note.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {note.tags.slice(0, 3).map((tag, idx) => (
          <span
            key={idx}
            className="inline-block bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-lg border border-white/20 dark:border-gray-600/50 font-medium"
          >
            #{tag}
          </span>
        ))}
        {note.tags.length > 3 && (
          <span className="text-xs text-gray-500 font-medium">+{note.tags.length - 3}</span>
        )}
      </div>
    )}

    {note.dueDate && (
      <div className="flex items-center text-sm text-orange-600 dark:text-orange-400 font-medium bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/20">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Due: {new Date(note.dueDate).toLocaleDateString()}
      </div>
    )}
  </div>
);

const CardActions = ({ note, onNoteClick, onDelete, onExport }: {
  note: Note;
  onNoteClick: (note: Note) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, format: "pdf" | "md" | "txt") => void;
}) => (
  <div className="flex items-center justify-between p-6 border-t border-white/20 dark:border-gray-700/50">
    <div className="flex space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNoteClick(note);
        }}
        className="p-3 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
        title="Edit"
      >
        <EditIcon />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note._id);
        }}
        className="p-3 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-110"
        title="Delete"
      >
        <DeleteIcon />
      </button>
    </div>

    <div className="flex space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExport(note._id, "pdf");
        }}
        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg hover:scale-105"
        title="Export as PDF"
      >
        Export PDF
      </button>
    </div>
  </div>
);