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
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-xl z-50">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-md transform transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl">🔒</span>
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            Secure Access
          </h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
          Enter the password to access <span className="font-bold text-gray-900 dark:text-white">"{note.title}"</span>
        </p>
        
        <input
          type="password"
          placeholder="Enter your password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 font-medium"
        />
        {error && <div className="text-red-500 text-sm mt-2 font-medium bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</div>}

        <div className="flex justify-between space-x-4 mt-6">
          <button
            onClick={handleUnlock}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Unlock
          </button>
          <button
            onClick={handleRemovePassword}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Remove
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300 font-medium py-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PasswordModal;