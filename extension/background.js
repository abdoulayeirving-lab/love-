// Background Service Worker for LoveReply AI Chrome Extension

// Configure sidepanel to open on extension icon click
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Erreur lors de la configuration du Side Panel:", error));
});

// State to store conversation data in memory if storage.session is unavailable
let latestConversationData = null;

// Listen to messages from content.js or sidepanel.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background reçu message:", message);

  if (message.type === "CONVERSATION_UPDATED") {
    // Store conversation data
    latestConversationData = message.data;
    
    // Attempt to store in session storage (Chrome 114+)
    if (chrome.storage && chrome.storage.session) {
      chrome.storage.session.set({ latestConversation: message.data })
        .catch((err) => console.warn("Erreur stockage session:", err));
    }

    // Forward the update to the sidepanel if it's currently open
    chrome.runtime.sendMessage({
      type: "CONVERSATION_UPDATED",
      data: message.data
    }).catch(() => {
      // Ignore error if sidepanel is closed and not listening
    });

    sendResponse({ status: "success" });
  } 
  
  else if (message.type === "INJECT_REPLY") {
    // Find the active WhatsApp Web tab to inject the message
    chrome.tabs.query({ url: "https://web.whatsapp.com/*" }, (tabs) => {
      if (tabs && tabs.length > 0) {
        // Send message to content script of that tab
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "INJECT_TEXT",
          text: message.text
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Erreur injection:", chrome.runtime.lastError.message);
            sendResponse({ status: "error", message: chrome.runtime.lastError.message });
          } else {
            sendResponse({ status: "success", data: response });
          }
        });
      } else {
        sendResponse({ status: "error", message: "Onglet WhatsApp Web introuvable." });
      }
    });
    return true; // Keep channel open for asynchronous sendResponse
  } 
  
  else if (message.type === "GET_LATEST_CONVERSATION") {
    // Return stored conversation data
    if (chrome.storage && chrome.storage.session) {
      chrome.storage.session.get(["latestConversation"], (result) => {
        sendResponse({ data: result.latestConversation || latestConversationData });
      });
      return true; // Async
    } else {
      sendResponse({ data: latestConversationData });
    }
  }
});
