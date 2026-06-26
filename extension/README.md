# 💘 LoveReply AI - Intégration WhatsApp Web (Extension Chrome)

Cette extension Chrome vous permet d'intégrer **LoveReply AI** directement dans l'interface de **WhatsApp Web**. Elle lit automatiquement l'historique de votre discussion active pour vous proposer des suggestions de réponses de séduction hautement personnalisées, adaptées au contexte et au mode Booster choisi.

---

## ✨ Fonctionnalités clés

- **Lecteur Intelligent de Chat** : Analyse en temps réel les 10 derniers messages échangés (entrants et sortants) pour un contexte optimal.
- **Modes Booster Intégrés** : Sélectionnez votre attitude en 1 clic (Standard 🎯, Drague 🔥, Mignon 🥰, Funny 😂, Ice Cold 😎).
- **Analyse Psychologique par Gemini** : Détecte le ton de la conversation, estime l'intention probable du contact et donne un conseil d'attitude immédiat.
- **Score d'Intensité Sentimentale** : Affiche un indicateur visuel de sentiment (Positif, Neutre, Piquant) pour chaque suggestion de réponse.
- **Injection Directe en 1 Clic** : Insérez la réponse de votre choix directement dans la barre de saisie WhatsApp d'un simple clic, sans avoir besoin de copier-coller.
- **Bouton Flottant Intégré** : Un bouton discret est injecté directement dans l'interface WhatsApp Web à côté de votre zone de saisie pour une utilisation fluide.

---

## 🛠️ Configuration Initiale (Ajout de la Clé API Gemini)

Pour des raisons de performance et de sécurité au sein de l'extension locale, l'extension effectue ses appels directement vers l'API officielle de Google Gemini. Vous devez y ajouter votre propre clé API Gemini :

1. Ouvrez le fichier `/extension/sidepanel.js` dans l'éditeur de code.
2. À la toute première ligne, remplacez `"VOTRE_CLE_API_ICI"` par votre clé API Gemini réelle :
   ```javascript
   const GEMINI_API_KEY = "AIzaSy..."; // Insérez votre clé ici
   ```
3. Enregistrez le fichier.

---

## 🚀 Instructions d'Installation dans Google Chrome

1. Ouvrez votre navigateur **Google Chrome** (ou tout navigateur basé sur Chromium comme Brave, Opera, Edge).
2. Accédez à la page de gestion des extensions en saisissant l'adresse suivante dans votre barre de recherche :
   ```text
   chrome://extensions/
   ```
3. En haut à droite, activez l'interrupteur du **"Mode développeur"** (Developer Mode).
4. En haut à gauche, cliquez sur le bouton **"Charger l'extension non empaquetée"** (Load unpacked).
5. Dans l'explorateur de fichiers, sélectionnez le dossier **/extension/** de ce projet.
6. Félicitations, l'extension **LoveReply AI** est maintenant installée !
7. *(Optionnel)* Cliquez sur l'icône de pièce de puzzle (Extensions) dans la barre d'outils de Chrome et épinglez l'icône 💘 de **LoveReply AI** pour un accès rapide.

---

## 📱 Comment l'utiliser avec WhatsApp Web

1. Ouvrez votre page [WhatsApp Web](https://web.whatsapp.com/) et connectez-vous si nécessaire.
2. Cliquez sur l'icône de l'extension **LoveReply AI** 💘 dans votre barre d'outils Chrome, puis cliquez sur **"Ouvrir le Panneau Latéral"**. Le panneau latéral de Chrome s'ouvre à droite de votre écran.
3. Cliquez sur n'importe quelle discussion active dans WhatsApp Web.
4. L'extension synchronise automatiquement les messages ! Vous verrez l'historique récent s'afficher dans la zone de prévisualisation du panneau latéral.
5. Vous pouvez également cliquer sur le bouton 💘 injecté à côté de la zone de saisie de texte dans WhatsApp Web pour synchroniser instantanément.
6. Choisissez votre **Mode Booster** préféré.
7. Cliquez sur **"Générer des Réponses"** ✨.
8. Lisez l'analyse psychologique et examinez les réponses générées avec leurs indicateurs de sentiment.
9. Cliquez sur **"✍️ Insérer dans WhatsApp"** pour placer instantanément la suggestion dans votre barre de saisie WhatsApp, ou sur **"📋 Copier"** pour copier le texte brut dans votre presse-papiers.
10. Relisez, adaptez si nécessaire, et appuyez sur **Entrée** dans WhatsApp pour envoyer !

---

## 📂 Structure des Fichiers créés

L'extension est entièrement autonome et structurée de la manière suivante :
- `manifest.json` : Métadonnées et permissions requises.
- `background.js` : Gestionnaire de tâches en arrière-plan et routage des messages.
- `content.js` : Script injecté lisant le DOM WhatsApp Web et gérant l'écriture.
- `sidepanel.html` & `sidepanel.css` : Interface utilisateur moderne et optimisée.
- `sidepanel.js` : Logique d'analyse, de sélection des modes et appels directs à Gemini AI.
- `popup.html` & `popup.js` : Fenêtre pop-up de démarrage rapide de l'extension.
- `icons/` : Icônes d'application aux formats réglementaires requis par Google Chrome.
