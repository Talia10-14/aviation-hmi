/**
 * Touch Gestures Manager - Aviation HMI v2.7.0
 * Support avancé des gestes tactiles pour tablette et mobile
 */

class TouchGesturesManager {
    constructor() {
        this.enabled = true;
        this.touchStart = null;
        this.touchEnd = null;
        this.pinchDistance = 0;
        this.longPressTimer = null;
        this.longPressDuration = 500; // ms
        
        this.minSwipeDistance = 50; // pixels
        this.maxSwipeTime = 300; // ms
        this.pinchThreshold = 10; // pixels

        this.gestures = new Map();
        this.activeGestures = new Set();

        this.loadPreferences();
        this.initGestures();
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        const saved = localStorage.getItem('aviation-hmi-gestures');
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                this.enabled = prefs.enabled !== false;
                this.longPressDuration = prefs.longPressDuration || 500;
                this.minSwipeDistance = prefs.minSwipeDistance || 50;
            } catch (e) {
                console.error('[GESTURES] Failed to load preferences:', e);
            }
        }
    }

    /**
     * Save preferences
     */
    savePreferences() {
        const prefs = {
            enabled: this.enabled,
            longPressDuration: this.longPressDuration,
            minSwipeDistance: this.minSwipeDistance
        };
        localStorage.setItem('aviation-hmi-gestures', JSON.stringify(prefs));
    }

    /**
     * Initialize gesture listeners
     */
    initGestures() {
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        document.addEventListener('touchcancel', (e) => this.handleTouchCancel(e));

        console.log('[GESTURES] Touch gestures initialized');
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        if (!this.enabled) return;

        const touch = e.touches[0];
        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
            target: e.target
        };

        // Handle multi-touch (pinch)
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            this.pinchDistance = this.getDistance(touch1, touch2);
            
            this.dispatchGesture('pinchstart', {
                distance: this.pinchDistance,
                center: this.getCenter(touch1, touch2)
            });
        }

        // Start long press timer
        this.longPressTimer = setTimeout(() => {
            if (this.touchStart) {
                this.dispatchGesture('longpress', {
                    x: this.touchStart.x,
                    y: this.touchStart.y,
                    target: this.touchStart.target
                });

                // Haptic feedback
                if (window.animations) {
                    window.animations.haptic([50]);
                }
            }
        }, this.longPressDuration);
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        if (!this.enabled || !this.touchStart) return;

        // Cancel long press if moved
        if (this.longPressTimer) {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - this.touchStart.x);
            const deltaY = Math.abs(touch.clientY - this.touchStart.y);
            
            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }

        // Handle pinch
        if (e.touches.length === 2) {
            e.preventDefault(); // Prevent default zoom

            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const newDistance = this.getDistance(touch1, touch2);
            const scale = newDistance / this.pinchDistance;

            if (Math.abs(newDistance - this.pinchDistance) > this.pinchThreshold) {
                this.dispatchGesture('pinch', {
                    scale: scale,
                    distance: newDistance,
                    center: this.getCenter(touch1, touch2),
                    direction: newDistance > this.pinchDistance ? 'out' : 'in'
                });
            }
        }

        // Handle drag
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.dispatchGesture('drag', {
                x: touch.clientX,
                y: touch.clientY,
                deltaX: touch.clientX - this.touchStart.x,
                deltaY: touch.clientY - this.touchStart.y
            });
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        if (!this.enabled || !this.touchStart) return;

        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;

        if (e.changedTouches.length === 1) {
            const touch = e.changedTouches[0];
            this.touchEnd = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };

            // Detect swipe
            const deltaX = this.touchEnd.x - this.touchStart.x;
            const deltaY = this.touchEnd.y - this.touchStart.y;
            const deltaTime = this.touchEnd.time - this.touchStart.time;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance >= this.minSwipeDistance && deltaTime <= this.maxSwipeTime) {
                const direction = this.getSwipeDirection(deltaX, deltaY);
                
                this.dispatchGesture('swipe', {
                    direction: direction,
                    distance: distance,
                    velocity: distance / deltaTime,
                    deltaX: deltaX,
                    deltaY: deltaY
                });

                // Haptic feedback
                if (window.animations) {
                    window.animations.hapticClick();
                }
            } else {
                // Regular tap
                this.dispatchGesture('tap', {
                    x: this.touchEnd.x,
                    y: this.touchEnd.y,
                    target: this.touchStart.target
                });
            }
        }

        // Handle pinch end
        if (e.touches.length === 0) {
            this.dispatchGesture('pinchend', {});
        }

        this.touchStart = null;
        this.touchEnd = null;
    }

    /**
     * Handle touch cancel
     */
    handleTouchCancel(e) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
        this.touchStart = null;
        this.touchEnd = null;
    }

    /**
     * Get distance between two touches
     */
    getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get center point between two touches
     */
    getCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }

    /**
     * Get swipe direction
     */
    getSwipeDirection(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    /**
     * Dispatch gesture event
     */
    dispatchGesture(type, detail) {
        const event = new CustomEvent(`gesture:${type}`, {
            detail: detail,
            bubbles: true
        });

        if (detail.target) {
            detail.target.dispatchEvent(event);
        } else {
            document.dispatchEvent(event);
        }

        console.log(`[GESTURES] ${type}:`, detail);
    }

    /**
     * Register gesture handler
     */
    on(gestureType, element, handler) {
        const eventName = `gesture:${gestureType}`;
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        
        if (!target) {
            console.error('[GESTURES] Element not found:', element);
            return;
        }

        target.addEventListener(eventName, handler);

        const key = `${gestureType}:${element}`;
        this.gestures.set(key, { element: target, handler, eventName });
    }

    /**
     * Unregister gesture handler
     */
    off(gestureType, element) {
        const key = `${gestureType}:${element}`;
        const gesture = this.gestures.get(key);
        
        if (gesture) {
            gesture.element.removeEventListener(gesture.eventName, gesture.handler);
            this.gestures.delete(key);
        }
    }

    /**
     * Enable/disable gestures
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.savePreferences();
    }

    /**
     * Set long press duration
     */
    setLongPressDuration(duration) {
        this.longPressDuration = Math.max(100, Math.min(2000, duration));
        this.savePreferences();
    }

    /**
     * Set minimum swipe distance
     */
    setMinSwipeDistance(distance) {
        this.minSwipeDistance = Math.max(20, Math.min(200, distance));
        this.savePreferences();
    }

    /**
     * Add swipe navigation to element
     */
    addSwipeNavigation(element, callbacks) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        this.on('swipe', target, (e) => {
            const direction = e.detail.direction;
            if (callbacks[direction]) {
                callbacks[direction](e.detail);
            }
        });
    }

    /**
     * Add pinch zoom to element
     */
    addPinchZoom(element, options = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        let currentScale = options.initialScale || 1;
        const minScale = options.minScale || 0.5;
        const maxScale = options.maxScale || 3;

        this.on('pinch', target, (e) => {
            const newScale = currentScale * e.detail.scale;
            const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
            
            target.style.transform = `scale(${clampedScale})`;
            currentScale = clampedScale;

            if (options.onZoom) {
                options.onZoom(clampedScale);
            }
        });

        this.on('pinchend', target, () => {
            currentScale = parseFloat(target.style.transform.replace(/[^0-9.]/g, '')) || 1;
        });
    }

    /**
     * Make element draggable
     */
    makeDraggable(element, options = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        let startX = 0, startY = 0;
        let currentX = 0, currentY = 0;

        target.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = target.getBoundingClientRect();
            startX = touch.clientX - rect.left;
            startY = touch.clientY - rect.top;
        });

        this.on('drag', target, (e) => {
            if (options.axis === 'x') {
                currentX = e.detail.x - startX;
                target.style.left = `${currentX}px`;
            } else if (options.axis === 'y') {
                currentY = e.detail.y - startY;
                target.style.top = `${currentY}px`;
            } else {
                currentX = e.detail.x - startX;
                currentY = e.detail.y - startY;
                target.style.left = `${currentX}px`;
                target.style.top = `${currentY}px`;
            }

            if (options.onDrag) {
                options.onDrag({ x: currentX, y: currentY });
            }
        });
    }

    /**
     * Add pull-to-refresh to element
     */
    addPullToRefresh(element, callback) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        let pulling = false;
        let startY = 0;

        target.addEventListener('touchstart', (e) => {
            if (target.scrollTop === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        });

        target.addEventListener('touchmove', (e) => {
            if (!pulling) return;

            const deltaY = e.touches[0].clientY - startY;
            if (deltaY > 80) {
                // Show refresh indicator
                if (callback) {
                    callback();
                    pulling = false;
                }
            }
        });

        target.addEventListener('touchend', () => {
            pulling = false;
        });
    }
}

// Export singleton instance
export const touchGestures = new TouchGesturesManager();
window.touchGestures = touchGestures;

// Example gesture handlers for common actions
if (touchGestures.enabled) {
    // Swipe left/right to navigate between views
    document.addEventListener('gesture:swipe', (e) => {
        const detail = e.detail;
        
        if (detail.direction === 'left') {
            console.log('[GESTURES] Swipe left detected - Next view');
        } else if (detail.direction === 'right') {
            console.log('[GESTURES] Swipe right detected - Previous view');
        } else if (detail.direction === 'down') {
            console.log('[GESTURES] Swipe down detected - Pull to refresh');
        }
    });

    // Long press for context menu
    document.addEventListener('gesture:longpress', (e) => {
        console.log('[GESTURES] Long press detected');
        // Show context menu
    });
}

export default touchGestures;
