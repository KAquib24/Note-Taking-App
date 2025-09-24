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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      className={`relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${
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
  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
    <div className="flex items-start justify-between mb-2">
      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
        {note.title}
      </h3>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(note);
        }}
        className={`p-1 rounded transition-colors ${
          note.pinned
            ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900"
            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        title="Pin Note"
      >
        <PinIcon />
      </button>
      {isEncrypted && (
        <span className="p-1 rounded text-yellow-500" title="Password Protected">
          🔒
        </span>
      )}
    </div>
    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
        {note.folder || "General"}
      </span>
      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
    </div>
  </div>
);

const CardContent = ({ note, isEncrypted }: { note: Note; isEncrypted: boolean }) => (
  <div className="p-4">
    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">
      {isEncrypted ? "This note is password protected." : (note.content.replace(/<[^>]*>/g, '').substring(0, 120))}
      {!isEncrypted && note.content.length > 120 ? '...' : ''}
    </p>

    {note.tags && note.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-3">
        {note.tags.slice(0, 3).map((tag, idx) => (
          <span
            key={idx}
            className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
          >
            #{tag}
          </span>
        ))}
        {note.tags.length > 3 && (
          <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
        )}
      </div>
    )}

    {note.dueDate && (
      <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 mb-2">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
    <div className="flex space-x-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNoteClick(note);
        }}
        className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Edit"
      >
        <EditIcon />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note._id);
        }}
        className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title="Delete"
      >
        <DeleteIcon />
      </button>
    </div>

    <div className="flex space-x-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExport(note._id, "pdf");
        }}
        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        title="Export as PDF"
      >
        PDF
      </button>
    </div>
  </div>
);