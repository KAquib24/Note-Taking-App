import { Editor } from "@tiptap/react";
import type { PasswordState } from "../types/note";

export const usePasswordProtection = () => {
  const handleUnlock = (
    editor: Editor | null, 
    editNote: any, 
    passwordState: PasswordState, 
    setPasswordState: (updates: Partial<PasswordState>) => void
  ) => {
    if (!passwordState.password) {
      alert("Please enter the password to view this note.");
      return;
    }

    // Simple password check (server-side verification would be better)
    if (editNote?.password === passwordState.password) {
      setPasswordState({ isUnlocked: true });
      editor?.commands.setContent(editNote.content);
      alert("Note unlocked successfully!");
    } else {
      alert("Wrong password. Please try again.");
    }
  };

  const handleLock = (
    editor: Editor | null,
    setPasswordState: (updates: Partial<PasswordState>) => void
  ) => {
    setPasswordState({ isUnlocked: false });
    editor?.commands.setContent(`
      <div class="locked-note">
        <div style="background: #fef3cd; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; justify-content: center;">
            <span style="font-size: 20px;">🔒</span>
            <strong style="color: #92400e;">This note is password-protected</strong>
          </div>
          <p style="color: #92400e; margin-bottom: 16px;">
            Enter the correct password to view the content.
          </p>
        </div>
      </div>
    `);
    alert("Note locked successfully!");
  };

  const handleProtect = (
    passwordState: PasswordState, 
    setPasswordState: (updates: Partial<PasswordState>) => void
  ) => {
    if (!passwordState.password) {
      alert("Please enter a password first.");
      return;
    }
    setPasswordState({ isPasswordProtected: true });
    alert("Note protected with password successfully!");
  };

  const handleRemoveProtection = (
    setPasswordState: (updates: Partial<PasswordState>) => void
  ) => {
    setPasswordState({ 
      isPasswordProtected: false, 
      password: "",
      isUnlocked: true 
    });
    alert("Password protection removed!");
  };

  return {
    handleUnlock,
    handleLock,
    handleProtect,
    handleRemoveProtection,
  };
};