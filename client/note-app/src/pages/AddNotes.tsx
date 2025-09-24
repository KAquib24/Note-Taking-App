import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEditor } from "@tiptap/react"; // Remove EditorContent import
import api from "../lib/axios";
import type { AddNoteLocationState } from "../types/note";
import { useNoteForm } from "../hooks/useNoteForm";
import { usePasswordProtection } from "../hooks/usePasswordProtection";
import { editorExtensions, editorProps } from "../lib/editorConfig";
import { RibbonHeader } from "../components/AddNote/RibbonHeader";
import { SidePanel } from "../components/AddNote/SidePanel";
import { EditorArea } from "../components/AddNote/EditorArea"; // This should work now
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
    content: editNote?.content || "<p>Write your note here...</p>",
    editorProps: editorProps,
  });

  const { handleUnlock, handleLock, handleProtect, handleRemoveProtection } = usePasswordProtection();

  // Handle locked note content
  useEffect(() => {
    if (editNote?.isPasswordProtected && !passwordState.isUnlocked) {
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
      alert("Please set a password for this protected note.");
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

    // Tags
    formData.tags
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean)
      .forEach((tag: string) => formDataToSend.append("tags[]", tag));

    // Files
    formData.files.forEach((file: File) => formDataToSend.append("files", file));

    // Due Date & Reminder
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
      console.error(err.response?.data || err.message);
      alert("Error saving note");
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RibbonHeader
        onSave={handleSubmit}
        onCancel={() => navigate("/dashboard")}
        onAiOpen={() => setIsAiOpen(true)}
        passwordState={passwordState}
        onPasswordAction={handlePasswordAction}
        onPasswordChange={(password) => updatePasswordState({ password })}
        editor={editor}
      />

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
          <div className="flex">
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
      background: #fef3cd;
      border: 1px solid #f59e0b;
      border-radius: 4px;
      padding: 16px;
      margin: 16px 0;
    }

    .task-item {
      display: flex;
      align-items: flex-start;
      margin: 0.5rem 0;
    }

    .task-item input[type="checkbox"] {
      margin-right: 0.5rem;
      margin-top: 0.25rem;
    }

    .prose {
      line-height: 1.6;
    }

    .prose p {
      margin-bottom: 1em;
    }

    .prose h1, .prose h2, .prose h3 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    .prose ul, .prose ol {
      margin-bottom: 1em;
    }

    .ProseMirror {
      outline: none;
      padding: 16px;
      min-height: 500px;
    }

    .ProseMirror:focus {
      outline: none;
    }

    .bg-white .text-blue-600 {
      color: #2563eb;
    }
  `}</style>
);