# Guide de Responsivité - AERO-DIAG

## 📱 Vue d'ensemble

L'application AERO-DIAG est maintenant entièrement responsive et optimisée pour tous les types d'écrans, de l'ultra-large 4K aux très petits smartphones, avec un support complet pour les écrans tactiles, pliables et les modes d'accessibilité.

---

## 🖥️ Breakpoints Standards

### Ultra Large Screens (4K+) - 2560px et plus
- **Sidebar**: 320px
- **Alarm Log**: 380px
- **Topbar**: 72px
- **Font Base**: 16px
- **Optimisations**:
  - Grilles de paramètres avec colonnes de 280px minimum
  - Jauges circulaires à 140px
  - Valeurs de jauge à 2rem
  - Padding augmenté pour meilleure utilisation de l'espace
  - Boutons à 12px × 24px

### Large Desktop (2K) - 1920px à 2559px
- **Sidebar**: 300px
- **Alarm Log**: 340px
- **Topbar**: 64px
- **Font Base**: 15px
- **Optimisations**:
  - Grilles avec colonnes de 240px minimum
  - Jauges circulaires à 120px
  - Valeurs de jauge à 1.6rem

### Standard Desktop - 1440px à 1919px
- Configuration par défaut optimale
- Grilles avec colonnes de 220px minimum

### Large Tablets & Small Laptops - 1024px à 1440px
- **Sidebar**: 220px
- **Alarm Log**: 280px
- **Optimisations**:
  - Grilles avec colonnes de 200px minimum
  - Jauges circulaires réduites à 90px

### Tablets Portrait - 768px à 1024px
- **Sidebar**: 200px
- **Alarm Log**: 260px
- **Topbar/Bottombar**: 48px
- **Font Base**: 13px
- **Optimisations**:
  - Affichage uniquement du premier élément aircraft
  - Horloges et sessions masquées
  - Espacement réduit (gap: 12px)
  - Grilles à 180px minimum
  - Boutons avec min-height de 40px

### Tablets Landscape - 768px à 1024px (mode paysage)
- **Sidebar**: 180px
- **Bottombar**: 44px
- **Optimisations**:
  - Dual-grid en 2 colonnes
  - Alarm log à max 35vh avec scroll
  - Layout optimisé pour l'écran horizontal

### Mobile Landscape - 600px à 768px
- **Sidebar**: 60px (icônes uniquement)
- **Alarm Log**: 100% largeur
- **Font Base**: 12px
- **Optimisations**:
  - Sidebar réduite à icônes seulement
  - Alarm log devient un panneau footer
  - Grilles en colonne unique
  - Logo sans texte

### Mobile Landscape Orientation - max 768px (paysage)
- **Topbar/Bottombar**: 40px
- **Sidebar**: 50px
- **Optimisations**:
  - Icônes sidebar à 30px
  - Alarm log max 150px
  - Jauges à 70px
  - Padding minimal (8px)

### Mobile Portrait - 320px à 600px
- **Sidebar**: masquée complètement
- **Topbar**: 44px
- **Bottombar**: auto
- **Font Base**: 11px
- **Optimisations**:
  - Layout en colonne unique
  - Sidebar cachée
  - Overflow-y auto pour scroll
  - Alarm log à 250px max
  - Boutons en grille 2×2
  - Espacement minimal

### Mobile Portrait Orientation - max 600px (portrait)
- **Optimisations**:
  - Grilles en colonne unique
  - Gauge groups en colonne
  - Alarm log à 35vh max
  - Padding optimisé

### Very Small Mobile - moins de 360px
- **Font Base**: 10px
- **Optimisations**:
  - Master status à 0.7rem
  - Indicateurs à 8px
  - Padding minimal (8px)
  - Boutons compacts
  - Grilles en colonne unique

---

## 🎯 Optimisations Écrans Spéciaux

### Ultra-Wide Screens (21:9 et plus)
- Layout centré avec max-width de 3440px
- Dual-grid en 3 colonnes
- Param-grid optimisée pour l'espace large

### Écrans Verticaux/Rotatés (ratio < 4:5)
- Layout en colonne unique
- Sidebar horizontale avec scroll
- Border inférieure au lieu de droite
- Navigation en flex horizontal

### Écrans Pliables Horizontaux
- Support des `horizontal-viewport-segments`
- Diagnostic sur le premier segment
- Alarm log sur le deuxième segment

### Écrans Pliables Verticaux
- Support des `vertical-viewport-segments`
- Layout adapté aux segments verticaux

### Écrans avec Notch/Safe Area
- Support de `safe-area-inset-*`
- Padding topbar avec safe-area-inset-top
- Padding bottombar avec safe-area-inset-bottom
- Padding sidebar avec safe-area-inset-left

---

## 👆 Optimisations Tactiles

### Touch Devices (`hover: none` et `pointer: coarse`)
- **Zones tactiles minimales**: 44px (norme WCAG)
- Boutons avec `min-height: 44px` et `min-width: 44px`
- Cartes thème/police: 80px minimum
- Espacement augmenté entre éléments (12-16px)
- Scroll optimisé avec `-webkit-overflow-scrolling: touch`
- `touch-action: manipulation` pour désactiver double-tap zoom

### Hover Devices (`hover: hover` et `pointer: fine`)
- Effets de survol améliorés
- Transformations translateY sur boutons (-1px)
- Transformations sur cartes (-2px)
- Sidebar items avec translateX (4px)
- Box-shadow améliorées au survol

---

## ♿ Accessibilité

### High Contrast Mode
- Background en noir pur (#000000)
- Texte en blanc pur (#ffffff)
- Bordures renforcées (0.3 et 0.5 opacity)
- Couleurs de statut renforcées (pures)
- Bordures 2px sur tous les composants
- Boutons en gras (700) avec bordures 2px
- Indicateurs avec bordures 3px

### Forced Colors Mode (Windows High Contrast)
- `forced-color-adjust: auto`
- Bordures 2px avec CanvasText
- Support pour tous les éléments interactifs

### Reduced Motion
- Animations désactivées (0.01ms)
- Transitions minimales
- Animation du background désactivée

### Reduced Data (Connexions Lentes)
- Animations non essentielles désactivées
- Ombres et effets supprimés
- Bordures simples au lieu des ombres
- Performance optimisée

---

## 📐 Container Queries (Modern CSS)

### Configuration
- Panels (diagnostic, alarm-log, sidebar): `container-type: inline-size`
- Cards (gauge-card, param-card): `container-type: inline-size`

### Card Responsive
- **< 200px**: labels 0.65rem, valeurs 1rem, jauges 70px
- **≥ 300px**: padding 20×24px, valeurs 1.8rem

### Panel Responsive
- **< 400px**: grilles en colonne unique
- **≥ 800px**: grilles auto-fill avec min 220px

---

## 🎨 High Refresh Rate & High DPI

### Écrans ≥120dpi
- Font-smoothing antialiased
- Valeurs de jauges en font-weight 600
- Rendu optimisé pour la netteté

---

## 📱 Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
```

- **width=device-width**: Adaptation à la largeur de l'appareil
- **initial-scale=1.0**: Zoom initial à 100%
- **maximum-scale=5.0**: Zoom maximum à 500% (accessibilité)
- **user-scalable=yes**: Zoom utilisateur autorisé
- **viewport-fit=cover**: Support des notch et safe areas

---

## 🖨️ Print Styles

- Background blanc, texte noir
- Topbar, bottombar, sidebar masqués
- Layout en bloc simple
- Alarm log sur nouvelle page
- Ombres et animations supprimées

---

## 🧪 Tests Recommandés

### Résolutions à tester
- ✅ 3840×2160 (4K)
- ✅ 2560×1440 (2K)
- ✅ 1920×1080 (Full HD)
- ✅ 1366×768 (Laptop standard)
- ✅ 1024×768 (Tablette)
- ✅ 768×1024 (Tablette portrait)
- ✅ 430×932 (iPhone 14 Pro Max)
- ✅ 390×844 (iPhone 13/14)
- ✅ 360×800 (Android standard)
- ✅ 320×568 (iPhone SE)

### Orientations
- ✅ Portrait
- ✅ Paysage

### Modes
- ✅ Touch
- ✅ Mouse/trackpad
- ✅ High contrast
- ✅ Reduced motion
- ✅ Print preview

### Navigateurs
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS/macOS)

---

## 🚀 Performance

- Utilisation de CSS Grid et Flexbox natifs
- Transitions GPU-accelerated
- Container queries pour responsivité localisée
- Media queries optimisées par plages
- Variables CSS pour ajustements dynamiques
- Minimal JavaScript required

---

## 📝 Notes de Développement

### Variables CSS Responsives
Toutes les tailles utilisent des variables CSS modifiables dynamiquement :
- `--topbar-height`
- `--bottombar-height`
- `--sidebar-width`
- `--alarm-log-width`
- `--font-size-base`
- `--font-scale` (appliqué via theme-manager.js)

### Breakpoints Logiques
Les breakpoints suivent la logique mobile-first avec des max-width décroissants pour éviter les conflits.

### Support Navigateurs
- Container Queries : Chrome 105+, Safari 16+, Firefox 110+
- Pour les anciens navigateurs, fallback sur media queries classiques

---

## 🔄 Mises à Jour Futures

- [ ] Support des écrans 8K
- [ ] Optimisations pour tablettes pliables nouvelles générations
- [ ] Tests sur lunettes AR/VR
- [ ] Mode compact supplémentaire pour cockpit restreint

---

**Version**: 2.8.0  
**Dernière mise à jour**: 28 février 2026  
**Auteur**: Aviation HMI Team  
**Conformité**: EASA CS-25, WCAG 2.1 AA
