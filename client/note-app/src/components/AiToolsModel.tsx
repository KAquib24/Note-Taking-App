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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl w-11/12 max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100 hover:scale-105">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Assistant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Tool Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => handleToolAction(handleSummarize, "summarize")}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all duration-300 font-semibold flex flex-col items-center justify-center space-y-2 ${
              activeTool === "summarize"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg scale-95"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md"
            } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            <span className="text-lg">📝</span>
            <span>Summarize</span>
          </button>

          <button
            onClick={() => handleToolAction(handleGrammar, "grammar")}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all duration-300 font-semibold flex flex-col items-center justify-center space-y-2 ${
              activeTool === "grammar"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-lg scale-95"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md"
            } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            <span className="text-lg">✏️</span>
            <span>Grammar Check</span>
          </button>

          <button
            onClick={() => handleToolAction(handleIdeas, "ideas")}
            disabled={loading}
            className={`p-4 rounded-xl border-2 transition-all duration-300 font-semibold flex flex-col items-center justify-center space-y-2 ${
              activeTool === "ideas"
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 shadow-lg scale-95"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md"
            } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            <span className="text-lg">💡</span>
            <span>Generate Ideas</span>
          </button>
        </div>

        {/* Loading Animation */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin"></div>
              <div className="w-12 h-12 border-4 border-purple-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
            </div>
            <span className="ml-4 text-gray-600 dark:text-gray-400 font-medium">
              AI is thinking...
            </span>
          </div>
        )}

        {/* Result Area */}
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Result {activeTool && `- ${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}`}
          </label>
          <textarea
            readOnly
            value={loading ? "Processing..." : result}
            className="w-full h-40 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300 text-gray-900 dark:text-white shadow-inner"
            placeholder="Your AI-generated content will appear here..."
          />
          {result && !loading && (
            <div className="absolute bottom-3 right-3">
              <button
                onClick={handleInsert}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Insert into Editor
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Powered by AI Assistant
          </span>
          <div className="flex space-x-3">
            <button
              onClick={() => setResult("")}
              disabled={!result || loading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
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