const GEMINI_API_KEY = "VOTRE_CLE_API_ICI"; // Remplacer par votre clé API Gemini réelle

console.log("LoveReply AI: Initialisation du script du panneau latéral.");

// --- STATE MANAGEMENT ---
let currentConversation = null;
let selectedBoosterMode = "none";

// --- DOM ELEMENTS ---
const elements = {
  connectionBadge: document.getElementById("connection-badge"),
  contactName: document.getElementById("contact-name"),
  chatStatus: document.getElementById("chat-status"),
  messagesContainer: document.getElementById("messages-container"),
  msgCountBadge: document.getElementById("msg-count-badge"),
  refreshBtn: document.getElementById("refresh-chat-btn"),
  generateBtn: document.getElementById("generate-replies-btn"),
  loadingSpinner: document.getElementById("loading-spinner"),
  resultsArea: document.getElementById("results-area"),
  
  // Analysis Panel
  detectedTone: document.getElementById("detected-tone"),
  detectedIntention: document.getElementById("detected-intention"),
  interestBadge: document.getElementById("interest-badge"),
  detectedAdvice: document.getElementById("detected-advice"),
  
  // Suggested Replies List
  repliesContainer: document.getElementById("replies-container")
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Setup Booster Buttons Click Listeners
  const boosterButtons = document.querySelectorAll(".booster-btn");
  boosterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Toggle active classes
      boosterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Update state
      selectedBoosterMode = btn.dataset.mode;
      console.log(`LoveReply AI: Mode booster sélectionné: ${selectedBoosterMode}`);
    });
  });

  // Setup Refresh Button Click Listener
  elements.refreshBtn.addEventListener("click", () => {
    requestManualRefresh();
  });

  // Setup Generate Button Click Listener
  elements.generateBtn.addEventListener("click", () => {
    generateLoveReplies();
  });

  // Load latest stored conversation from session memory
  fetchLatestConversation();
});

// --- COMMS & BACKGROUND INTEGRATION ---

// Fetch latest conversation context from background worker
function fetchLatestConversation() {
  chrome.runtime.sendMessage({ type: "GET_LATEST_CONVERSATION" }, (response) => {
    if (response && response.data) {
      updateUIWithConversation(response.data);
    }
  });
}

// Request content.js to perform a fresh DOM scan and read
function requestManualRefresh() {
  elements.refreshBtn.classList.add("loading");
  
  chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (tabs) => {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "READ_CONVERSATION" }, (response) => {
        elements.refreshBtn.classList.remove("loading");
        if (response && response.success && response.data) {
          updateUIWithConversation(response.data);
        } else {
          console.warn("LoveReply AI: Échec de la mise à jour forcée.");
        }
      });
    } else {
      elements.refreshBtn.classList.remove("loading");
      alert("WhatsApp Web n'est pas ouvert dans un onglet actif.");
    }
  });
}

// Listen to incoming real-time notifications from content.js (via background)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CONVERSATION_UPDATED" && message.data) {
    updateUIWithConversation(message.data);
  }
});

// Update the UI HTML components based on current WhatsApp chat data
function updateUIWithConversation(data) {
  currentConversation = data;
  console.log("LoveReply AI: Affichage des données de conversation:", data);

  // Connection badge active styling
  const badgeDot = elements.connectionBadge.querySelector(".status-dot");
  const badgeLabel = elements.connectionBadge.querySelector(".status-label");
  badgeDot.classList.add("active");
  badgeLabel.textContent = "WhatsApp Web Connecté";

  // Contact name & status text
  elements.contactName.textContent = data.contact || "Discussion active";
  elements.chatStatus.textContent = data.lastReceived 
    ? `Dernier message: "${truncateText(data.lastReceived, 30)}"` 
    : "Prêt à générer";

  // Messages count badge
  const msgCount = data.messages ? data.messages.length : 0;
  elements.msgCountBadge.textContent = msgCount;

  // Clear container
  elements.messagesContainer.innerHTML = "";

  if (msgCount === 0) {
    elements.messagesContainer.innerHTML = `
      <div class="empty-state">
        Aucun message textuel n'a pu être lu. Assurez-vous d'avoir des messages visibles à l'écran.
      </div>`;
    return;
  }

  // Render miniature conversation bubbles in the sidepanel
  data.messages.forEach(msg => {
    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${msg.sender === "Eux" ? "in" : "out"}`;
    
    const textNode = document.createElement("span");
    textNode.textContent = msg.text;
    bubble.appendChild(textNode);
    
    const metaNode = document.createElement("span");
    metaNode.className = "msg-meta";
    metaNode.textContent = msg.sender === "Eux" ? "Reçu" : "Envoyé";
    bubble.appendChild(metaNode);
    
    elements.messagesContainer.appendChild(bubble);
  });

  // Scroll to bottom of preview
  elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// --- GEMINI REST API INTEGRATION ---

// Call Gemini API directly via secure fetch with responseSchema parameter
async function generateLoveReplies() {
  if (!currentConversation || !currentConversation.messages || currentConversation.messages.length === 0) {
    alert("Veuillez d'abord ouvrir une conversation sur WhatsApp Web pour que l'IA puisse l'analyser.");
    return;
  }

  if (GEMINI_API_KEY === "VOTRE_CLE_API_ICI" || !GEMINI_API_KEY.trim()) {
    alert("Clé API Gemini absente ! Veuillez l'entrer à la première ligne du fichier /extension/sidepanel.js.");
    return;
  }

  // Visual loaders
  elements.loadingSpinner.classList.remove("hidden");
  elements.resultsArea.classList.add("hidden");
  elements.generateBtn.disabled = true;

  // Formatting chat history for model prompt context
  let historyFormatted = "";
  currentConversation.messages.forEach((msg, idx) => {
    historyFormatted += `[MESSAGE ${idx + 1}] — ${msg.sender === "Eux" ? "L'autre personne" : "Moi"} : "${msg.text}"\n`;
  });

  const lastMsg = currentConversation.lastReceived || "aucun message récent reçu";

  // Prompt build
  const prompt = `Tu es un expert en communication séductrice, naturelle, spirituelle et charismatique.

CONTEXTE DE LA CONVERSATION WHATSAPP :
Nom du contact : ${currentConversation.contact}
Historique récent :
${historyFormatted}
Dernier message reçu : "${lastMsg}"

MODE BOOSTER ACTIF : ${selectedBoosterMode.toUpperCase()}

ANALYSE D'ABORD :
- Quel est le ton émotionnel de cette conversation ?
- Quelle est l'intention probable derrière ce dernier message ?
- Quel niveau d'intérêt montre cette personne ?

GÉNÈRE EXACTEMENT 4 RÉPONSES de styles variés (romantique, piquant, drôle, intriguant, etc.) respectant rigoureusement le Mode Booster spécifié.
Mode Booster [${selectedBoosterMode}] :
- none / standard: Réponses équilibrées, naturelles et chaleureuses.
- ultra_drague: Réponses flirteuses, assumées, un brin charmeuses et mystérieuses.
- ultra_mignon: Réponses douces, complices, sincères, mignonnes et rassurantes.
- funny: Réponses pleines d'humour, d'autodérision, de peps ou taquines.
- ice_cold: Réponses un peu plus détachées, confiantes, l'art du "fuis-moi je te suis" captivant.

Format de sortie STRICTEMENT en JSON :
Respecte rigoureusement la structure de schéma JSON demandée.`;

  try {
    // API Call to Gemini 3.5 Flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              analysis: {
                type: "OBJECT",
                properties: {
                  tone: { type: "STRING", description: "Le ton global de l'échange (ex: Taquin, Sincère, Romantique, Neutre)" },
                  intention: { type: "STRING", description: "Phrase courte résumant son intention probable" },
                  interest_level: { type: "STRING", description: "Niveau d'intérêt : high, medium ou low" },
                  advice: { type: "STRING", description: "Un conseil d'attitude pertinent en une phrase" }
                },
                required: ["tone", "intention", "interest_level", "advice"]
              },
              replies: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    style: { type: "STRING", description: "Emoji + Intitulé de style (ex: 🔥 Taquin, 🥰 Romantique, 😂 Sarcophage)" },
                    text: { type: "STRING", description: "Le message naturel prêt à être envoyé (sans guillemets)" },
                    why: { type: "STRING", description: "Pourquoi ce message est efficace en 1 phrase" },
                    sentiment: { type: "STRING", description: "Sentiment dominant de la réponse générée : 'positive', 'neutral' ou 'negative'" },
                    sentimentScore: { type: "INTEGER", description: "Intensité sentimentale/émotionnelle de la réponse de 0 à 100" }
                  },
                  required: ["style", "text", "why", "sentiment", "sentimentScore"]
                }
              }
            },
            required: ["analysis", "replies"]
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API Gemini: ${response.status} ${response.statusText}`);
    }

    const jsonResult = await response.json();
    console.log("LoveReply AI: Résultat brut de Gemini:", jsonResult);

    // Extract content
    const textResponse = jsonResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Format de réponse de l'API Gemini non valide ou vide.");
    }

    // Parse structured JSON
    const payload = JSON.parse(textResponse);
    displayResults(payload);

  } catch (err) {
    console.error("LoveReply AI: Erreur génération:", err);
    alert(`Erreur d'analyse: ${err.message || err}. Vérifiez votre clé API.`);
  } finally {
    elements.loadingSpinner.classList.add("hidden");
    elements.generateBtn.disabled = false;
  }
}

// Render Gemini's output inside the sidepanel
function displayResults(data) {
  // 1. Psychological Analysis Display
  elements.detectedTone.textContent = data.analysis.tone || "Indéterminé";
  elements.detectedIntention.textContent = data.analysis.intention || "Inconnue";
  elements.detectedAdvice.textContent = data.analysis.advice || "Soyez vous-même !";

  // Interest Badge Class & Label
  const interest = (data.analysis.interest_level || "medium").toLowerCase();
  elements.interestBadge.textContent = interest === "high" ? "Intérêt Élevé" : interest === "medium" ? "Intérêt Moyen" : "Intérêt Faible";
  elements.interestBadge.className = `badge-interest ${interest}`;

  // 2. Clear previous replies
  elements.repliesContainer.innerHTML = "";

  // 3. Render Replies
  data.replies.forEach((reply, idx) => {
    const card = document.createElement("div");
    card.className = "reply-card";

    // Header
    const cardHeader = document.createElement("div");
    cardHeader.className = "reply-card-header";
    
    const styleTag = document.createElement("span");
    styleTag.className = "reply-style-tag";
    styleTag.textContent = reply.style;
    cardHeader.appendChild(styleTag);
    card.appendChild(cardHeader);

    // Text Content
    const replyBody = document.createElement("p");
    replyBody.className = "reply-body-text";
    replyBody.textContent = reply.text;
    card.appendChild(replyBody);

    // Sentiment indicator bar (from user requirement!)
    const sentiment = reply.sentiment || "positive";
    const sentimentScore = typeof reply.sentimentScore === "number" ? reply.sentimentScore : 75;
    
    const sentimentContainer = document.createElement("div");
    sentimentContainer.className = "sentiment-container";

    const sentimentLabelRow = document.createElement("div");
    sentimentLabelRow.className = "sentiment-label-row";

    const sentimentLabel = document.createElement("span");
    sentimentLabel.className = `sentiment-label ${sentiment}`;
    
    let sentimentEmoji = "😊";
    let sentimentText = "Sentiment Positif";
    if (sentiment === "neutral") {
      sentimentEmoji = "😐";
      sentimentText = "Sentiment Neutre";
    } else if (sentiment === "negative") {
      sentimentEmoji = "😏";
      sentimentText = "Sentiment Piquant";
    }
    
    sentimentLabel.innerHTML = `<span>${sentimentEmoji}</span> ${sentimentText}`;
    sentimentLabelRow.appendChild(sentimentLabel);

    const sentimentScoreText = document.createElement("span");
    sentimentScoreText.className = "sentiment-score";
    sentimentScoreText.textContent = `${sentimentScore}% d'intensité`;
    sentimentLabelRow.appendChild(sentimentScoreText);
    sentimentContainer.appendChild(sentimentLabelRow);

    const sentimentBarBg = document.createElement("div");
    sentimentBarBg.className = "sentiment-bar-bg";
    
    const sentimentBarFill = document.createElement("div");
    sentimentBarFill.className = `sentiment-bar-fill ${sentiment}`;
    sentimentBarFill.style.width = `${sentimentScore}%`;
    
    sentimentBarBg.appendChild(sentimentBarFill);
    sentimentContainer.appendChild(sentimentBarBg);
    card.appendChild(sentimentContainer);

    // AI advice explanation footer
    const replyWhy = document.createElement("div");
    replyWhy.className = "reply-why";
    replyWhy.innerHTML = `<span class="why-icon">💡</span> <span>${reply.why}</span>`;
    card.appendChild(replyWhy);

    // Action buttons row
    const actionsRow = document.createElement("div");
    actionsRow.className = "reply-actions";

    const insertBtn = document.createElement("button");
    insertBtn.className = "action-btn insert-btn";
    insertBtn.innerHTML = "✍️ Insérer dans WhatsApp";
    insertBtn.addEventListener("click", () => {
      injectIntoWhatsApp(reply.text, insertBtn);
    });
    actionsRow.appendChild(insertBtn);

    const copyBtn = document.createElement("button");
    copyBtn.className = "action-btn copy-btn";
    copyBtn.innerHTML = "📋 Copier";
    copyBtn.addEventListener("click", () => {
      copyToClipboard(reply.text, copyBtn);
    });
    actionsRow.appendChild(copyBtn);

    card.appendChild(actionsRow);
    elements.repliesContainer.appendChild(card);
  });

  // Display results section with a nice smooth state transition
  elements.resultsArea.classList.remove("hidden");
  elements.resultsArea.scrollIntoView({ behavior: "smooth" });
}

// Ask background/content to inject the selected text in active chat compose bar
function injectIntoWhatsApp(text, buttonElement) {
  const origHtml = buttonElement.innerHTML;
  buttonElement.innerHTML = "⏳ Injection...";
  buttonElement.disabled = true;

  chrome.runtime.sendMessage({
    type: "INJECT_REPLY",
    text: text
  }, (response) => {
    buttonElement.disabled = false;
    if (response && response.status === "success" && response.data && response.data.success) {
      buttonElement.innerHTML = "✅ Inséré !";
      setTimeout(() => buttonElement.innerHTML = origHtml, 1500);
    } else {
      console.warn("LoveReply AI: Échec d'injection directe, copie automatique...");
      navigator.clipboard.writeText(text);
      buttonElement.innerHTML = "📋 Copié (Échec direct)";
      setTimeout(() => buttonElement.innerHTML = origHtml, 2000);
    }
  });
}

// Copy to clipboard utility
function copyToClipboard(text, buttonElement) {
  const origHtml = buttonElement.innerHTML;
  navigator.clipboard.writeText(text)
    .then(() => {
      buttonElement.innerHTML = "✅ Copié !";
      buttonElement.style.borderColor = "var(--success)";
      setTimeout(() => {
        buttonElement.innerHTML = origHtml;
        buttonElement.style.borderColor = "var(--border)";
      }, 1500);
    })
    .catch((err) => {
      console.error("Échec copie:", err);
    });
}

// --- HELPERS ---
function truncateText(str, length) {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}
