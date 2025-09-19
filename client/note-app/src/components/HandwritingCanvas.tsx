// File: HandwritingCanvas.tsx
import React, { useRef, useState, useEffect } from "react";

interface HandwritingCanvasProps {
  onSave: (dataUrl: string, title: string, folder: string, noteId?: string) => void;
  folders?: string[];
  editNote?: {
    _id: string;
    title: string;
    folder?: string;
    image: string;
  };
}

interface CanvasState {
  imageData: ImageData;
}

const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ onSave, folders = ["Default"], editNote }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [title, setTitle] = useState(editNote?.title || "");
  const [folder, setFolder] = useState(editNote?.folder || folders[0]);
  const [nightMode, setNightMode] = useState(false);

  const [history, setHistory] = useState<CanvasState[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasState[]>([]);

  // Load existing note image onto canvas
  useEffect(() => {
    if (editNote && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.src = `http://localhost:5000/${editNote.image}`;
      img.onload = () => {
        if (ctx) ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
      };
    }
  }, [editNote]);

  const saveHistory = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      const snapshot = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory((prev) => [...prev, { imageData: snapshot }]);
      setRedoStack([]);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    const last = history[history.length - 1];
    setRedoStack((prev) => [...prev, last]);
    setHistory((prev) => prev.slice(0, -1));

    const prevSnapshot = history[history.length - 2];
    if (prevSnapshot) ctx.putImageData(prevSnapshot.imageData, 0, 0);
    else ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    const lastRedo = redoStack[redoStack.length - 1];
    ctx.putImageData(lastRedo.imageData, 0, 0);
    setHistory((prev) => [...prev, lastRedo]);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const startDrawing = (e: React.MouseEvent) => {
    isDrawing.current = true;
    saveHistory();
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = mode === "pen" ? color : "#ffffff";
    ctx.globalAlpha = opacity;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    onSave(canvasRef.current.toDataURL(), title || "Untitled", folder, editNote?._id);

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setTitle("");
  };

  const toggleNightMode = () => setNightMode(prev => !prev);

  return (
    <div className={nightMode ? "bg-gray-900 p-4 text-white" : "p-4"}>
      <div className="mb-2 flex gap-2 flex-wrap items-center">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <select value={folder} onChange={(e) => setFolder(e.target.value)} className="border px-2 py-1 rounded">
          {folders.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input type="range" min={1} max={20} value={size} onChange={e => setSize(Number(e.target.value))} />
        <input type="range" min={0.1} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} />
        <button onClick={() => setMode("pen")} className="px-2 py-1 bg-blue-500 text-white rounded">Pen</button>
        <button onClick={() => setMode("eraser")} className="px-2 py-1 bg-red-500 text-white rounded">Eraser</button>
        <button onClick={undo} className="px-2 py-1 bg-gray-500 text-white rounded">Undo</button>
        <button onClick={redo} className="px-2 py-1 bg-gray-500 text-white rounded">Redo</button>
        <button onClick={toggleNightMode} className="px-2 py-1 bg-yellow-500 text-black rounded">Night Mode</button>
        <button onClick={saveCanvas} className="px-2 py-1 bg-green-500 text-white rounded">
          {editNote ? "Update" : "Save"}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={nightMode ? "border border-white bg-gray-800" : "border bg-white"}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default HandwritingCanvas;
