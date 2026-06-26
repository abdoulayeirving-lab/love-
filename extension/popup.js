// Popup Script for LoveReply AI Chrome Extension

document.addEventListener("DOMContentLoaded", () => {
  const openPanelBtn = document.getElementById("open-panel-btn");

  openPanelBtn.addEventListener("click", async () => {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    
    if (tab) {
      // Check if we can open side panel via chrome.sidePanel (Chrome 116+)
      if (chrome.sidePanel && typeof chrome.sidePanel.open === "function") {
        try {
          await chrome.sidePanel.open({ tabId: tab.id });
          window.close(); // Close the popup after opening the side panel
        } catch (error) {
          console.error("Erreur ouverture side panel:", error);
          alert("Impossible d'ouvrir le panneau latéral. Assurez-vous d'être sur web.whatsapp.com ou d'utiliser une version récente de Chrome.");
        }
      } else {
        alert("Votre navigateur ne supporte pas l'API SidePanel. Veuillez ouvrir le panneau latéral manuellement depuis vos extensions ou mettre à jour Chrome.");
      }
    }
  });
});
