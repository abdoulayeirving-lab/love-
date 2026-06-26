import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set high body limits to allow base64 screenshot uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Function to lazy-initialize the GoogleGenAI client
function getGeminiClient() {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }
  return new GoogleGenAI({
    apiKey: currentKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

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

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined in environment variables.");
      return res.status(401).json({
        error: "Erreur de configuration, contactez le support.",
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
6. Pour chaque réponse proposée, analyse son sentiment dominant ("positive" pour romantique/doux/complice/flirt, "neutral" pour purement informatif/détaché/amical sans sous-entendus, "negative" pour piquant/sarcastique/volontairement distant/froid en guise de taquinerie ou repli stratégique). Attribue également un score d'intensité sentimentale/émotionnelle de 0 à 100 indiquant à quel point la réponse incarne ce sentiment.

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

    const ai = getGeminiClient();
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
                  sentiment: {
                    type: Type.STRING,
                    description: "Sentiment dominant de la réponse générée : 'positive', 'neutral' ou 'negative'",
                  },
                  sentimentScore: {
                    type: Type.INTEGER,
                    description: "Intensité sentimentale/émotionnelle de la réponse de 0 à 100",
                  },
                },
                required: ["category", "label", "content", "explanation", "sentiment", "sentimentScore"],
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
    const errMessage = (error?.message || "").toString();
    
    let status = 500;
    let errorMessage = "Une petite erreur s'est glissée. On réessaie ? ✨";

    if (errMessage.includes("API_KEY_INVALID") || errMessage.includes("API key not valid") || errMessage.includes("key is invalid") || error?.status === 401) {
      status = 401;
      errorMessage = "Erreur de configuration, contactez le support.";
    } else if (errMessage.includes("RESOURCE_EXHAUSTED") || errMessage.includes("quota") || errMessage.includes("Too Many Requests") || error?.status === 429) {
      status = 429;
      errorMessage = "Trop de requêtes, patientez quelques secondes.";
    } else if (errMessage.includes("unavailable") || errMessage.includes("down") || errMessage.includes("Service Unavailable") || error?.status === 503) {
      status = 503;
      errorMessage = "Service temporairement indisponible, réessayez dans 30 secondes.";
    }

    return res.status(status).json({
      error: errorMessage,
      details: errMessage,
    });
  }
});

// API endpoints for Stripe Payments
app.get("/api/stripe/config", (req, res) => {
  res.json({
    isConfigured: !!process.env.STRIPE_SECRET_KEY,
  });
});

app.post("/api/stripe/create-checkout-session", async (req, res) => {
  try {
    const { planId } = req.body;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      return res.status(400).json({
        error: "Stripe n'est pas configuré sur le serveur. Veuillez ajouter STRIPE_SECRET_KEY dans les variables d'environnement.",
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16" as any,
    });

    let planName = "LoveReply Starter";
    let planPriceCents = 299; // 2.99 €
    let planDescription = "Abonnement Starter - 50 générations de réponses par jour";

    if (planId === "premium") {
      planName = "LoveReply Premium";
      planPriceCents = 699; // 6.99 €
      planDescription = "Abonnement Premium - Réponses et scans illimités ♾️";
    }

    // Build checkout session configuration supporting Cards, Link, Apple Pay, Google Pay, and other standard payment methods automatically via Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: planName,
              description: planDescription,
            },
            unit_amount: planPriceCents,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.origin || "http://localhost:3000"}/?status=success&plan=${planId}`,
      cancel_url: `${req.headers.origin || "http://localhost:3000"}/?status=cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("Erreur de création de session Stripe:", err);
    res.status(500).json({
      error: "Impossible de créer la session de paiement Stripe.",
      details: err.message,
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
