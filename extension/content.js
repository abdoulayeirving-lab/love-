// Content Script for LoveReply AI - WhatsApp Web Integration

console.log("LoveReply AI: Script de contenu WhatsApp Web injecté.");

// --- UTILS & SELECTORS ---

// WhatsApp Web DOM Selectors
const SELECTORS = {
  chatHeaderName: "header span[title], header div[role='button'] span[title]",
  composeBox: "[data-testid='conversation-compose-box-input'], footer [contenteditable='true']",
  messageContainer: "div[data-testid='msg-container'], div.message-in, div.message-out, div.focusable-list-item",
  messageText: "span.selectable-text, .copyable-text span",
  inputToolbar: "footer > div:first-child > div:first-child" // Container next to emoji/attachment
};

// Helper to determine if a message is received or sent
function getMessageSender(element) {
  // Check classes or attributes
  const classList = element.className || "";
  const html = element.innerHTML || "";
  
  if (classList.includes("message-in") || html.includes("message-in")) {
    return "Eux";
  }
  if (classList.includes("message-out") || html.includes("message-out")) {
    return "Moi";
  }
  
  // Fallback to data attribute checks
  const parentWithAttr = element.closest("[data-id]");
  if (parentWithAttr) {
    const dataId = parentWithAttr.getAttribute("data-id") || "";
    if (dataId.startsWith("false_")) return "Eux"; // WhatsApp Web standard message ID structure
    if (dataId.startsWith("true_")) return "Moi";
  }

  // Fallback check based on layout/styling
  const flexDiv = element.querySelector(".flex-row-reverse");
  if (flexDiv) return "Moi";

  return "Eux"; // Default to received
}

// Read the active conversation messages
function readConversation() {
  const contactNameElement = document.querySelector(SELECTORS.chatHeaderName);
  const contactName = contactNameElement ? contactNameElement.getAttribute("title") || contactNameElement.innerText : "Contact Inconnu";
  
  const messageElements = Array.from(document.querySelectorAll(SELECTORS.messageContainer));
  console.log(`LoveReply AI: ${messageElements.length} éléments de message trouvés.`);
  
  // Extract messages text and sender
  const rawMessages = messageElements.map((el) => {
    const textElement = el.querySelector(SELECTORS.messageText);
    if (!textElement) return null;
    
    const text = textElement.innerText || textElement.textContent || "";
    if (!text.trim()) return null;

    const sender = getMessageSender(el);
    return { sender, text };
  }).filter(msg => msg !== null);

  // Keep the last 10 messages for context
  const last10Messages = rawMessages.slice(-10);
  
  // Find the last received message (from "Eux")
  const receivedMessages = last10Messages.filter(msg => msg.sender === "Eux");
  const lastReceived = receivedMessages.length > 0 ? receivedMessages[receivedMessages.length - 1].text : "";

  return {
    contact: contactName,
    messages: last10Messages,
    lastReceived: lastReceived
  };
}

// Send read data to background / sidepanel
function sendConversationUpdate() {
  try {
    const data = readConversation();
    console.log("LoveReply AI: Mise à jour conversation lue:", data);
    
    chrome.runtime.sendMessage({
      type: "CONVERSATION_UPDATED",
      data: data
    }, (response) => {
      // Check for error but suppress console noise
      if (chrome.runtime.lastError) {
        console.log("LoveReply AI: Le panneau latéral n'est pas encore ouvert.");
      } else {
        console.log("LoveReply AI: Données envoyées avec succès.");
      }
    });
  } catch (error) {
    console.error("LoveReply AI: Erreur lors de la lecture de la conversation:", error);
  }
}

// --- BUTTON INJECTION ---

// Create and inject the "Répondre avec IA" button
function injectAIButton() {
  // Check if button already exists
  if (document.getElementById("lovereply-btn-container")) return;

  const composeBox = document.querySelector(SELECTORS.composeBox);
  if (!composeBox) return;

  const footer = composeBox.closest("footer");
  if (!footer) return;

  // Create button container
  const btnContainer = document.createElement("div");
  btnContainer.id = "lovereply-btn-container";
  btnContainer.style.display = "flex";
  btnContainer.style.alignItems = "center";
  btnContainer.style.justifyContent = "center";
  btnContainer.style.margin = "0 8px";
  btnContainer.style.padding = "4px";
  btnContainer.style.borderRadius = "50%";
  btnContainer.style.cursor = "pointer";
  btnContainer.style.transition = "background-color 0.2s, transform 0.2s";
  btnContainer.title = "Générer une réponse avec LoveReply AI";

  // Create button element
  const button = document.createElement("div");
  button.innerHTML = "💘";
  button.style.fontSize = "22px";
  button.style.lineHeight = "1";
  button.style.filter = "drop-shadow(0px 1px 2px rgba(0,0,0,0.15))";
  
  btnContainer.appendChild(button);

  // Hover states matching WhatsApp's interface
  btnContainer.addEventListener("mouseenter", () => {
    btnContainer.style.backgroundColor = "rgba(233, 30, 99, 0.1)";
    btnContainer.style.transform = "scale(1.1)";
  });
  btnContainer.addEventListener("mouseleave", () => {
    btnContainer.style.backgroundColor = "transparent";
    btnContainer.style.transform = "scale(1)";
  });

  // Action on click
  btnContainer.addEventListener("click", () => {
    btnContainer.style.transform = "scale(0.9)";
    setTimeout(() => btnContainer.style.transform = "scale(1.1)", 100);
    
    // Read conversation and notify panel
    sendConversationUpdate();
    
    // Notify user with a brief visual pulse
    const originalIcon = button.innerHTML;
    button.innerHTML = "✨";
    setTimeout(() => {
      button.innerHTML = originalIcon;
    }, 1000);
  });

  // Find where to inject
  // WhatsApp compose layout usually has a tray with micro/send button and attachment clip
  // We can inject next to the compose box inside the main tray
  const composeBoxContainer = composeBox.parentElement;
  if (composeBoxContainer) {
    // Insert just before the compose box parent or at the end of composeBoxContainer
    composeBoxContainer.style.display = "flex";
    composeBoxContainer.style.alignItems = "center";
    composeBoxContainer.appendChild(btnContainer);
    console.log("LoveReply AI: Bouton injecté à côté de la boîte de saisie.");
  } else {
    // Fallback: floating in the bottom-right of the compose area
    btnContainer.style.position = "absolute";
    btnContainer.style.right = "70px";
    btnContainer.style.bottom = "15px";
    btnContainer.style.zIndex = "999";
    footer.appendChild(btnContainer);
    console.log("LoveReply AI: Bouton injecté en mode flottant.");
  }
}

// --- TEXT INJECTION ENGINE ---

// Inject text into WhatsApp input box and simulate React inputs
function injectTextIntoWhatsApp(text) {
  const composeBox = document.querySelector(SELECTORS.composeBox);
  if (!composeBox) {
    alert("Impossible de trouver la zone de texte WhatsApp Web. Assurez-vous d'avoir une conversation ouverte.");
    return false;
  }

  composeBox.focus();

  // Try to use execCommand first (perfect React synchronization)
  try {
    // Select everything currently in the box if the user wants to overwrite
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
    console.log("LoveReply AI: Texte inséré avec execCommand.");
    return true;
  } catch (error) {
    console.warn("LoveReply AI: Échec execCommand, tentative de repli standard...", error);
    
    // Standard DOM fallback
    composeBox.textContent = text;
    composeBox.innerText = text;
    
    // Dispatch required input events to update React's internal state
    const inputEvent = new Event("input", { bubbles: true, cancelable: true });
    composeBox.dispatchEvent(inputEvent);
    
    const changeEvent = new Event("change", { bubbles: true });
    composeBox.dispatchEvent(changeEvent);

    console.log("LoveReply AI: Texte inséré via DOM standard.");
    return true;
  }
}

// --- MESSAGE LISTENERS ---

// Receive instructions from background/sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "INJECT_TEXT") {
    const success = injectTextIntoWhatsApp(message.text);
    sendResponse({ success: success });
  } 
  else if (message.type === "READ_CONVERSATION") {
    const data = readConversation();
    sendResponse({ success: true, data: data });
  }
});

// --- OBSERVERS & MONITORING ---

// Watch for DOM changes to automatically inject button when user changes chat
const observer = new MutationObserver((mutations) => {
  // Try to inject button
  injectAIButton();
  
  // Periodic read when active conversation container content shifts (new messages)
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      // If a message was added, trigger silent background sync
      const addedNode = mutation.addedNodes[0];
      if (addedNode.nodeType === Node.ELEMENT_NODE && 
         (addedNode.closest?.(SELECTORS.messageContainer) || addedNode.classList?.contains("message-in"))) {
        console.log("LoveReply AI: Nouveau message détecté, synchronisation...");
        sendConversationUpdate();
        break;
      }
    }
  }
});

// Start monitoring the document body
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Try to initial inject
setTimeout(() => {
  injectAIButton();
  sendConversationUpdate();
}, 2000);

// Also sync periodically every 5 seconds if chat is active to keep in sync
setInterval(() => {
  if (document.querySelector(SELECTORS.composeBox)) {
    sendConversationUpdate();
  }
}, 5000);
