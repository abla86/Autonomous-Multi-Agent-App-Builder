import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set in the environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for high resolution images (1K, 2K, 4K base64)
  app.use(express.json({ limit: "60mb" }));
  app.use(express.urlencoded({ extended: true, limit: "60mb" }));

  // --- API Routes ---

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Prompt enhancement helper using gemini-3.8-flash
  app.post("/api/enhance-prompt", async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyName, industry, rawDescription, style, colorPalette } = req.body;
      const ai = getGenAI();

      const systemPrompt = `You are an elite brand designer and creative art director.
Enhance the user's logo request into a detailed, visually stunning image generation prompt.
Specify:
- Distinctive central icon / logo symbol
- Minimalist, modern, balanced vector visual composition
- Color palette tones and lighting accents
- Clean contrasting background (e.g. solid pure dark or light background, no clutter)
- Professional branding aesthetics suitable for high-resolution rendering
Keep the prompt under 120 words. Output ONLY the enhanced prompt string, without markdown formatting or introductory comments.`;

      const userText = `Company: "${companyName || "Brand"}"
Industry: "${industry || "General"}"
Style: "${style || "Modern Minimalist"}"
Colors: "${colorPalette || "Modern"}"
Concept: "${rawDescription || "Professional logo"}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: userText,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const enhancedPrompt = response.text ? response.text.trim() : rawDescription;
      res.json({ enhancedPrompt });
    } catch (error: any) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({
        error: error.message || "Failed to enhance prompt",
      });
    }
  });

  // Logo Generation using model gemini-3-pro-image-preview with imageSize (1K, 2K, 4K)
  app.post("/api/generate-logo", async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        companyName,
        industry,
        description,
        style = "Modern Minimalist",
        colorPalette = "Vibrant Gradient",
        imageSize = "1K", // "1K", "2K", "4K"
        aspectRatio = "1:1",
      } = req.body;

      const ai = getGenAI();

      const promptParts = [
        `Masterpiece professional company logo design for "${companyName || "Innovate"}"`,
        industry ? `in the ${industry} industry.` : "",
        `Style: ${style}.`,
        `Color scheme: ${colorPalette}.`,
        description ? `Brand concept: ${description}.` : "",
        `Graphic design standards: clean vector emblem, balanced negative space, high contrast, centered iconic mark, sharp details, isolated on a clean aesthetic background, commercial identity ready.`,
      ]
        .filter(Boolean)
        .join(" ");

      // Model: gemini-3-pro-image-preview as required
      const targetModel = "gemini-3-pro-image-preview";

      let response;
      try {
        response = await ai.models.generateContent({
          model: targetModel,
          contents: {
            parts: [{ text: promptParts }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || "1:1",
              imageSize: imageSize || "1K",
            },
          },
        });
      } catch (genError: any) {
        console.warn(`Attempt with ${targetModel} encountered error, trying gemini-3.1-flash-image fallback:`, genError?.message);
        // Resilient fallback if preview alias has temporary quotas
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: promptParts }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || "1:1",
              imageSize: imageSize || "1K",
            },
          },
        });
      }

      let imageUrl: string | null = null;
      let textFeedback: string = "";

      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textFeedback += part.text;
        }
      }

      if (!imageUrl) {
        throw new Error(textFeedback || "No image part returned by the image generation model.");
      }

      res.json({
        imageUrl,
        promptUsed: promptParts,
        imageSize,
        aspectRatio,
        companyName,
      });
    } catch (error: any) {
      console.error("Error generating logo:", error);
      res.status(500).json({
        error: error.message || "Failed to generate logo",
      });
    }
  });

  // Video Generation using veo-3.1-fast-generate-preview
  // Aspect ratio must be '16:9' (landscape) or '9:16' (portrait)
  app.post("/api/generate-video", async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        prompt,
        imageBase64,
        mimeType = "image/png",
        aspectRatio = "16:9", // '16:9' or '9:16'
        resolution = "720p", // '720p' or '1080p'
      } = req.body;

      if (!imageBase64 && !prompt) {
        res.status(400).json({ error: "Either an image or a prompt is required for video generation." });
        return;
      }

      const validAspectRatios = ["16:9", "9:16"];
      const targetAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "16:9";

      // Clean base64 string if it contains data prefix
      let cleanBase64 = imageBase64;
      let targetMime = mimeType;
      if (cleanBase64 && cleanBase64.includes(";base64,")) {
        const matches = cleanBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          targetMime = matches[1];
          cleanBase64 = matches[2];
        } else {
          cleanBase64 = cleanBase64.split(";base64,")[1];
        }
      }

      const ai = getGenAI();

      const videoPayload: any = {
        model: "veo-3.1-fast-generate-preview",
        config: {
          numberOfVideos: 1,
          resolution: resolution === "1080p" ? "1080p" : "720p",
          aspectRatio: targetAspectRatio,
        },
      };

      if (prompt) {
        videoPayload.prompt = prompt;
      } else {
        videoPayload.prompt = "Dynamic cinematic motion, smooth camera sweep, atmospheric lighting and realistic animation";
      }

      if (cleanBase64) {
        videoPayload.image = {
          imageBytes: cleanBase64,
          mimeType: targetMime || "image/png",
        };
      }

      console.log(`Calling Veo generation with model veo-3.1-fast-generate-preview, aspect: ${targetAspectRatio}, resolution: ${videoPayload.config.resolution}`);

      let operation;
      try {
        operation = await ai.models.generateVideos(videoPayload);
      } catch (veoError: any) {
        console.warn("veo-3.1-fast-generate-preview returned error, trying veo-3.1-lite-generate-preview fallback:", veoError?.message);
        videoPayload.model = "veo-3.1-lite-generate-preview";
        operation = await ai.models.generateVideos(videoPayload);
      }

      if (!operation || !operation.name) {
        throw new Error("Veo video generation did not return an operation name.");
      }

      res.json({
        operationName: operation.name,
        aspectRatio: targetAspectRatio,
      });
    } catch (error: any) {
      console.error("Error initiating video generation:", error);
      res.status(500).json({
        error: error.message || "Failed to initiate video generation",
      });
    }
  });

  // Check status of Veo Video Generation Operation
  app.post("/api/video-status", async (req: Request, res: Response): Promise<void> => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: "Missing operationName" });
        return;
      }

      const ai = getGenAI();
      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });

      const done = !!updated.done;
      const error = updated.error ? (updated.error.message || "Video generation failed") : null;
      const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri || null;

      res.json({
        done,
        error,
        hasVideo: !!videoUri,
        streamUrl: done && !error ? `/api/video-stream?name=${encodeURIComponent(operationName)}` : null,
      });
    } catch (error: any) {
      console.error("Error polling video operation:", error);
      res.status(500).json({
        error: error.message || "Failed to check video status",
      });
    }
  });

  // Stream video directly to client (handles API key authorization server-side)
  app.get("/api/video-stream", async (req: Request, res: Response): Promise<void> => {
    try {
      const operationName = req.query.name as string;
      const download = req.query.download === "1";

      if (!operationName) {
        res.status(400).send("Missing operation name");
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).send("GEMINI_API_KEY is not configured");
        return;
      }

      const ai = getGenAI();
      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!videoUri) {
        res.status(404).send("Video not ready or URI not found");
        return;
      }

      const videoRes = await fetch(videoUri, {
        headers: { "x-goog-api-key": apiKey },
      });

      if (!videoRes.ok) {
        res.status(videoRes.status).send("Failed to fetch video stream from Google storage");
        return;
      }

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Cache-Control", "public, max-age=86400");
      if (download) {
        res.setHeader("Content-Disposition", 'attachment; filename="generated-video.mp4"');
      }

      if (!videoRes.body) {
        res.status(500).send("Video stream body is empty");
        return;
      }

      // Pipe Web ReadableStream to Node.js Response
      const reader = videoRes.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          if (value) {
            res.write(Buffer.from(value));
          }
        }
      };

      await pump();
    } catch (error: any) {
      console.error("Error streaming video:", error);
      if (!res.headersSent) {
        res.status(500).send("Error streaming video: " + (error.message || error));
      }
    }
  });

  // --- Vite Dev Server or Production Static Serving ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
