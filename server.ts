import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set high body limits to allow base64 screenshot uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to convert base64 image data into Gemini format
function getPartFromBase64Image(base64String: string) {
  // Extract clean base64 data and mime type
  const match = base64String.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/);
  if (!match) {
    // If it is just clean base64 data without metadata headers
    return {
      inlineData: {
        data: base64String,
        mimeType: "image/png",
      },
    };
  }
  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
}

// API endpoint for reply generation
app.post("/api/love-reply/generate", async (req, res) => {
  try {
    const { text, image, booster } = req.body;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables.");
      return res.status(500).json({
        error: "Le serveur n'a pas configuré la clé API Gemini. Veuillez la renseigner dans les secrets.",
      });
    }

    if (!text && !image) {
      return res.status(400).json({
        error: "Veuillez fournir un message texte ou une capture d'écran.",
      });
    }

    const boosterLabels: Record<string, string> = {
      none: "Standard",
      ultra_drague: "Ultra drague 😏",
      ultra_mignon: "Ultra mignon 💕",
      funny: "Funny 😂",
      ice_cold: "Ice cold 😎",
    };

    const boosterLabel = boosterLabels[booster] || "Standard";

    // Build parts for multimodal input
    const parts: any[] = [];

    let instructionText = `Tu es "LoveReply AI", l'expert ultime en psychologie amoureuse, flirt et séduction digitale.
Tu analyses les captures d'écran de conversation (sms, Whatsapp, Tinder, Instagram...) ou le texte recopié d'un crush ou partenaire.
Ton objectif est de comprendre en profondeur l'ambiance émotionnelle et de proposer les meilleures options de réponse.

Directives de génération :
1. Identifie la langue de la conversation reçue. Écris l'analyse de contexte et TOUTES les propositions de réponse dans cette même langue (priorise la langue détectée ou le français par défaut si ambigu).
2. Détecte le ton (flirt, tendu/dispute, amical, distant, chaud...).
3. Écris des réponses qui ont l'air 100% humaines, vivantes, naturelles, branchées et qui évitent d'avoir l'air rédigées par un robot (pas de verbiage lourd, utilise des formulations naturelles, des contractions ordinaires ou du langage de messagerie moderne).
4. Fournis TOUJOURS :
   - une réponse mignonne / douce 😍 (attentionnée, tendre, chaleureuse)
   - une réponse drague légère / flirt 😏 (taquine, séduisante, pleine de sous-entendus joueurs)
   - une réponse drôle / humour 😂 (drôle, espiègle, autodérision)
   - une réponse intelligente / neutre 💬 (décontractée, diplomate, pour relancer le sujet tranquillement)
5. Si l'utilisateur a activé le mode booster suivant : "${boosterLabel}" (qui correspond à l'id "${booster}").
   Si cet id n'est pas "none", tu dois ABSOLUMENT ajouter une 5ème proposition de réponse ultra-ciblée correspondant précisément à ce booster :
   - "ultra_drague" : Un flirt intense, audacieux et direct sans détour 😏
   - "ultra_mignon" : Une réponse tellement adorable et attendrissante qu'elle fait fondre le cœur 💕
   - "funny" : Une réplique ou vanne extrêmement drôle, dynamique et inattendue 😂
   - "ice_cold" : Une réplique mystérieuse, un peu détachée, très charismatique, l'art du "fuis-moi je te suis" 😎
   Si "${booster}" est "none", tu n'es pas obligé de rajouter de 5ème option, mais tu peux en option proposer une variante bonus sympa.

Format de sortie STRICTEMENT en JSON :
Respecte rigoureusement la structure de schéma JSON demandée. Le texte de 'content' doit directement être le message à copier-coller (ne mets pas de guillemets à l'intérieur s'ils ne sont pas nécessaires).`;

    parts.push({ text: instructionText });

    if (image) {
      try {
        const imagePart = getPartFromBase64Image(image);
        parts.push(imagePart);
        parts.push({ text: `Analyse cette image de conversation messagerie.` });
      } catch (err) {
        console.error("Format d'image invalide:", err);
        return res.status(400).json({ error: "Format d'image ou encodage invalide." });
      }
    }

    if (text) {
      parts.push({ text: `Voici le texte de la conversation fourni par l'utilisateur :\n"${text}"` });
    }

    parts.push({ text: `Génère l'analyse et les réponses basées sur les inputs ci-dessus avec le booster "${booster}".` });

    console.log("Appel de l'API de Gemini pour LoveReply AI (modèle gemini-3.5-flash)...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSender: {
              type: Type.STRING,
              description: "L'expéditeur supposé du dernier message (ex: 'Lui', 'Elle', 'Inconnu')",
            },
            detectedTone: {
              type: Type.STRING,
              description: "Le ton global détecté (ex: 'Flirt joueur', 'Distant / Froid', 'Tendu', 'Amical')",
            },
            contextAnalysis: {
              type: Type.STRING,
              description: "Analyse synthétique de l'état émotionnel de la conversation et recommandation de stratégie (en français de préférence, max 2 phrases).",
            },
            replies: {
              type: Type.ARRAY,
              description: "Propositions de réponses adaptées",
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: "Clé technique de la catégorie : mignonne, drague, drole, intelligente ou booster",
                  },
                  label: {
                    type: Type.STRING,
                    description: "Nom de la catégorie avec son émoji (ex: '😏 Drague légère', '😎 Ice Cold')",
                  },
                  content: {
                    type: Type.STRING,
                    description: "La proposition exacte de message à envoyer. Naturel, fluide, sans guillemets superflus.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Court conseil d'attitude ou explication de pourquoi cela marche (max 10 mots en français)",
                  },
                },
                required: ["category", "label", "content", "explanation"],
              },
            },
          },
          required: ["detectedSender", "detectedTone", "contextAnalysis", "replies"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Aucune réponse reçue de la part du modèle d'IA.");
    }

    const result = JSON.parse(outputText.trim());
    return res.json(result);

  } catch (error: any) {
    console.error("Erreur durant la génération des réponses:", error);
    return res.status(500).json({
      error: "Une erreur est survenue lors du traitement par l'IA.",
      details: error?.message || error,
    });
  }
});

// Configure Vite integration for develop, static asset serving for production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LoveReply AI Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Impossible de démarrer le serveur :", err);
});
