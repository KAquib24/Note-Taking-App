import { useState } from "react";
import EncryptionToggle from "./EncryptionToggle";
import PasswordModal from "./PasswordModel";
import { encryptText, decryptText, isEncryptedContent, storeEncryptionKey } from "../lib/crypto";

interface NoteFormProps {
  title: string;
  setTitle: (title: string) => void;
  tags: string;
  setTags: (tags: string) => void;
  folder: string;
  setFolder: (folder: string) => void;
  folders: string[];
  newFolder: string;
  setNewFolder: (newFolder: string) => void;
  files: File[];
  handleFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dueDate: string;
  setDueDate: (dueDate: string) => void;
  reminder: string | number;
  setReminder: (reminder: string | number) => void;
  content: string;
  setContent: (content: string) => void;
  isEncrypted: boolean;
  setIsEncrypted: (encrypted: boolean) => void;
  noteId?: string;
}

const NoteForm = ({
  title,
  setTitle,
  tags,
  setTags,
  folder,
  setFolder,
  folders,
  newFolder,
  setNewFolder,
  files,
  handleFilesChange,
  dueDate,
  setDueDate,
  reminder,
  setReminder,
  content,
  setContent,
  isEncrypted,
  setIsEncrypted,
  noteId
}: NoteFormProps) => {
  const [showEncryptionWarning, setShowEncryptionWarning] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleEncryptionToggle = () => {
    if (!isEncrypted) {
      // Turning encryption ON - show warning first
      setShowEncryptionWarning(true);
    } else {
      // Turning encryption OFF
      if (isEncryptedContent(content)) {
        // If content is encrypted, we need the password to decrypt it
        setShowPasswordModal(true);
      } else {
        // Content is not encrypted, just toggle off
        setIsEncrypted(false);
      }
    }
  };

  const confirmEncryption = () => {
    // Show password modal to get encryption password
    setShowEncryptionWarning(false);
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = (password: string) => {
    if (isEncrypted) {
      // Decrypting - remove encryption
      try {
        const decryptedContent = decryptText(content, password);
        setContent(decryptedContent);
        setIsEncrypted(false);
        if (noteId) {
          // Remove the stored key when disabling encryption
          // Note: In a real app, you might want to verify the password first
          // by trying to decrypt a small portion or using a hash verification
        }
      } catch (error: any) {
        alert('Failed to decrypt: ' + error.message);
        return;
      }
    } else {
      // Encrypting - apply encryption
      try {
        const encryptedContent = encryptText(content, password);
        setContent(encryptedContent);
        setIsEncrypted(true);
        if (noteId) {
          // Store the encryption key for this note
          storeEncryptionKey(noteId, password);
        }
      } catch (error: any) {
        alert('Failed to encrypt: ' + error.message);
        return;
      }
    }
    setShowPasswordModal(false);
  };

  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      {/* Encryption Warning Modal */}
      {showEncryptionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">🔒 Enable Encryption</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Once encrypted, your note content will be secured. Make sure to remember your encryption password as there is no way to recover encrypted content without it.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEncryptionWarning(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmEncryption}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
        title={isEncrypted ? "Enter Password to Disable Encryption" : "Set Encryption Password"}
        message={isEncrypted 
          ? "Enter the password to decrypt this note and disable encryption." 
          : "Set a password to encrypt this note. You'll need this password to view the note later."
        }
        noteTitle={title}
      />

      {/* Title + Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Folder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Folder</label>
          <select
            value={folder}
            onChange={(e) => {
              setFolder(e.target.value);
              setNewFolder("");
            }}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Select Folder --</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
            <option value="__new__">Add New Folder...</option>
          </select>

          {folder === "__new__" && (
            <input
              type="text"
              placeholder="New Folder Name"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              className="w-full p-2 border rounded mt-2 dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Attachments</label>
          <input
            type="file"
            multiple
            onChange={handleFilesChange}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          {files.length > 0 && (
            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {files.map((file, idx) => (
                <li key={idx} className="truncate">
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Due Date + Reminder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Reminder (minutes before)
          </label>
          <input
            type="number"
            value={reminder}
            onChange={(e) =>
              setReminder(e.target.value === "" ? "" : parseInt(e.target.value))
            }
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            min={0}
          />
        </div>
      </div>

      {/* Encryption Toggle */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <EncryptionToggle 
          isEncrypted={isEncrypted} 
          onToggle={handleEncryptionToggle} 
        />
        {isEncrypted && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Your note content is encrypted. Only you can read it with your password.
          </p>
        )}
      </div>
    </div>
  );
};

export default NoteForm;