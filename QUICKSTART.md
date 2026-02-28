# ⚡ Quick Start — AERO-DIAG

Guide de démarrage rapide pour commencer avec AERO-DIAG en quelques minutes.

## 🚀 Démarrage Ultra-Rapide

### Option 1 : Sans installation (Navigateur uniquement)

```bash
# Ouvrir directement le fichier
open index.html
# ou
firefox index.html
# ou
chrome index.html
```

**Limitation** : Certaines fonctionnalités avancées peuvent ne pas fonctionner sans serveur HTTP.

---

### Option 2 : Avec serveur simple (Python)

```bash
# Python 3 (recommandé)
python3 -m http.server 8000

# Puis ouvrir : http://localhost:8000
```

---

### Option 3 : Avec npm (Mode développement complet)

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de dev
npm run dev

# ✅ Le navigateur s'ouvrira automatiquement sur http://localhost:3000
```

---

## 🎮 Utilisation Rapide

### Navigation

1. **Sélectionner un système** dans la barre latérale gauche
   - Moteurs, Hydraulique, Électrique, etc.

2. **Observer les paramètres** en temps réel
   - Vert 🟢 = Normal
   - Orange 🟠 = Caution
   - Rouge 🔴 = Warning

3. **Consulter les alarmes** dans le panneau droit

### Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `F` | Geler/Reprendre la simulation |
| `S` | Prendre un instantané |
| `A` | Acquitter toutes les alarmes |
| `R` | Réinitialiser le système |
| `T` | Mode test (générer des alarmes) |
| `1-7` | Sélection rapide des systèmes |

### Actions Principales

| Bouton | Description |
|--------|-------------|
| **FREEZE** | Fige les valeurs actuelles |
| **SNAPSHOT** | Capture l'état actuel |
| **ACK ALL** | Acquitte toutes les alarmes |
| **RESET** | Réinitialise tout |
| **EXPORT CFR** | Télécharge le rapport JSON |
| **TEST MODE** | Génère des alarmes de test |

---

## 🛠 Commandes npm Utiles

```bash
# Développement
npm run dev              # Serveur de développement avec hot-reload

# Build
npm run build            # Build de production (→ dossier dist/)
npm run preview          # Prévisualiser le build de production

# Tests
npm test                 # Lancer les tests unitaires
npm run test:watch       # Tests en mode watch
npm run test:coverage    # Rapport de couverture

# Qualité du code
npm run lint             # Vérifier le code avec ESLint
npm run lint:fix         # Corriger automatiquement les erreurs
npm run format           # Formatter le code avec Prettier
npm run format:check     # Vérifier le formatage

# Vérification complète
npm run check            # Lint + Format + Tests
```

---

## 📁 Structure du Projet

```
aviation-hmi/
├── index.html          ← Interface principale
├── app.js              ← Logique applicative
├── style.css           ← Styles et responsive
├── config.js           ← Configuration (NEW!)
├── package.json        ← Dépendances npm
├── vite.config.js      ← Config Vite
└── tests/              ← Tests unitaires
    └── app.test.js
```

---

## 🐛 Dépannage Rapide

### Le site ne charge pas

```bash
# Vérifier que le port n'est pas occupé
lsof -i :3000

# Changer le port dans vite.config.js
server: { port: 3001 }
```

### Les styles ne s'appliquent pas

```bash
# Vider le cache du navigateur
# Chrome : Ctrl+Shift+Del
# Firefox : Ctrl+Shift+Del
```

### Les tests échouent

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur de dépendances

```bash
# Utiliser la version recommandée de Node
node -v  # Devrait être ≥ 18.0.0

# Mettre à jour npm
npm install -g npm@latest
```

---

## 📊 Surveiller les Systèmes

### Moteurs (ENG1 / ENG2)
- **N1** : Vitesse fan (0-104%)
- **EGT** : Température gaz d'échappement (0-950°C)
- **N2** : Vitesse core (0-105%)
- **FF** : Fuel flow (0-3000 kg/h)
- **Oil Press** : Pression huile (20-95 PSI)
- **Vib N1** : Vibrations (0-6 mils)

### Hydraulique
- **Circuits** : Green, Blue, Yellow
- **Pression** : 1500-3500 PSI
- **Quantité** : 70-100%
- **Température** : 20-100°C

### Électrique
- **AC Bus** : 95-125V (nominal 115V)
- **DC Bus** : 22-30V (nominal 28V)
- **Générateurs** : Charge 0-95%
- **Batterie** : État et température

---

## 🎯 Scénarios de Test

### 1. Vol Normal
```
1. Laisser tourner en mode normal
2. Observer les variations naturelles
3. Aucune alarme ne devrait apparaître
```

### 2. Test Alarmes
```
1. Cliquer sur "TEST MODE"
2. Observer l'apparition d'alarmes
3. Vérifier les compteurs WARNING/CAUTION
4. Acquitter avec "ACK ALL"
```

### 3. Analyse Système
```
1. Sélectionner "MOTEURS" (système par défaut)
2. Observer les gauges N1, EGT, N2
3. Naviguer vers "HYDRAULIQUE" (raccourci: 2)
4. Comparer les 3 circuits
5. Exporter le rapport avec "EXPORT CFR"
```

### 4. Navigation Clavier
```
1. Appuyer sur '3' → Système électrique
2. Appuyer sur 'F' → Freeze
3. Observer les valeurs figées
4. Appuyer sur 'F' → Resume
```

---

## 📱 Test Responsive

### Desktop
- Ouvrir normalement : Layout 3 colonnes

### Tablette
```bash
# Chrome DevTools : F12 → Toggle device toolbar (Ctrl+Shift+M)
# Sélectionner "iPad" ou "iPad Pro"
```

### Mobile
```bash
# Chrome DevTools : Sélectionner "iPhone 12" ou "Pixel 5"
# Observer : sidebar réduite, alarm log en bas
```

---

## 🔥 Tips & Astuces

### Mode Debug
```javascript
// Dans config.js, activer :
DEBUG_MODE: true
// Puis recharger la page → Console verbose
```

### Modifier les Seuils
```javascript
// Dans config.js
export const THRESHOLDS = {
    n1: { 
        caution: 95,   // ← Modifier ici
        warning: 101,
        max: 104
    }
}
```

### Changer la Fréquence de Mise à Jour
```javascript
// Dans config.js
export const CONFIG = {
    UPDATE_INTERVAL: 1000,        // 1 seconde (modifier)
    ALARM_CHECK_INTERVAL: 3000,   // 3 secondes (modifier)
}
```

### Désactiver les Animations
```css
/* Dans style.css ou via préférences système */
@media (prefers-reduced-motion: reduce) {
    /* Animations automatiquement désactivées */
}
```

---

## 📚 Aller Plus Loin

- 📖 [README complet](README.md) — Documentation détaillée
- 🤝 [Guide de contribution](CONTRIBUTING.md) — Contribuer au projet
- 📝 [Changelog](CHANGELOG.md) — Historique des versions
- 🐛 [Issues](https://github.com/votre-username/aviation-hmi/issues) — Signaler un bug

---

## ⚠️ Avant de Commencer

**Important** : Cette application est à des fins **éducatives uniquement**.

- ❌ Ne PAS utiliser dans un environnement opérationnel réel
- ❌ Ne PAS utiliser pour prendre des décisions de vol
- ✅ Parfait pour l'apprentissage et la démonstration
- ✅ Idéal pour les passionnés d'aviation

---

## 🆘 Besoin d'aide ?

- 💬 [Discussions GitHub](https://github.com/votre-username/aviation-hmi/discussions)
- 📧 Email : contact@aerodiag.dev
- 🐛 [Signaler un bug](https://github.com/votre-username/aviation-hmi/issues/new)

---

**Prêt à décoller ? Bon vol ! ✈️**
