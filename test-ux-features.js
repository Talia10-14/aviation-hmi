/**
 * Test des fonctionnalités UX v2.7.0
 * À exécuter dans la console du navigateur
 */

console.log('🧪 AVIATION HMI - Tests UX v2.7.0');
console.log('═══════════════════════════════════════════════════════');

// Test 1: Theme Manager
console.log('\n1️⃣ Testing Theme Manager...');
if (window.themeManager) {
    console.log('✅ Theme Manager loaded');
    console.log('   Current theme:', window.themeManager.getCurrentTheme());
    console.log('   Current font size:', window.themeManager.getCurrentFontSize());
    console.log('   Available themes:', window.themeManager.getAvailableThemes().map(t => t.name).join(', '));
    
    // Test theme switching
    window.themeManager.setTheme('light');
    setTimeout(() => {
        console.log('   ✅ Theme switched to light');
        window.themeManager.setTheme('dark');
        console.log('   ✅ Theme switched back to dark');
    }, 1000);
} else {
    console.log('❌ Theme Manager NOT loaded');
}

// Test 2: User Profiles
console.log('\n2️⃣ Testing User Profiles...');
if (window.userProfiles) {
    console.log('✅ User Profiles loaded');
    const currentProfile = window.userProfiles.getCurrentProfile();
    console.log('   Current profile:', currentProfile?.name);
    console.log('   Total profiles:', window.userProfiles.getAllProfiles().length);
    console.log('   Statistics:', currentProfile?.statistics);
    
    // Test profile switching
    const profiles = window.userProfiles.getAllProfiles();
    if (profiles.length > 0) {
        console.log('   ✅ Can switch between', profiles.length, 'profiles');
    }
} else {
    console.log('❌ User Profiles NOT loaded');
}

// Test 3: Animations Manager
console.log('\n3️⃣ Testing Animations Manager...');
if (window.animations) {
    console.log('✅ Animations Manager loaded');
    console.log('   Animations enabled:', window.animations.enabled);
    console.log('   Haptics enabled:', window.animations.hapticsEnabled);
    
    // Test animation
    const testElement = document.querySelector('.btn');
    if (testElement) {
        console.log('   Testing pulse animation...');
        window.animations.pulse(testElement, 1, 500).then(() => {
            console.log('   ✅ Pulse animation completed');
        });
    }
    
    // Test toast
    setTimeout(() => {
        window.animations.showToast('Test notification réussie ! ✅', 'success', 2000);
        console.log('   ✅ Toast notification displayed');
    }, 1500);
} else {
    console.log('❌ Animations Manager NOT loaded');
}

// Test 4: Audio Manager
console.log('\n4️⃣ Testing Audio Manager...');
if (window.audioManager) {
    console.log('✅ Audio Manager loaded');
    console.log('   Audio enabled:', window.audioManager.enabled);
    console.log('   Master volume:', (window.audioManager.masterVolume * 100).toFixed(0) + '%');
    console.log('   Ambient enabled:', window.audioManager.ambientEnabled);
    console.log('   Voice enabled:', window.audioManager.voiceEnabled);
    
    // Test sound
    setTimeout(() => {
        console.log('   Testing click sound...');
        window.audioManager.playClick();
        console.log('   ✅ Click sound played');
    }, 2000);
    
    setTimeout(() => {
        console.log('   Testing success sound...');
        window.audioManager.playSuccess();
        console.log('   ✅ Success sound played');
    }, 2500);
} else {
    console.log('❌ Audio Manager NOT loaded');
}

// Test 5: Touch Gestures
console.log('\n5️⃣ Testing Touch Gestures...');
if (window.touchGestures) {
    console.log('✅ Touch Gestures loaded');
    console.log('   Gestures enabled:', window.touchGestures.enabled);
    console.log('   Long press duration:', window.touchGestures.longPressDuration + 'ms');
    console.log('   Min swipe distance:', window.touchGestures.minSwipeDistance + 'px');
    console.log('   Registered gestures:', window.touchGestures.gestures.size);
} else {
    console.log('❌ Touch Gestures NOT loaded');
}

// Test 6: i18n Integration
console.log('\n6️⃣ Testing i18n Integration...');
if (window.i18n) {
    console.log('✅ i18n loaded');
    console.log('   Current language:', window.i18n.getCurrentLanguage());
    
    // Test new translations
    const testKeys = [
        'theme.title',
        'profile.manage_title',
        'audio.title'
    ];
    
    console.log('   Testing new translation keys:');
    testKeys.forEach(key => {
        const translation = window.i18n.t(key);
        if (translation && translation !== key) {
            console.log(`   ✅ ${key}: "${translation}"`);
        } else {
            console.log(`   ❌ ${key}: Translation missing`);
        }
    });
} else {
    console.log('❌ i18n NOT loaded');
}

// Test 7: UI Elements
console.log('\n7️⃣ Testing UI Elements...');
const uiElements = {
    'Profile Selector': '#profile-selector-container',
    'Language Selector': '#language-selector-container',
    'Theme Button': '#btn-theme-settings',
    'Audio Button': '#btn-audio-settings'
};

Object.entries(uiElements).forEach(([name, selector]) => {
    const element = document.querySelector(selector);
    if (element) {
        console.log(`   ✅ ${name} found`);
    } else {
        console.log(`   ❌ ${name} NOT found`);
    }
});

// Test 8: CSS Variables
console.log('\n8️⃣ Testing CSS Variables...');
const cssVars = [
    '--bg-primary',
    '--text-primary',
    '--color-warning',
    '--font-size-base'
];

const root = document.documentElement;
cssVars.forEach(varName => {
    const value = getComputedStyle(root).getPropertyValue(varName);
    if (value) {
        console.log(`   ✅ ${varName}: ${value.trim()}`);
    } else {
        console.log(`   ❌ ${varName}: NOT defined`);
    }
});

// Test 9: LocalStorage
console.log('\n9️⃣ Testing LocalStorage...');
const storageKeys = [
    'aviation-hmi-theme',
    'aviation-hmi-profiles',
    'aviation-hmi-animations',
    'aviation-hmi-audio',
    'aviation-hmi-gestures',
    'aviation-hmi-language'
];

storageKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
        console.log(`   ✅ ${key}: ${value.length} chars`);
    } else {
        console.log(`   ℹ️ ${key}: Not yet saved`);
    }
});

// Test 10: Event Listeners
console.log('\n🔟 Testing Event Listeners...');
const events = [
    'themeChanged',
    'fontSizeChanged',
    'profileSwitched',
    'languageChanged',
    'animationsToggled'
];

console.log('   Setting up test listeners...');
events.forEach(eventName => {
    window.addEventListener(eventName, (e) => {
        console.log(`   ✅ Event "${eventName}" fired:`, e.detail);
    }, { once: true });
});

// Summary
console.log('\n═══════════════════════════════════════════════════════');
console.log('📊 Test Summary:');
console.log('   - Theme Manager:', window.themeManager ? '✅' : '❌');
console.log('   - User Profiles:', window.userProfiles ? '✅' : '❌');
console.log('   - Animations:', window.animations ? '✅' : '❌');
console.log('   - Audio:', window.audioManager ? '✅' : '❌');
console.log('   - Touch Gestures:', window.touchGestures ? '✅' : '❌');
console.log('   - i18n:', window.i18n ? '✅' : '❌');

const allModulesLoaded = [
    window.themeManager,
    window.userProfiles,
    window.animations,
    window.audioManager,
    window.touchGestures,
    window.i18n
].every(Boolean);

if (allModulesLoaded) {
    console.log('\n🎉 All UX modules loaded successfully!');
    console.log('Try these commands:');
    console.log('   • window.themeManager.showSettings()');
    console.log('   • window.audioManager.showSettings()');
    console.log('   • window.userProfiles.showManageProfilesDialog()');
    console.log('   • window.animations.showToast("Hello!", "info")');
} else {
    console.log('\n⚠️ Some modules failed to load. Check console for errors.');
}

console.log('═══════════════════════════════════════════════════════\n');

// Export test results
window.uxTestResults = {
    themeManager: !!window.themeManager,
    userProfiles: !!window.userProfiles,
    animations: !!window.animations,
    audioManager: !!window.audioManager,
    touchGestures: !!window.touchGestures,
    i18n: !!window.i18n,
    timestamp: new Date().toISOString()
};

console.log('Test results saved to: window.uxTestResults');
