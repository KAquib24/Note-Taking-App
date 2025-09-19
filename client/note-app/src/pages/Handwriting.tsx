// File: Handwriting.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import HandwritingCanvas from "../components/HandwritingCanvas";

const Handwriting: React.FC = () => {
  const location = useLocation();
  const editNote = location.state?.note;

  const folders = ["Default", "Work", "Personal"]; // Example folders

  const handleSave = async (dataUrl: string, title: string, folder: string, noteId?: string) => {
    if (noteId) {
      // Update existing note
      await fetch(`http://localhost:5000/api/stylus/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, folder, image: dataUrl }),
      });
    } else {
      // Create new note
      await fetch("http://localhost:5000/api/stylus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, folder, image: dataUrl }),
      });
    }
    alert("Note saved!");
  };

  return <HandwritingCanvas folders={folders} editNote={editNote} onSave={handleSave} />;
};

export default Handwriting;
