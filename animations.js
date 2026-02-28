/**
 * Animations Manager - Aviation HMI v2.7.0
 * Gestion des animations, transitions et feedback (visuel, haptique)
 */

class AnimationsManager {
    constructor() {
        this.enabled = true;
        this.hapticsEnabled = true;
        this.loadingAnimations = {};
        this.activeAnimations = new Set();
        
        this.loadPreferences();
        this.initStyles();
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        const saved = localStorage.getItem('aviation-hmi-animations');
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                this.enabled = prefs.enabled !== false;
                this.hapticsEnabled = prefs.hapticsEnabled !== false;
            } catch (e) {
                console.error('[ANIMATIONS] Failed to load preferences:', e);
            }
        }
    }

    /**
     * Save preferences
     */
    savePreferences() {
        const prefs = {
            enabled: this.enabled,
            hapticsEnabled: this.hapticsEnabled
        };
        localStorage.setItem('aviation-hmi-animations', JSON.stringify(prefs));
    }

    /**
     * Initialize animation styles
     */
    initStyles() {
        if (!document.getElementById('animations-styles')) {
            const style = document.createElement('style');
            style.id = 'animations-styles';
            style.textContent = `
                /* Fade animations */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                /* Slide animations */
                @keyframes slideInLeft {
                    from { 
                        transform: translateX(-100%); 
                        opacity: 0;
                    }
                    to { 
                        transform: translateX(0); 
                        opacity: 1;
                    }
                }

                @keyframes slideInRight {
                    from { 
                        transform: translateX(100%); 
                        opacity: 0;
                    }
                    to { 
                        transform: translateX(0); 
                        opacity: 1;
                    }
                }

                @keyframes slideInUp {
                    from { 
                        transform: translateY(100%); 
                        opacity: 0;
                    }
                    to { 
                        transform: translateY(0); 
                        opacity: 1;
                    }
                }

                @keyframes slideInDown {
                    from { 
                        transform: translateY(-100%); 
                        opacity: 0;
                    }
                    to { 
                        transform: translateY(0); 
                        opacity: 1;
                    }
                }

                /* Scale animations */
                @keyframes scaleIn {
                    from { 
                        transform: scale(0.8); 
                        opacity: 0;
                    }
                    to { 
                        transform: scale(1); 
                        opacity: 1;
                    }
                }

                @keyframes scaleOut {
                    from { 
                        transform: scale(1); 
                        opacity: 1;
                    }
                    to { 
                        transform: scale(0.8); 
                        opacity: 0;
                    }
                }

                /* Pulse animation */
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }

                /* Shake animation */
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }

                /* Bounce animation */
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                /* Spin animation */
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Loading spinner */
                @keyframes spinLoader {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Progress bar animation */
                @keyframes progressPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* Glow effect */
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px currentColor; }
                    50% { box-shadow: 0 0 20px currentColor; }
                }

                /* Smooth transitions */
                .animate-smooth {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .animate-fast {
                    transition: all 0.15s ease-out;
                }

                .animate-slow {
                    transition: all 0.5s ease-in-out;
                }

                /* Disable animations class */
                .no-animations,
                .no-animations * {
                    animation: none !important;
                    transition: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Enable or disable animations
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.savePreferences();

        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }

        window.dispatchEvent(new CustomEvent('animationsToggled', {
            detail: { enabled }
        }));
    }

    /**
     * Animate element with specified animation
     */
    animate(element, animationName, duration = 300, easing = 'ease-out') {
        if (!this.enabled || !element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.animation = `${animationName} ${duration}ms ${easing}`;
            this.activeAnimations.add(element);

            const onAnimationEnd = () => {
                element.style.animation = '';
                this.activeAnimations.delete(element);
                element.removeEventListener('animationend', onAnimationEnd);
                resolve();
            };

            element.addEventListener('animationend', onAnimationEnd);
        });
    }

    /**
     * Fade in element
     */
    fadeIn(element, duration = 300) {
        return this.animate(element, 'fadeIn', duration);
    }

    /**
     * Fade out element
     */
    fadeOut(element, duration = 300) {
        return this.animate(element, 'fadeOut', duration);
    }

    /**
     * Slide element
     */
    slide(element, direction, duration = 300) {
        const animations = {
            left: 'slideInLeft',
            right: 'slideInRight',
            up: 'slideInUp',
            down: 'slideInDown'
        };
        return this.animate(element, animations[direction] || 'fadeIn', duration);
    }

    /**
     * Scale in element
     */
    scaleIn(element, duration = 300) {
        return this.animate(element, 'scaleIn', duration);
    }

    /**
     * Scale out element
     */
    scaleOut(element, duration = 300) {
        return this.animate(element, 'scaleOut', duration);
    }

    /**
     * Pulse element
     */
    pulse(element, count = 1, duration = 500) {
        if (!this.enabled || !element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.animation = `pulse ${duration}ms ease-in-out ${count}`;
            
            const onAnimationEnd = () => {
                element.style.animation = '';
                element.removeEventListener('animationend', onAnimationEnd);
                resolve();
            };

            element.addEventListener('animationend', onAnimationEnd);
        });
    }

    /**
     * Shake element (error feedback)
     */
    shake(element, duration = 500) {
        return this.animate(element, 'shake', duration);
    }

    /**
     * Bounce element
     */
    bounce(element, count = 2, duration = 500) {
        if (!this.enabled || !element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.animation = `bounce ${duration}ms ease-in-out ${count}`;
            
            const onAnimationEnd = () => {
                element.style.animation = '';
                element.removeEventListener('animationend', onAnimationEnd);
                resolve();
            };

            element.addEventListener('animationend', onAnimationEnd);
        });
    }

    /**
     * Glow effect (highlight)
     */
    glow(element, duration = 1000) {
        return this.animate(element, 'glow', duration);
    }

    /**
     * Haptic feedback (vibration)
     */
    haptic(pattern = [10]) {
        if (!this.hapticsEnabled) return;

        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * Haptic patterns
     */
    hapticClick() {
        this.haptic([10]);
    }

    hapticSuccess() {
        this.haptic([50, 50, 50]);
    }

    hapticError() {
        this.haptic([100, 50, 100]);
    }

    hapticWarning() {
        this.haptic([30, 30, 30, 30, 30]);
    }

    /**
     * Show loading spinner
     */
    showLoading(containerId, message = 'Chargement...') {
        const container = typeof containerId === 'string' 
            ? document.getElementById(containerId) 
            : containerId;

        if (!container) return null;

        const loadingId = `loading_${Date.now()}`;
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.id = loadingId;
        loading.innerHTML = `
            <div class="loading-spinner">
                <div class="loading-spinner__icon">
                    <i class="fas fa-plane"></i>
                </div>
                <div class="loading-spinner__text">${message}</div>
            </div>
        `;

        container.style.position = 'relative';
        container.appendChild(loading);

        this.fadeIn(loading, 200);
        this.loadingAnimations[loadingId] = loading;

        return loadingId;
    }

    /**
     * Hide loading spinner
     */
    hideLoading(loadingId) {
        const loading = this.loadingAnimations[loadingId];
        if (!loading) return;

        this.fadeOut(loading, 200).then(() => {
            loading.remove();
            delete this.loadingAnimations[loadingId];
        });
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span class="toast__message">${message}</span>
        `;

        document.body.appendChild(toast);

        // Position toast
        const toasts = document.querySelectorAll('.toast');
        const offset = (toasts.length - 1) * 70;
        toast.style.bottom = `${20 + offset}px`;

        // Animate in
        this.slide(toast, 'up', 300);

        // Auto hide
        setTimeout(() => {
            this.fadeOut(toast, 300).then(() => {
                toast.remove();
            });
        }, duration);

        // Haptic feedback
        if (type === 'error') this.hapticError();
        else if (type === 'success') this.hapticSuccess();
        else if (type === 'warning') this.hapticWarning();
        else this.hapticClick();
    }

    /**
     * Smooth scroll to element
     */
    scrollTo(element, duration = 500) {
        if (!element) return;

        const start = window.pageYOffset;
        const target = element.getBoundingClientRect().top + start;
        const distance = target - start;
        const startTime = performance.now();

        const easeInOutCubic = (t) => {
            return t < 0.5 
                ? 4 * t * t * t 
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const scroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, start + distance * ease);

            if (progress < 1) {
                requestAnimationFrame(scroll);
            }
        };

        requestAnimationFrame(scroll);
    }

    /**
     * Transition between views
     */
    transitionView(fromElement, toElement, direction = 'right') {
        if (!fromElement || !toElement) return Promise.resolve();

        const exitAnimation = direction === 'right' ? 'slideInLeft' : 'slideInRight';
        const enterAnimation = direction === 'right' ? 'slideInRight' : 'slideInLeft';

        return this.fadeOut(fromElement, 200).then(() => {
            fromElement.classList.add('hidden');
            toElement.classList.remove('hidden');
            return this.animate(toElement, enterAnimation, 300);
        });
    }

    /**
     * Highlight element temporarily
     */
    highlight(element, duration = 1000) {
        if (!element) return;

        element.classList.add('highlight');
        this.glow(element, duration / 2);

        setTimeout(() => {
            element.classList.remove('highlight');
        }, duration);
    }

    /**
     * Ripple effect on click
     */
    ripple(element, event) {
        if (!this.enabled || !element) return;

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Add ripple effect to buttons
     */
    initRippleEffects() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn');
            if (button && this.enabled) {
                this.ripple(button, e);
            }
        });
    }

    /**
     * Page transition loader
     */
    pageTransition(callback) {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition';
        overlay.innerHTML = `
            <div class="page-transition__content">
                <i class="fas fa-plane fa-3x"></i>
            </div>
        `;

        document.body.appendChild(overlay);

        this.fadeIn(overlay, 300).then(() => {
            if (callback) callback();
            
            setTimeout(() => {
                this.fadeOut(overlay, 300).then(() => {
                    overlay.remove();
                });
            }, 500);
        });
    }

    /**
     * Stop all animations
     */
    stopAll() {
        this.activeAnimations.forEach(element => {
            element.style.animation = '';
        });
        this.activeAnimations.clear();
    }
}

// Export singleton instance
export const animations = new AnimationsManager();
window.animations = animations;

// Initialize ripple effects
animations.initRippleEffects();

export default animations;
