# Aviation HMI - Version 2.7.0 🎨
## Améliorations UX/UI - Guide Complet

### 📋 Vue d'ensemble

La version 2.7.0 apporte des améliorations majeures en termes d'expérience utilisateur, de personnalisation et d'accessibilité. Ces nouvelles fonctionnalités rendent l'interface plus intuitive, personnalisable et adaptée aux besoins de chaque utilisateur.

---

## 🎨 Nouveaux Modules

### 1. **Theme Manager** (`theme-manager.js`)

Système complet de gestion des thèmes avec personnalisation avancée.

#### Fonctionnalités :
- **6 thèmes prédéfinis** :
  - Mode Nuit (Dark) - Défaut cockpit
  - Mode Jour (Light) - Interface claire
  - Air France - Bleu marine et rouge
  - Lufthansa - Bleu foncé et jaune
  - Emirates - Rouge et or
  - British Airways - Bleu et rouge

- **Mode automatique jour/nuit** :
  - Détection de l'heure locale (6h-18h = jour, 18h-6h = nuit)
  - Changement automatique toutes les minutes
  - Option désactivable manuellement

- **4 tailles de police** :
  - Petit (87.5%) - Pour écrans haute résolution
  - Normal (100%) - Défaut
  - Grand (112.5%) - Meilleure lisibilité
  - Très Grand (125%) - Accessibilité maximale

- **Couleurs personnalisables** :
  - Couleur d'avertissement (warning)
  - Couleur d'attention (caution)
  - Couleur normale (normal)
  - Réinitialisation en 1 clic

#### Utilisation :
```javascript
// Changer de thème
window.themeManager.setTheme('airfrance');

// Changer la taille de police
window.themeManager.setFontSize('large');

// Activer le mode automatique
window.themeManager.setAutoTheme(true);

// Personnaliser une couleur
window.themeManager.setCustomColor('--color-warning', '#ff0000');

// Afficher le panneau de paramètres
window.themeManager.showSettings();
```

#### Accès Interface :
- Bouton palette 🎨 dans le topbar (en haut à droite)
- Panneau latéral avec aperçu en temps réel

---

### 2. **User Profiles** (`user-profiles.js`)

Gestion complète des profils utilisateurs avec préférences personnalisées.

#### Fonctionnalités :
- **Profils illimités** avec :
  - Nom personnalisé
  - Rôle (pilot, engineer, maintenance, admin)
  - Compagnie aérienne (applique le thème correspondant)
  - Préférences individuelles (thème, langue, taille de police)
  
- **Statistiques par profil** :
  - Nombre de sessions
  - Temps de vol total
  - Alarmes traitées
  - Date de dernière connexion

- **Import/Export** :
  - Sauvegarde des profils en JSON
  - Partage entre postes
  - Backup automatique

#### Utilisation :
```javascript
// Créer un nouveau profil
const profile = window.userProfiles.createProfile('Pilote AF', 'pilot', 'air-france');

// Changer de profil
window.userProfiles.switchProfile(profileId);

// Mettre à jour une préférence
window.userProfiles.updatePreference('theme', 'airfrance');

// Exporter un profil
window.userProfiles.exportProfile(profileId);

// Statistiques
window.userProfiles.incrementSession();
window.userProfiles.addFlightTime(120); // minutes
window.userProfiles.incrementAlarmsHandled();
```

#### Accès Interface :
- Sélecteur de profil dans le topbar (icône utilisateur)
- Dialogue de gestion avec statistiques complètes

---

### 3. **Animations Manager** (`animations.js`)

Système d'animations fluides et feedback visuel/haptique.

#### Fonctionnalités :
- **Animations intégrées** :
  - Fade in/out
  - Slide (left, right, up, down)
  - Scale in/out
  - Pulse
  - Shake (erreurs)
  - Bounce
  - Glow (highlight)

- **Feedback haptique** :
  - Vibration sur clic
  - Pattern personnalisé pour succès/erreur/warning
  - Compatible mobile/tablette

- **Éléments UI** :
  - Loading spinner personnalisé (avion)
  - Toast notifications (succès, erreur, info, warning)
  - Ripple effect sur les boutons
  - Page transitions
  - Smooth scrolling

#### Utilisation :
```javascript
// Animer un élément
await window.animations.fadeIn(element, 300);
await window.animations.slideIn(element, 'right');
await window.animations.pulse(element, 2);

// Feedback haptique
window.animations.hapticClick();
window.animations.hapticSuccess();
window.animations.hapticError();

// Loading overlay
const loadingId = window.animations.showLoading('container-id', 'Chargement...');
// ... opération async ...
window.animations.hideLoading(loadingId);

// Toast notification
window.animations.showToast('Opération réussie !', 'success', 3000);

// Smooth scroll
window.animations.scrollTo(element, 500);

// Highlight temporaire
window.animations.highlight(element, 1000);
```

#### Accès Interface :
- Effets automatiques sur interactions
- Désactivable via préférences

---

### 4. **Audio Manager** (`audio-manager.js`)

Gestion complète du son ambiant, effets et alertes vocales.

#### Fonctionnalités :
- **Sons d'ambiance cockpit** :
  - Bruit de moteur synthétique (80 Hz sawtooth)
  - Climatisation (white noise filtré)
  - Volume ajustable indépendamment

- **Effets sonores** :
  - Clic sur boutons
  - Succès (mélodie ascendante)
  - Erreur (tonalité descendante)
  - Warning continu (alternance 800-600 Hz)
  - Caution (600 Hz triangle)
  - Chime (C6-E6)

- **Alertes vocales** :
  - Synthèse vocale Web Speech API
  - Support multilingue (FR/EN/ES/DE/IT)
  - Annonce automatique des alarmes
  - Vitesse et pitch ajustables

#### Utilisation :
```javascript
// Sons d'ambiance
window.audioManager.playAmbientSound();
window.audioManager.stopAmbientSound();
window.audioManager.setAmbientVolume(0.3);

// Effets
window.audioManager.playClick();
window.audioManager.playSuccess();
window.audioManager.playError();
window.audioManager.playWarning(); // continu
window.audioManager.stopEffect('warning_alert');

// Synthèse vocale
window.audioManager.speak('Avertissement système hydraulique', 'fr-FR');
window.audioManager.announceAlarm('HYD-1-FAULT', 'warning');

// Volumes
window.audioManager.setMasterVolume(0.5);
window.audioManager.setEffectsVolume(0.7);

// Activation
window.audioManager.setEnabled(true);
window.audioManager.setVoiceEnabled(true);
```

#### Accès Interface :
- Bouton volume 🔊 dans le topbar
- Panneau avec sliders de volume
- Tests des sons intégrés

---

### 5. **Touch Gestures** (`touch-gestures.js`)

Support avancé des gestes tactiles pour tablette/mobile.

#### Fonctionnalités :
- **Gestes détectés** :
  - Swipe (gauche, droite, haut, bas)
  - Long press (maintien prolongé)
  - Pinch zoom (pincement)
  - Drag (glissement)
  - Tap (toucher simple)

- **Personnalisable** :
  - Distance minimale de swipe (défaut 50px)
  - Durée de long press (défaut 500ms)
  - Seuil de pinch

- **Helpers** :
  - Swipe navigation entre vues
  - Pinch zoom sur éléments
  - Drag & drop
  - Pull to refresh

#### Utilisation :
```javascript
// Écouter un geste
window.touchGestures.on('swipe', element, (e) => {
    console.log('Swipe direction:', e.detail.direction);
});

// Swipe navigation
window.touchGestures.addSwipeNavigation('.container', {
    left: () => console.log('Next page'),
    right: () => console.log('Previous page')
});

// Pinch zoom
window.touchGestures.addPinchZoom('.image', {
    minScale: 0.5,
    maxScale: 3,
    onZoom: (scale) => console.log('Scale:', scale)
});

// Drag
window.touchGestures.makeDraggable('.element', {
    axis: 'x', // 'x', 'y', ou null (both)
    onDrag: ({ x, y }) => console.log('Position:', x, y)
});

// Pull to refresh
window.touchGestures.addPullToRefresh('.scroll-container', () => {
    location.reload();
});
```

#### Événements :
```javascript
document.addEventListener('gesture:swipe', (e) => {
    console.log(e.detail.direction); // left, right, up, down
});

document.addEventListener('gesture:longpress', (e) => {
    console.log('Long press at', e.detail.x, e.detail.y);
});

document.addEventListener('gesture:pinch', (e) => {
    console.log('Scale:', e.detail.scale);
});
```

---

## 📱 Responsive Design Complet

### Points de rupture :
- **Desktop** : > 1024px - Layout complet 3 colonnes
- **Tablet Portrait** : 768px-1024px - Sidebar réduit
- **Mobile Landscape** : 480px-768px - Layout flexible
- **Mobile Portrait** : < 480px - Layout vertical optimisé

### Optimisations Mobile :
- Tailles de boutons tactiles (min 44px)
- Scroll horizontal sur bottombar
- Modals plein écran
- Police adaptative
- Touch feedback amélioré

### Orientation :
- Portrait : Layout vertical empilé
- Landscape : Layout horizontal compact

---

## 🎯 Nouveaux Boutons UI

### Topbar (barre supérieure) :
- **👤 Profile Selector** : Changement rapide de profil
- **🌐 Language Selector** : Sélection de langue
- **🎨 Theme Settings** : Personnalisation du thème
- **🔊 Audio Settings** : Paramètres audio

### Bottombar (barre inférieure) :
- Tous les boutons existants avec data-i18n pour traduction automatique

---

## ⚙️ Préférences Sauvegardées

Tout est automatiquement sauvegardé dans localStorage :

### Theme Manager :
- `aviation-hmi-theme` → theme, fontSize, autoTheme, customColors

### User Profiles :
- `aviation-hmi-profiles` → profiles[], currentProfile

### Animations :
- `aviation-hmi-animations` → enabled, hapticsEnabled

### Audio :
- `aviation-hmi-audio` → enabled, ambientEnabled, voiceEnabled, volumes

### Touch Gestures :
- `aviation-hmi-gestures` → enabled, longPressDuration, minSwipeDistance

---

## 🌍 Traductions Ajoutées (FR/EN)

### Nouvelles clés i18n :
```javascript
// Thème
theme.title, theme.theme_label, theme.font_size_label, theme.custom_colors, 
theme.auto_theme, theme.warning_color, theme.caution_color, theme.normal_color,
theme.reset_colors

// Profils
profile.new, profile.manage, profile.manage_title, profile.export, 
profile.delete, profile.confirm_delete, profile.enter_name, profile.enter_role,
profile.enter_company, profile.created_success

// Audio
audio.title, audio.enable_all, audio.master_volume, audio.ambient_sounds,
audio.ambient_volume, audio.effects_volume, audio.voice_alerts, audio.test_sounds,
audio.test_click, audio.test_success, audio.test_error, audio.test_warning,
audio.test_voice, audio.test_voice_message, audio.warning_alarm,
audio.caution_alarm, audio.advisory_alarm
```

---

## 🚀 Workflow d'Utilisation

### Premier lancement :
1. Création automatique du profil par défaut
2. Application du thème Dark
3. Langue détectée automatiquement (ou FR par défaut)
4. Sons ambiant désactivés (activation manuelle)

### Personnalisation :
1. Cliquer sur 👤 pour créer/changer de profil
2. Cliquer sur 🎨 pour personnaliser le thème
3. Cliquer sur 🔊 pour ajuster les sons
4. Cliquer sur 🌐 pour changer la langue

### Navigation tactile (mobile/tablette) :
- Swipe gauche/droite : Navigation entre vues
- Long press : Menu contextuel
- Pinch : Zoom sur éléments
- Pull down : Refresh

---

## 📊 Statistiques Profil

Chaque profil collecte automatiquement :
- **Sessions** : Incrémentées à chaque chargement
- **Temps de vol** : Ajouté via `addFlightTime(minutes)`
- **Alarmes traitées** : Incrémentées via `incrementAlarmsHandled()`
- **Dernière connexion** : Timestamp de dernier switchProfile

---

## 🎨 CSS Variables Personnalisables

Toutes les couleurs sont exposées via CSS variables :

```css
--bg-primary, --bg-secondary, --bg-tertiary
--text-primary, --text-secondary, --text-tertiary
--color-warning, --color-caution, --color-normal, --color-info
--border-color, --shadow-color, --accent-color
--font-size-base, --font-size-small, --font-size-large
```

---

## 🔌 Intégration dans app.js

La fonction `initEnhancements()` initialise automatiquement tous les modules dans cet ordre :
1. i18n (v2.6.0)
2. userProfiles (v2.7.0) + application des préférences
3. themeManager (v2.7.0)
4. audioManager (v2.7.0)
5. touchGestures (v2.7.0)
6. animations (v2.7.0)

Retry automatique après 100ms et 500ms si modules non chargés.

---

## 🐛 Debug

Console logs préfixés :
- `[THEME]` : Theme Manager
- `[PROFILES]` : User Profiles
- `[AUDIO]` : Audio Manager
- `[GESTURES]` : Touch Gestures
- `[ANIMATIONS]` : Animations Manager

---

## 📝 Notes Techniques

### Performance :
- Animations désactivables via `prefers-reduced-motion`
- Throttling des événements tactiles
- Lazy loading des sons
- Debouncing des sauvegardes

### Compatibilité :
- Web Audio API (Chrome 35+, Firefox 25+, Safari 14.1+)
- Web Speech API (Chrome 33+, Safari 14.1+)
- Touch Events (tous navigateurs mobiles)
- Vibration API (Chrome 32+, Firefox 16+)

### Accessibilité :
- Tailles de police adaptatives
- Contraste WCAG AA minimum
- Support clavier complet
- ARIA labels sur éléments interactifs
- Mode réduit mouvement respecté

---

## 🎉 Résumé v2.7.0

**5 nouveaux modules** | **1,800+ lignes CSS** | **2,500+ lignes JS** | **50+ nouvelles traductions**

✅ Thèmes personnalisables (6 prédéfinis + custom)
✅ Profils utilisateurs avec statistiques
✅ Animations fluides + feedback haptique
✅ Sons ambiant cockpit + alertes vocales
✅ Gestes tactiles avancés
✅ Responsive design complet (desktop/tablet/mobile)
✅ Toutes les préférences sauvegardées
✅ Interface 100% traduisible automatiquement

---

## 🔮 Prochaines Évolutions Possibles

- Synchronisation cloud des profils
- Plus de thèmes (Singapore Airlines, Emirates, etc.)
- Raccourcis clavier personnalisables
- Mode offline avancé
- Thèmes saisonniers automatiques
- Reconnaissance vocale pour commandes
- Mode daltonien
- Export PDF des préférences
- Widget météo intégré
- Timeline des événements
