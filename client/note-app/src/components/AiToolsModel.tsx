import { useState } from "react";
import { Editor } from "@tiptap/react";
import api from "../lib/axios";

interface Props {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}

const AiToolsModal: React.FC<Props> = ({ editor, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolAction = async (action: () => Promise<void>, toolName: string) => {
    setActiveTool(toolName);
    await action();
  };

  const handleSummarize = async () => {
    if (!editor) return;
    setLoading(true);
    try {
      const text = editor.getText();
      const res = await api.post("/ai/summarize", { text });
      setResult(res.data.summary);
    } catch {
      setResult("❌ Error summarizing text. Please try again.");
    }
    setLoading(false);
  };

  const handleGrammar = async () => {
    if (!editor) return;
    setLoading(true);
    try {
      const text = editor.getText();
      const res = await api.post("/ai/grammar", { text });
      setResult(res.data.corrected);
    } catch {
      setResult("❌ Error correcting grammar. Please try again.");
    }
    setLoading(false);
  };

  const handleIdeas = async () => {
    if (!editor) return;
    setLoading(true);
    try {
      const topic = editor.getText();
      const res = await api.post("/ai/ideas", { topic });
      setResult(res.data.ideas);
    } catch {
      setResult("❌ Error generating ideas. Please try again.");
    }
    setLoading(false);
  };

  const handleInsert = () => {
    if (!editor || !result) return;
    editor.commands.insertContent(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-xl">
      <div className="bg-gradient-to-br from-white/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-xl p-8 rounded-3xl w-11/12 max-w-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 transform transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Assistant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:scale-110 border border-white/20 dark:border-gray-600/50"
          >
            ✕
          </button>
        </div>

        {/* Tool Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => handleToolAction(handleSummarize, "summarize")}
            disabled={loading}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 font-bold flex flex-col items-center justify-center space-y-3 ${
              activeTool === "summarize"
                ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-xl scale-95"
                : "border-white/20 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-2xl"
            } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
              📝
            </div>
            <span className="text-sm">Summarize</span>
          </button>

          <button
            onClick={() => handleToolAction(handleGrammar, "grammar")}
            disabled={loading}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 font-bold flex flex-col items-center justify-center space-y-3 ${
              activeTool === "grammar"
                ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 shadow-xl scale-95"
                : "border-white/20 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-600 hover:shadow-2xl"
            } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
              ✏️
            </div>
            <span className="text-sm">Grammar Check</span>
          </button>

          <button
            onClick={() => handleToolAction(handleIdeas, "ideas")}
            disabled={loading}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 font-bold flex flex-col items-center justify-center space-y-3 ${
              activeTool === "ideas"
                ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300 shadow-xl scale-95"
                : "border-white/20 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-2xl"
            } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-xl">
              💡
            </div>
            <span className="text-sm">Generate Ideas</span>
          </button>
        </div>

        {/* Loading Animation */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-purple-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
            </div>
            <span className="ml-4 text-gray-600 dark:text-gray-400 font-bold text-lg">
              Processing...
            </span>
          </div>
        )}

        {/* Result Area */}
        <div className="relative mb-8">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            {activeTool ? `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Result` : 'AI Output'}
          </label>
          <textarea
            readOnly
            value={loading ? "Processing..." : result}
            className="w-full h-48 p-6 rounded-2xl border-2 border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm resize-none focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 text-gray-900 dark:text-white shadow-inner font-medium"
            placeholder="Your AI-generated content will appear here..."
          />
          {result && !loading && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={handleInsert}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Insert into Editor
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-white/20 dark:border-gray-700/50">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Powered by Advanced AI
          </span>
          <div className="flex space-x-4">
            <button
              onClick={() => setResult("")}
              disabled={!result || loading}
              className="px-6 py-3 rounded-xl border border-white/20 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 font-bold hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-bold hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-gray-600/50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiToolsModal;