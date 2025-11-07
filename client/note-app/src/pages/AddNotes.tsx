import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEditor } from "@tiptap/react";
import api from "../lib/axios";
import type { AddNoteLocationState } from "../types/note";
import { useNoteForm } from "../hooks/useNoteForm";
import { usePasswordProtection } from "../hooks/usePasswordProtection";
import { editorExtensions, editorProps } from "../lib/editorConfig";
import { RibbonHeader } from "../components/AddNote/RibbonHeader";
import { SidePanel } from "../components/AddNote/SidePanel";
import { EditorArea } from "../components/AddNote/EditorArea";
import { StatusBar } from "../components/AddNote/StatusBar";
import AiToolsModal from "../components/AiToolsModel";

export default function AddNote() {
  const location = useLocation();
  const editNote = (location.state as AddNoteLocationState)?.note;
  const navigate = useNavigate();
  
  const [title, setTitle] = useState(editNote?.title || "");
  const [isAiOpen, setIsAiOpen] = useState(false);
  
  const { formData, passwordState, folders, updateFormData, updatePasswordState } = useNoteForm(editNote);
  
  const editor = useEditor({
    extensions: editorExtensions,
    content: editNote?.content || "<p>Start writing your content here...</p>",
    editorProps: editorProps,
  });

  const { handleUnlock, handleLock, handleProtect, handleRemoveProtection } = usePasswordProtection();

  // Password protected note handler
  useEffect(() => {
    if (editNote?.isPasswordProtected && !passwordState.isUnlocked) {
      editor?.commands.setContent(`
        <div class="locked-note">
          <div class="vault-container">
            <div class="vault-header">
              <span class="vault-icon">🔒</span>
              <strong class="vault-title">SECURE NOTE VAULT</strong>
            </div>
            <p class="vault-message">
              This note is protected with encryption
            </p>
            <div class="password-display">
              <span>••••••••••</span>
            </div>
            <div class="vault-footer">
              <small>Enter password to access this content</small>
            </div>
          </div>
        </div>
      `);
    } else if (editNote?.content) {
      editor?.commands.setContent(editNote.content);
    }
  }, [editNote, editor, passwordState.isUnlocked]);

  const handlePasswordAction = (action: string) => {
    switch (action) {
      case 'unlock':
        handleUnlock(editor, editNote, passwordState, updatePasswordState);
        break;
      case 'lock':
        handleLock(editor, updatePasswordState);
        break;
      case 'protect':
        handleProtect(passwordState, updatePasswordState);
        break;
      case 'remove':
        handleRemoveProtection(updatePasswordState);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordState.isPasswordProtected && !passwordState.password) {
      alert("Please set a password to protect this note");
      return;
    }

    const folderToUse = formData.newFolder.trim() || formData.folder || "General";
    const formDataToSend = new FormData();
    formDataToSend.append("title", title);
    formDataToSend.append("folder", folderToUse);
    formDataToSend.append("content", editor?.getHTML() || "");
    formDataToSend.append("isPasswordProtected", passwordState.isPasswordProtected.toString());
    
    if (passwordState.isPasswordProtected) {
      formDataToSend.append("password", passwordState.password);
    }

    // Tags processing
    formData.tags
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean)
      .forEach((tag: string) => formDataToSend.append("tags[]", tag));

    // File attachments
    formData.files.forEach((file: File) => formDataToSend.append("files", file));

    // Reminders and due dates
    if (formData.dueDate) formDataToSend.append("dueDate", formData.dueDate);
    if (formData.reminder !== "") formDataToSend.append("reminder", formData.reminder.toString());

    try {
      if (editNote) {
        await api.put(`/notes/${editNote._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/notes", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error saving note:", err.response?.data || err.message);
      alert("Error saving note. Please try again.");
    }
  };

  if (!editor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-purple-500 mx-auto mb-6"></div>
          <p className="text-white text-xl font-semibold">Loading Editor...</p>
          <p className="text-gray-400 mt-2">Preparing your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Ribbon Header */}
      <RibbonHeader
        onSave={handleSubmit}
        onCancel={() => navigate("/dashboard")}
        onAiOpen={() => setIsAiOpen(true)}
        passwordState={passwordState}
        onPasswordAction={handlePasswordAction}
        onPasswordChange={(password) => updatePasswordState({ password })}
        editor={editor}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex h-[75vh] min-h-[600px]">
            <SidePanel
              formData={formData}
              folders={folders}
              passwordState={passwordState}
              onFormChange={updateFormData}
              onPasswordChange={(password) => updatePasswordState({ password })}
              onPasswordAction={handlePasswordAction}
              onFilesChange={(files) => updateFormData({ files })}
            />
            
            <EditorArea
              title={title}
              onTitleChange={setTitle}
              formData={formData}
              passwordState={passwordState}
              editor={editor}
            />
          </div>
        </div>
      </div>

      <StatusBar passwordState={passwordState} editor={editor} />

      <AiToolsModal
        editor={editor}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      <AddNoteStyles />
    </div>
  );
}

const AddNoteStyles = () => (
  <style>{`
    .locked-note {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 40px;
    }

    .vault-container {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: 2px solid #4f46e5;
      border-radius: 16px;
      padding: 40px 24px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      max-width: 400px;
      width: 100%;
    }

    .vault-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      justify-content: center;
    }

    .vault-icon {
      font-size: 32px;
    }

    .vault-title {
      color: #e2e8f0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .vault-message {
      color: #cbd5e1;
      margin-bottom: 24px;
      font-size: 1rem;
    }

    .password-display {
      background: rgba(255, 255, 255, 0.1);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      margin-bottom: 20px;
    }

    .password-display span {
      color: #e2e8f0;
      font-family: 'Courier New', monospace;
      font-size: 1.25rem;
      letter-spacing: 3px;
      font-weight: 500;
    }

    .vault-footer small {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .ProseMirror {
      outline: none;
      padding: 24px;
      min-height: 500px;
      background: transparent;
      color: #e2e8f0;
      font-size: 16px;
      line-height: 1.7;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
      color: #e2e8f0;
      font-weight: 600;
      margin: 1.5rem 0 1rem 0;
    }

    .ProseMirror h1 {
      font-size: 2rem;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 0.5rem;
    }

    .ProseMirror h2 {
      font-size: 1.5rem;
      color: #c7d2fe;
    }

    .ProseMirror h3 {
      font-size: 1.25rem;
      color: #a5b4fc;
    }

    .task-item {
      display: flex;
      align-items: flex-start;
      margin: 0.75rem 0;
      padding: 0.75rem;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      border-left: 3px solid #4f46e5;
      transition: background-color 0.2s ease;
    }

    .task-item:hover {
      background: rgba(255,255,255,0.08);
    }
  `}</style>
);