import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HandwritingCanvas from "../components/HandwritingCanvas";

const Handwriting: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editNote = location.state?.note;

  const folders = ["Default", "Work", "Personal", "Projects"];

  const handleSave = async (
    dataUrl: string,
    title: string,
    folder: string,
    noteId?: string
  ) => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("title", title || "Untitled Note");
      formData.append("folder", folder);
      formData.append("image", blob, `${title || "handwritten-note"}.png`);

      const url = noteId
        ? `http://localhost:5000/api/stylus/${noteId}`
        : "http://localhost:5000/api/stylus";

      const res = await fetch(url, {
        method: noteId ? "PUT" : "POST",
        body: formData,
      });

      if (res.ok) {
        alert(noteId ? "Note updated successfully!" : "Note created successfully!");
        navigate("/stylus");
      } else {
        const errorText = await res.text();
        alert(`Failed to save note: ${errorText}`);
      }
    } catch (error) {
      alert("Error saving note. Check your connection.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 p-6">
      
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/stylus")}
          className="px-6 py-3 rounded-2xl bg-gray-700 text-white shadow-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2 border border-gray-600"
        >
          <span className="text-xl">←</span>
          Back to Gallery
        </button>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            {editNote ? "Edit Handwritten Note" : "Create Handwritten Note"}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {editNote ? "Refine your existing note" : "Draw your new note"}
          </p>
        </div>
        
        <div className="w-32"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 bg-black/30 rounded-2xl px-6 py-3 border border-purple-500/30">
            <span className="text-2xl">✏️</span>
            <span className="text-purple-400 font-semibold text-lg">
              {editNote ? "Editing Mode" : "Creation Mode"}
            </span>
          </div>
        </div>

        <HandwritingCanvas
          folders={folders}
          editNote={editNote}
          onSave={handleSave}
        />
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          Tip: Draw clearly for best results
        </p>
      </div>
    </div>
  );
};

export default Handwriting;