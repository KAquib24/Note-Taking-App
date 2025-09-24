import { EditorContent } from "@tiptap/react";
import { Editor } from "@tiptap/react";

interface EditorAreaProps {
  title: string;
  onTitleChange: (title: string) => void;
  formData: any;
  passwordState: any;
  editor: Editor | null;
}

export const EditorArea = ({ title, onTitleChange, formData, passwordState, editor }: EditorAreaProps) => {
  return (
    <div className="flex-1 bg-white dark:bg-gray-800">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Document Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="max-w-4xl mx-auto">
              <input
                type="text"
                placeholder="Document Title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full text-3xl font-light bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white mb-2"
                required
              />
              
              <DocumentMetadata formData={formData} passwordState={passwordState} />
            </div>
          </div>

          {/* Editor Area */}
          <div className="min-h-[600px] bg-white dark:bg-gray-800 shadow-inner border border-gray-200 dark:border-gray-700">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentMetadata = ({ formData, passwordState }: any) => (
  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
      </svg>
      <span>Folder: {formData.folder || "General"}</span>
    </div>
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <span>Tags: {formData.tags || "None"}</span>
    </div>
    {passwordState.isPasswordProtected && (
      <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
        <span className="text-yellow-800 dark:text-yellow-200">
          {passwordState.isUnlocked ? "🔓 Unlocked" : "🔒 Password Protected"}
        </span>
      </div>
    )}
  </div>
);

// Make sure to export as default as well for flexibility
export default EditorArea;