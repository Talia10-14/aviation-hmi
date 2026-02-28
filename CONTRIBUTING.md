# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à **AERO-DIAG** ! Ce document décrit le processus de contribution et les bonnes pratiques à suivre.

## 📋 Table des matières

- [Code de Conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Standards de code](#standards-de-code)
- [Workflow Git](#workflow-git)
- [Tests](#tests)
- [Documentation](#documentation)
- [Revue de code](#revue-de-code)

## 🌟 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :

- ✅ Soyez respectueux et inclusif
- ✅ Acceptez les critiques constructives
- ✅ Focalisez sur ce qui est meilleur pour la communauté
- ✅ Faites preuve d'empathie envers les autres contributeurs
- ❌ Pas de langage offensant ou discriminatoire
- ❌ Pas de harcèlement sous quelque forme que ce soit

## 🚀 Comment contribuer

### 1. Trouver quelque chose sur quoi travailler

- Consultez les [Issues](https://github.com/votre-username/aviation-hmi/issues)
- Cherchez les labels `good first issue` ou `help wanted`
- Proposez une nouvelle fonctionnalité via une issue

### 2. Configuration de l'environnement

```bash
# Fork et clone
git clone https://github.com/VOTRE-USERNAME/aviation-hmi.git
cd aviation-hmi

# Installer les dépendances
npm install

# Lancer en mode dev
npm run dev

# Lancer les tests
npm test
```

### 3. Types de contributions

#### 🐛 Correction de bugs

1. Créez une issue décrivant le bug (si elle n'existe pas)
2. Créez une branche : `git checkout -b fix/description-du-bug`
3. Corrigez le bug
4. Ajoutez des tests
5. Soumettez une PR

#### ✨ Nouvelles fonctionnalités

1. Créez une issue de discussion d'abord
2. Attendez le feedback des mainteneurs
3. Créez une branche : `git checkout -b feature/nom-fonctionnalité`
4. Implémentez la fonctionnalité
5. Ajoutez tests et documentation
6. Soumettez une PR

#### 📝 Documentation

1. Créez une branche : `git checkout -b docs/amélioration`
2. Améliorez la documentation
3. Soumettez une PR

#### 🎨 Améliorations UI/UX

1. Créez une issue avec mockups/screenshots
2. Créez une branche : `git checkout -b ui/amélioration`
3. Implémentez les changements
4. Soumettez une PR avec screenshots avant/après

## 💻 Standards de code

### Style JavaScript

Nous utilisons ESLint et Prettier pour maintenir un code cohérent.

```javascript
// ✅ Bon
function calculateN1Percentage(value, max) {
    if (typeof value !== 'number') {
        throw new TypeError('Value must be a number');
    }
    return (value / max) * 100;
}

// ❌ Mauvais
function calc(v,m){return v/m*100;}
```

### Conventions de nommage

```javascript
// Variables et fonctions : camelCase
const engineSpeed = 85.2;
function updateEngineDisplay() { }

// Constantes : UPPER_SNAKE_CASE
const MAX_LOG_ENTRIES = 50;
const UPDATE_INTERVAL = 1000;

// Classes : PascalCase (si ajoutées)
class SensorValidator { }

// Fichiers : kebab-case
// app.js, vite.config.js
```

### JSDoc

Documentez toutes les fonctions publiques :

```javascript
/**
 * Validate and clamp a numeric value within bounds
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 * @throws {TypeError} If value is not a number
 */
function validateValue(value, min, max) {
    // ...
}
```

### CSS

```css
/* ✅ Bon : BEM naming */
.gauge-card { }
.gauge-card__header { }
.gauge-card__header--active { }

/* Utiliser les variables CSS */
.element {
    color: var(--text-primary);
    background: var(--bg-card);
}

/* ❌ Mauvais */
.gc { }
#my-element { }
```

## 🔄 Workflow Git

### Branches

```
main                    # Production
├── develop            # Développement (si nécessaire)
├── feature/xxx        # Nouvelles fonctionnalités
├── fix/xxx           # Corrections de bugs
├── docs/xxx          # Documentation
├── refactor/xxx      # Refactoring
└── test/xxx          # Ajout de tests
```

### Messages de commit

Format : `<type>(<scope>): <description>`

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatting, point-virgules manquants, etc.
- `refactor`: Refactoring du code
- `perf`: Amélioration de performance
- `test`: Ajout de tests
- `chore`: Maintenance (dependencies, config, etc.)

```bash
# ✅ Bons exemples
git commit -m "feat(engines): add APU temperature monitoring"
git commit -m "fix(alarms): correct alarm count display"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(sensors): add validation tests"

# ❌ Mauvais exemples
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "wip"
```

### Pull Request

1. **Titre clair** : `[Feature] Add night mode toggle`
2. **Description** :
   ```markdown
   ## Description
   Ajoute un toggle pour basculer entre mode jour/nuit
   
   ## Type de changement
   - [ ] Bug fix
   - [x] New feature
   - [ ] Breaking change
   
   ## Checklist
   - [x] Tests ajoutés/mis à jour
   - [x] Documentation mise à jour
   - [x] Code linté et formaté
   - [x] Tests passent localement
   
   ## Screenshots (si applicable)
   ![Night mode](url-to-image)
   ```

## 🧪 Tests

### Écrire des tests

```javascript
import { describe, it, expect } from 'vitest';

describe('validateValue', () => {
    it('should clamp value to max when exceeding', () => {
        expect(validateValue(150, 0, 100)).toBe(100);
    });
    
    it('should return midpoint for invalid values', () => {
        expect(validateValue(NaN, 0, 100)).toBe(50);
    });
});
```

### Lancer les tests

```bash
# Tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

### Couverture minimale

- Nouvelles fonctions : **100%**
- Fichiers modifiés : maintenir ou améliorer la couverture existante

## 📚 Documentation

### README.md

Mettez à jour si vous ajoutez :
- Nouvelles fonctionnalités
- Nouveaux scripts npm
- Nouvelles dépendances
- Changements d'architecture

### Code comments

```javascript
// ✅ Bon : Explique le POURQUOI
// Use midpoint as safe default to avoid system crash
return (min + max) / 2;

// ❌ Mauvais : Explique le QUOI (évident)
// Return the midpoint
return (min + max) / 2;
```

### CHANGELOG.md

Ajoutez vos changements sous `[Unreleased]` :

```markdown
## [Unreleased]

### Added
- Night mode toggle in settings panel

### Fixed
- Alarm count badge not updating correctly
```

## 👀 Revue de code

### En tant qu'auteur

- ✅ Auto-review votre PR avant de soumettre
- ✅ Répondez aux commentaires de manière constructive
- ✅ Faites les changements demandés rapidement
- ✅ Marquez les conversations comme résolues

### En tant que reviewer

- ✅ Soyez constructif et respectueux
- ✅ Expliquez vos suggestions
- ✅ Approuvez si tout est bon
- ✅ Demandez des changements si nécessaire

### Checklist review

- [ ] Le code compile et fonctionne
- [ ] Les tests passent
- [ ] Le code suit les standards du projet
- [ ] La documentation est à jour
- [ ] Pas de console.log oubliés
- [ ] Pas de commentaires TODO non résolus
- [ ] Performance acceptable
- [ ] Sécurité vérifiée

## 🎯 Priorités actuelles

### High Priority 🔴
- [ ] Implémentation des sons d'alerte
- [ ] Support multi-langues
- [ ] PWA support

### Medium Priority 🟡
- [ ] Mode clair/sombre
- [ ] Export PDF
- [ ] Historique des vols

### Low Priority 🟢
- [ ] Thèmes personnalisables
- [ ] Plugins système
- [ ] API REST

## 📞 Questions ?

- 💬 Ouvrez une [Discussion](https://github.com/votre-username/aviation-hmi/discussions)
- 🐛 Signalez un bug via [Issues](https://github.com/votre-username/aviation-hmi/issues)
- 📧 Email : contact@aerodiag.dev
- 💡 Suggestions : welcome!

## 🙏 Reconnaissance

Tous les contributeurs seront mentionnés dans le README et le CHANGELOG.

Merci de contribuer à **AERO-DIAG** ! ✈️

---

**Happy coding! 🚀**
