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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
          <tr>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Masterpiece
            </th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Workspace
            </th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Created
            </th>
            <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/20 dark:divide-gray-700/50">
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
      className="hover:bg-white/50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-300 group"
      onClick={() => onNoteClick(note)}
    >
      <td className="px-8 py-6">
        <div className="flex items-center">
          {note.pinned && <PinIcon className="text-yellow-500 mr-3" />}
          {isEncrypted && (
            <span className="mr-3 text-yellow-500 bg-yellow-500/10 p-2 rounded-lg" title="Password Protected">
              🔒
            </span>
          )}
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {note.title}
            </div>
            <div className="text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
              {isEncrypted ? "This masterpiece is securely protected." : (note.content.replace(/<[^>]*>/g, '').substring(0, 80))}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          {note.folder || "General"}
        </span>
      </td>
      <td className="px-8 py-6 text-lg font-semibold text-gray-600 dark:text-gray-400">
        {new Date(note.createdAt).toLocaleDateString()}
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onNoteClick(note)}
            className="p-3 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:scale-110 bg-blue-500/10 rounded-lg"
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-3 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 hover:scale-110 bg-red-500/10 rounded-lg"
            title="Delete"
          >
            <DeleteIcon />
          </button>
          <button
            onClick={() => onExport(note._id, "pdf")}
            className="p-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 bg-gray-500/10 rounded-lg"
            title="Export PDF"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};