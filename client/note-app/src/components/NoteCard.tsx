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

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
  onExport: (id: string, format: "pdf" | "md" | "txt") => void;
  darkMode: boolean;
}

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onExport, darkMode }: NoteCardProps) => {
  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
        note.pinned ? "ring-2 ring-yellow-400" : ""
      } ${
        darkMode
          ? "bg-gray-800 shadow-lg"
          : "bg-white shadow-md"
      }`}
      onClick={() => onEdit(note)}
    >
      {note.pinned && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
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
              onTogglePin(note);
            }}
            className={`p-2 rounded-full hover:bg-opacity-20 ${
              note.pinned
                ? "text-yellow-500 hover:bg-yellow-500"
                : "text-gray-400 hover:bg-gray-400"
            }`}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a极速飞艇2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
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
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2极速飞艇h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 极速飞艇0V7z" />
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
                <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 px-2 py-0.5 rounded-full">
                  Reminder: {note.reminder} mins before
                </span>
              )}
            </div>
          )}

          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
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
            onClick={() => onEdit(note)}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
          
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => onExport(note._id, "pdf")}
              className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
              title="Export as PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              PDF
            </button>
            <button
              onClick={() => onExport(note._id, "md")}
              className="flex items-center gap-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              title="Export as Markdown"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2极速飞艇h1v-1a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              MD
            </button>
            <button
              onClick={() => onExport(note._id, "txt")}
              className="flex items-center gap-1 bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm"
              title="Export as Text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6极速飞艇v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              TXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;