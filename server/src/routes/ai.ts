import express, { Request, Response } from "express";

const router = express.Router();

// Helper function to safely call Ollama with streaming support
async function callOllama(prompt: string): Promise<string> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma:2b",
      prompt,
    }),
  });

  if (!response.body) throw new Error("No response body from Ollama");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let result = "";

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) result += data.response;
        } catch (err) {
          console.warn("Skipping invalid line:", line);
        }
      }
    }
  }

  return result.trim();
}

// 🔹 Summarize Text
router.post("/summarize", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const summary = await callOllama(`Summarize the following text:\n\n${text}`);
    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Summarization failed" });
  }
});

// 🔹 Grammar Correction
router.post("/grammar", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const corrected = await callOllama(`Correct the grammar and spelling of this text:\n\n${text}`);
    res.json({ corrected });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Grammar correction failed" });
  }
});

// 🔹 Idea Generation
router.post("/ideas", async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const ideas = await callOllama(`Give me 5 creative ideas about: ${topic}`);
    res.json({ ideas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Idea generation failed" });
  }
});

export default router;
