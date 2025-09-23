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

  const handleSummarize = async () => {
    if (!editor) return;
    setLoading(true);
    try {
      const text = editor.getText();
      const res = await api.post("/ai/summarize", { text });
      setResult(res.data.summary);
    } catch {
      setResult("Error summarizing text.");
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
      setResult("Error correcting grammar.");
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
      setResult("Error generating ideas.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-11/12 max-w-xl">
        <h2 className="text-xl font-bold mb-4">AI Tools</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={handleSummarize} disabled={loading}>Summarize</button>
          <button onClick={handleGrammar} disabled={loading}>Grammar Check</button>
          <button onClick={handleIdeas} disabled={loading}>Generate Ideas</button>
        </div>
        <textarea readOnly value={result} className="w-full h-40 mb-4" />
        <div className="text-right">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AiToolsModal;
