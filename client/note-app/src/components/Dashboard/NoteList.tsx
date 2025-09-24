import type { Note } from "../../types/note";
import { isEncryptedContent } from "../../lib/crypto";
import { PinIcon, EditIcon, DeleteIcon } from "../icons";

interface NoteListProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, format: "pdf" | "md" | "txt") => void;
}

export const NoteList = ({ notes, onNoteClick, onDelete, onExport }: NoteListProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Note
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Folder
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {notes.map((note) => (
            <NoteRow
              key={note._id}
              note={note}
              onNoteClick={onNoteClick}
              onDelete={onDelete}
              onExport={onExport}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const NoteRow = ({ note, onNoteClick, onDelete, onExport }: {
  note: Note;
  onNoteClick: (note: Note) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, format: "pdf" | "md" | "txt") => void;
}) => {
  const isEncrypted = isEncryptedContent(note.content);

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
      onClick={() => onNoteClick(note)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          {note.pinned && <PinIcon className="text-yellow-500 mr-2" />}
          {isEncrypted && (
            <span className="mr-2 text-yellow-500" title="Password Protected">
              🔒
            </span>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {note.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {isEncrypted ? "This note is password protected." : (note.content.replace(/<[^>]*>/g, '').substring(0, 80))}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {note.folder || "General"}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {new Date(note.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onNoteClick(note)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <DeleteIcon />
          </button>
          <button
            onClick={() => onExport(note._id, "pdf")}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
            title="Export PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};