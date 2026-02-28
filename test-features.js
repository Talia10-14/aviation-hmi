/**
 * Test script for v2.6.0 features
 * Run in browser console to test all new features
 */

console.log('🧪 Testing v2.6.0 Features...\n');

// Test 1: i18n module
console.log('1️⃣ Testing i18n module...');
if (window.i18n) {
    console.log('✅ i18n loaded');
    console.log('   Current language:', window.i18n.currentLanguage);
    console.log('   Available languages:', Object.keys(window.i18n.translations));
    console.log('   Test translation:', window.i18n.t('topbar.status.normal'));
    
    // Test language selector
    const langContainer = document.getElementById('language-selector-container');
    if (langContainer && langContainer.hasChildNodes()) {
        console.log('✅ Language selector rendered');
    } else {
        console.warn('⚠️ Language selector not rendered yet (may need time to load)');
    }
} else {
    console.error('❌ i18n not loaded');
}

// Test 2: documentation module
console.log('\n2️⃣ Testing documentation module...');
if (window.documentation) {
    console.log('✅ documentation loaded');
    console.log('   Sections:', Object.keys(window.documentation.sections));
    console.log('   Search index built:', window.documentation.searchIndex.length > 0);
} else {
    console.error('❌ documentation not loaded');
}

// Test 3: exportManager module
console.log('\n3️⃣ Testing exportManager module...');
if (window.exportManager) {
    console.log('✅ exportManager loaded');
    const templates = window.exportManager.getTemplates();
    console.log('   Templates:', templates.map(t => t.id).join(', '));
} else {
    console.error('❌ exportManager not loaded');
}

// Test 4: analytics module
console.log('\n4️⃣ Testing analytics module...');
if (window.analytics) {
    console.log('✅ analytics loaded');
    console.log('   History points:', window.analytics.history.length);
    console.log('   KPIs calculated:', Object.keys(window.analytics.kpis).length > 0);
    if (window.analytics.kpis.systemHealth !== undefined) {
        console.log('   System Health:', window.analytics.kpis.systemHealth?.toFixed(1) + '%');
    }
} else {
    console.error('❌ analytics not loaded');
}

// Test 5: appFeatures for procedures
console.log('\n5️⃣ Testing appFeatures (procedures)...');
if (window.appFeatures) {
    console.log('✅ appFeatures loaded');
    console.log('   showProcedureModal available:', typeof window.appFeatures.showProcedureModal === 'function');
} else {
    console.error('❌ appFeatures not loaded - procedures won\'t work');
}

// Test 6: UI Integration
console.log('\n6️⃣ Testing UI integration...');
const buttons = [
    { id: 'btn-analytics', name: 'Analytics button' },
    { id: 'btn-documentation', name: 'Documentation button' },
    { id: 'language-selector-container', name: 'Language selector container' }
];

buttons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (el) {
        console.log('✅', btn.name, 'found');
    } else {
        console.error('❌', btn.name, 'not found');
    }
});

// Test 7: CSS classes
console.log('\n7️⃣ Testing CSS...');
const testStyles = [
    '.language-selector',
    '.doc-modal',
    '.export-modal',
    '.analytics-modal'
];
console.log('   Required CSS classes should be defined in style.css');

// Test 8: Button functionality
console.log('\n8️⃣ Manual tests needed:');
console.log('   👆 Click on HELP button → Documentation modal should open');
console.log('   👆 Click on ANALYTICS button → Analytics dashboard should open');
console.log('   👆 Click on EXPORT CFR button → New export dialog should open');
console.log('   👆 Click on language selector → Dropdown with 5 languages should appear');
console.log('   👆 Click on PROC button in alarm → Procedure modal should open');

console.log('\n✨ Test complete! Check for any ❌ errors above.');

// Summary
const loaded = [window.i18n, window.documentation, window.exportManager, window.analytics, window.appFeatures].filter(Boolean).length;
console.log(`\n📊 Summary: ${loaded}/5 modules loaded successfully`);

if (loaded === 5) {
    console.log('🎉 All modules loaded! You can now test the features manually.');
} else {
    console.warn('⚠️ Some modules are missing. Please refresh the page and try again.');
}

