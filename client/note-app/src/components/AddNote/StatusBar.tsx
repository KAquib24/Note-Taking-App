import { Editor } from "@tiptap/react";

interface StatusBarProps {
  passwordState: any;
  editor: Editor | null;
}

export const StatusBar = ({ passwordState, editor }: StatusBarProps) => {
  const wordCount = editor?.getText().split(/\s+/).length || 0;
  const charCount = editor?.getText().length || 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Page 1</span>
          <span>100%</span>
          {passwordState.isPasswordProtected && (
            <span>{passwordState.isUnlocked ? "🔓 Unlocked" : "🔒 Protected"}</span>
          )}
        </div>
      </div>
    </div>
  );
};