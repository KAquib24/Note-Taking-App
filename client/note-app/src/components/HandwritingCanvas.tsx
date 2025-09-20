// File: src/components/HandwritingCanvas.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";

interface HandwritingCanvasProps {
  onSave: (
    dataUrl: string,
    title: string,
    folder: string,
    noteId?: string
  ) => void;
  folders?: string[];
  editNote?: {
    _id: string;
    title: string;
    folder?: string;
    image: string;
  };
  darkMode?: boolean;
}

interface CanvasState {
  imageData: ImageData;
}

interface Point {
  x: number;
  y: number;
}

interface Shape {
  type: "rectangle" | "circle" | "line" | "arrow";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
}

type BrushType = "pen" | "brush" | "marker" | "pencil" | "calligraphy" | "spray" | "eraser";
type ToolMode = "draw" | "shape" | "select";

const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  onSave,
  folders = ["Default"],
  editNote,
  darkMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const sprayInterval = useRef<number | null>(null);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [brushType, setBrushType] = useState<BrushType>("pen");
  const [toolMode, setToolMode] = useState<ToolMode>("draw");
  const [shapeType, setShapeType] = useState<"rectangle" | "circle" | "line" | "arrow">("rectangle");
  const [title, setTitle] = useState(editNote?.title || "");
  const [folder, setFolder] = useState(editNote?.folder || folders[0]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);

  const [history, setHistory] = useState<CanvasState[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasState[]>([]);

  // Brush presets
  const brushPresets: Record<BrushType, { baseSize: number; opacity: number; lineCap: CanvasLineCap; lineJoin: CanvasLineJoin }> = {
    pen: { baseSize: 2, opacity: 1, lineCap: "round", lineJoin: "round" },
    brush: { baseSize: 15, opacity: 0.7, lineCap: "round", lineJoin: "round" },
    marker: { baseSize: 20, opacity: 0.4, lineCap: "square", lineJoin: "bevel" },
    pencil: { baseSize: 3, opacity: 0.8, lineCap: "round", lineJoin: "round" },
    calligraphy: { baseSize: 8, opacity: 0.9, lineCap: "square", lineJoin: "miter" },
    spray: { baseSize: 15, opacity: 0.3, lineCap: "round", lineJoin: "round" },
    eraser: { baseSize: 20, opacity: 1, lineCap: "round", lineJoin: "round" }
  };

  // 🖼 Load existing note if editing
  useEffect(() => {
    if (editNote && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `http://localhost:5000/${editNote.image}?t=${Date.now()}`;
      img.onload = () => {
        if (ctx) {
          // Adjust canvas size to match image aspect ratio
          const maxWidth = 800;
          const maxHeight = 600;
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (img.width > maxWidth) {
            newWidth = maxWidth;
            newHeight = (img.height * maxWidth) / img.width;
          }
          
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = (img.width * maxHeight) / img.height;
          }
          
          setCanvasSize({ width: newWidth, height: newHeight });
          
          setTimeout(() => {
            if (canvasRef.current) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.drawImage(img, 0, 0, newWidth, newHeight);
              saveHistory();
            }
          }, 100);
        }
      };
    }
  }, [editNote]);

  // Initialize canvas context
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Set default styles
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 1;
  }, [canvasSize]);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  const saveHistory = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      const snapshot = ctx.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
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
    if (prevSnapshot) {
      ctx.putImageData(prevSnapshot.imageData, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      // Redraw shapes
      shapes.forEach(shape => drawShape(shape, ctx));
    }
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

  // Drawing functions for different brush types
  const drawPen = (ctx: CanvasRenderingContext2D, currentPoint: Point, lastPoint: Point) => {
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
  };

  const drawBrush = (ctx: CanvasRenderingContext2D, currentPoint: Point, lastPoint: Point) => {
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
    // Add texture for brush effect
    ctx.beginPath();
    ctx.arc(currentPoint.x, currentPoint.y, size / 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCalligraphy = (ctx: CanvasRenderingContext2D, currentPoint: Point, lastPoint: Point) => {
    const angle = Math.atan2(currentPoint.y - lastPoint.y, currentPoint.x - lastPoint.x);
    const dx = Math.sin(angle) * size / 2;
    const dy = -Math.cos(angle) * size / 2;
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x - dx, lastPoint.y - dy);
    ctx.lineTo(lastPoint.x + dx, lastPoint.y + dy);
    ctx.lineTo(currentPoint.x + dx, currentPoint.y + dy);
    ctx.lineTo(currentPoint.x - dx, currentPoint.y - dy);
    ctx.closePath();
    ctx.fill();
  };

  const drawSpray = (ctx: CanvasRenderingContext2D, point: Point) => {
    const density = size * 2;
    const radius = size;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = point.x + Math.cos(angle) * distance;
      const y = point.y + Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(x, y, size / 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (toolMode === "draw") {
      isDrawing.current = true;
      lastPoint.current = { x, y };
      saveHistory();
      
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      
      // Set brush properties
      const preset = brushPresets[brushType];
      ctx.strokeStyle = brushType === "eraser" ? darkMode ? "#1f2937" : "#f9fafb" : color;
      ctx.fillStyle = brushType === "eraser" ? darkMode ? "#1f2937" : "#f9fafb" : color;
      ctx.lineWidth = size;
      ctx.globalAlpha = brushType === "eraser" ? 1 : opacity * preset.opacity;
      ctx.lineCap = preset.lineCap;
      ctx.lineJoin = preset.lineJoin;
      
      // Start spray effect if spray brush is selected
      if (brushType === "spray") {
        sprayInterval.current = window.setInterval(() => {
          if (isDrawing.current && lastPoint.current) {
            drawSpray(ctx, lastPoint.current);
          }
        }, 50);
      }
    } else if (toolMode === "shape") {
      isDrawing.current = true;
      setCurrentShape({
        type: shapeType,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color,
        size
      });
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvasRef.current.getContext("2d");
    
    if (!ctx) return;
    
    if (toolMode === "draw" && lastPoint.current) {
      const preset = brushPresets[brushType];
      ctx.strokeStyle = brushType === "eraser" ? darkMode ? "#1f2937" : "#f9fafb" : color;
      ctx.fillStyle = brushType === "eraser" ? darkMode ? "#1f2937" : "#f9fafb" : color;
      ctx.lineWidth = size;
      ctx.globalAlpha = brushType === "eraser" ? 1 : opacity * preset.opacity;
      ctx.lineCap = preset.lineCap;
      ctx.lineJoin = preset.lineJoin;
      
      const currentPoint = { x, y };
      
      switch (brushType) {
        case "pen":
        case "pencil":
        case "eraser":
          drawPen(ctx, currentPoint, lastPoint.current);
          break;
        case "brush":
        case "marker":
          drawBrush(ctx, currentPoint, lastPoint.current);
          break;
        case "calligraphy":
          drawCalligraphy(ctx, currentPoint, lastPoint.current);
          break;
        case "spray":
          drawSpray(ctx, currentPoint);
          break;
      }
      
      lastPoint.current = currentPoint;
    } else if (toolMode === "shape" && currentShape) {
      // Redraw canvas without the current temporary shape
      if (history.length > 0) {
        ctx.putImageData(history[history.length - 1].imageData, 0, 0);
      } else {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      // Redraw all permanent shapes
      shapes.forEach(shape => drawShape(shape, ctx));
      
      // Draw the current temporary shape
      drawShape({
        ...currentShape,
        endX: x,
        endY: y
      }, ctx);
    }
  };

  const drawShape = (shape: Shape, ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.size;
    ctx.globalAlpha = opacity;
    
    const width = shape.endX - shape.startX;
    const height = shape.endY - shape.startY;
    
    switch (shape.type) {
      case "rectangle":
        ctx.strokeRect(shape.startX, shape.startY, width, height);
        break;
      case "circle":
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = shape.startX + width / 2;
        const centerY = shape.startY + height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
      case "arrow":
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        
        // Arrowhead
        const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
        const headLength = shape.size * 3;
        
        ctx.lineTo(
          shape.endX - headLength * Math.cos(angle - Math.PI / 6),
          shape.endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(shape.endX, shape.endY);
        ctx.lineTo(
          shape.endX - headLength * Math.cos(angle + Math.PI / 6),
          shape.endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
    }
    
    ctx.globalAlpha = 1;
  };

  const stopDrawing = () => {
    if (isDrawing.current && toolMode === "shape" && currentShape) {
      // Save the shape to the shapes array
      setShapes(prev => [...prev, currentShape]);
      // Save to history
      saveHistory();
    }
    
    isDrawing.current = false;
    setCurrentShape(null);
    
    if (sprayInterval.current) {
      clearInterval(sprayInterval.current);
      sprayInterval.current = null;
    }
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      saveHistory();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setShapes([]);
    }
  };

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    onSave(
      canvasRef.current.toDataURL(),
      title || "Untitled",
      folder,
      editNote?._id
    );

    if (!editNote) {
      clearCanvas();
      setTitle("");
    }
  };

  // Canvas resizing functionality
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
  };

  const resizeCanvas = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const dx = e.clientX - resizeStart.x;
    const dy = e.clientY - resizeStart.y;
    
    setCanvasSize(prev => ({
      width: Math.max(300, prev.width + dx),
      height: Math.max(200, prev.height + dy)
    }));
    
    setResizeStart({ x: e.clientX, y: e.clientY });
  }, [isResizing, resizeStart]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    setupCanvas();
    saveHistory();
  }, [setupCanvas]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resizeCanvas);
      window.addEventListener("mouseup", stopResizing);
      
      return () => {
        window.removeEventListener("mousemove", resizeCanvas);
        window.removeEventListener("mouseup", stopResizing);
      };
    }
  }, [isResizing, resizeCanvas, stopResizing]);

  return (
    <div
      className={`rounded-xl shadow-lg p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
      }`}
    >
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-400 outline-none ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white"
          }`}
        />
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-400 outline-none ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white"
          }`}
        >
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {/* Tool Mode Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setToolMode("draw")}
            className={`px-3 py-1 rounded-lg text-sm font-medium shadow ${
              toolMode === "draw"
                ? "bg-blue-600 text-white"
                : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            ✏️ Draw
          </button>
          <button
            onClick={() => setToolMode("shape")}
            className={`px-3 py-1 rounded-lg text-sm font-medium shadow ${
              toolMode === "shape"
                ? "bg-purple-600 text-white"
                : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            🔷 Shapes
          </button>
        </div>

        {/* Brush Selection (when in draw mode) */}
        {toolMode === "draw" && (
          <div className="flex gap-2">
            {(["pen", "brush", "marker", "pencil", "calligraphy", "spray", "eraser"] as BrushType[]).map((type) => (
              <button
                key={type}
                onClick={() => setBrushType(type)}
                className={`px-3 py-1 rounded-lg text-sm font-medium shadow ${
                  brushType === type
                    ? "bg-indigo-600 text-white"
                    : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
                }`}
                title={type.charAt(0).toUpperCase() + type.slice(1)}
              >
                {type === "pen" && "✏️"}
                {type === "brush" && "🖌️"}
                {type === "marker" && "🖍️"}
                {type === "pencil" && "📝"}
                {type === "calligraphy" && "✒️"}
                {type === "spray" && "💨"}
                {type === "eraser" && "🧹"}
              </button>
            ))}
          </div>
        )}

        {/* Shape Selection (when in shape mode) */}
        {toolMode === "shape" && (
          <div className="flex gap-2">
            {(["rectangle", "circle", "line", "arrow"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setShapeType(type)}
                className={`px-3 py-1 rounded-lg text-sm font-medium shadow ${
                  shapeType === type
                    ? "bg-purple-600 text-white"
                    : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
                }`}
                title={type.charAt(0).toUpperCase() + type.slice(1)}
              >
                {type === "rectangle" && "⬜"}
                {type === "circle" && "🔴"}
                {type === "line" && "📏"}
                {type === "arrow" && "➡️"}
              </button>
            ))}
          </div>
        )}

        {/* Color & Brush Controls */}
        <label className="flex items-center gap-2">
          <span className="text-sm">Color</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm">Size</span>
          <input
            type="range"
            min={1}
            max={30}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-24"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm">Opacity</span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-24"
          />
        </label>

        {/* Undo/Redo */}
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className={`px-3 py-1 rounded-lg text-sm ${
              history.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            ⎌ Undo
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className={`px-3 py-1 rounded-lg text-sm ${
              redoStack.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            ↻ Redo
          </button>
        </div>

        {/* Clear Canvas */}
        <button
          onClick={clearCanvas}
          className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow"
        >
          🗑️ Clear
        </button>

        {/* Save */}
        <button
          onClick={saveCanvas}
          className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700"
        >
          {editNote ? "💾 Update" : "💾 Save"}
        </button>
      </div>

      {/* Canvas Container with Resize Handle */}
      <div 
        ref={containerRef}
        className="relative overflow-auto rounded-lg border-2 border-dashed border-gray-300 shadow-inner"
        style={{ 
          maxWidth: "100%", 
          maxHeight: "70vh",
          cursor: isResizing ? "nwse-resize" : "default"
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={`rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {/* Resize Handle */}
        <div
          className="absolute bottom-1 right-1 w-4 h-4 cursor-nwse-resize bg-gray-400 rounded-sm opacity-50 hover:opacity-100"
          onMouseDown={startResizing}
          style={{ zIndex: 10 }}
        >
          <div className="w-full h-full flex items-center justify-center text-xs">↘️</div>
        </div>
        
        {/* Canvas Size Indicator */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {canvasSize.width} × {canvasSize.height}
        </div>
      </div>
    </div>
  );
};

export default HandwritingCanvas;