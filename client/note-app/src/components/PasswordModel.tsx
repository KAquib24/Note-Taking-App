import React, { useState } from "react";
import api from "../lib/axios";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: { id: string; title: string; content: string } | null;
  onUnlockSuccess?: (id: string) => void;
  onPasswordChange?: (id: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  note,
  onUnlockSuccess,
  onPasswordChange,
}) => {
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !note) return null;

  const handleUnlock = async () => {
    try {
      const res = await api.post(`/notes/unlock/${note.id}`, { password: passwordInput });
      if (res.data.success) {
        setPasswordInput("");
        setError("");
        onUnlockSuccess && onUnlockSuccess(note.id);
        onClose();
      } else {
        setError("Incorrect password");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to unlock note");
    }
  };

  const handleRemovePassword = async () => {
    if (!passwordInput) {
      setError("Enter current password to remove it");
      return;
    }

    try {
      const res = await api.put(`/notes/remove-password/${note.id}`, { password: passwordInput });
      if (res.data.success) {
        setPasswordInput("");
        setError("");
        onPasswordChange && onPasswordChange(note.id);
        onClose();
      } else {
        setError("Incorrect password");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to remove password");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-medium mb-4">{note.title}</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        <div className="flex justify-between space-x-2">
          <button
            onClick={handleUnlock}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Unlock
          </button>
          <button
            onClick={handleRemovePassword}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
          >
            Remove Password
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PasswordModal;
