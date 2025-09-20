import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HandwritingCanvas from "../components/HandwritingCanvas";

const Handwriting: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editNote = location.state?.note;

  const folders = ["Default", "Work", "Personal"];

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
      formData.append("title", title);
      formData.append("folder", folder);
      formData.append("image", blob, `${title || "untitled"}.png`);

      const url = noteId
        ? `http://localhost:5000/api/stylus/${noteId}`
        : "http://localhost:5000/api/stylus";

      const res = await fetch(url, {
        method: noteId ? "PUT" : "POST",
        body: formData,
      });

      if (res.ok) {
        alert(noteId ? "✅ Note updated successfully!" : "✅ Note created successfully!");
        navigate("/stylus");
      } else {
        const errorText = await res.text();
        alert(`❌ Failed to save note: ${errorText}`);
      }
    } catch (error) {
      alert("⚠️ Error saving note. Check your backend connection.");
      console.error(error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/stylus")}
          className="px-4 py-2 rounded-lg bg-gray-600 text-white shadow hover:bg-gray-700"
        >
          ← Back to Stylus Notes
        </button>
        <h1 className="text-3xl font-extrabold text-gray-800">
          {editNote ? "✏️ Edit Stylus Note" : "📝 New Stylus Note"}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <HandwritingCanvas
          folders={folders}
          editNote={editNote}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default Handwriting;
