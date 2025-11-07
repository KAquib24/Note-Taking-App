import { Editor } from "@tiptap/react";

interface StatusBarProps {
  passwordState: any;
  editor: Editor | null;
}

export const StatusBar = ({ passwordState, editor }: StatusBarProps) => {
  const wordCount = editor?.getText().split(/\s+/).length || 0;
  const charCount = editor?.getText().length || 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-slate-800 text-white px-6 py-3 text-sm backdrop-blur-xl border-t border-white/10">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Words: {wordCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="font-medium">Characters: {charCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="font-medium">Page 1</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="font-medium">100%</span>
          </div>
          {passwordState.isPasswordProtected && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-sm ${
              passwordState.isUnlocked 
                ? "bg-green-500/20 border-green-400/30 text-green-300" 
                : "bg-yellow-500/20 border-yellow-400/30 text-yellow-300"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                passwordState.isUnlocked ? "bg-green-400" : "bg-yellow-400"
              }`}></div>
              <span className="font-medium">
                {passwordState.isUnlocked ? "Unlocked" : "Protected"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};