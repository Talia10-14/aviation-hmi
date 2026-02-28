/**
 * modal-utils.js
 * Utility functions for displaying professional modals instead of alert()
 */

/**
 * Show a professional modal dialog
 * @param {object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message (can include HTML)
 * @param {string} options.type - Modal type: 'info', 'success', 'error', 'warning' (default: 'info')
 * @param {string} options.icon - Optional custom icon class (e.g., 'fa-check-circle')
 * @param {string} options.confirmText - Text for confirm button (default: 'OK')
 * @param {function} options.onConfirm - Callback when confirmed
 * @param {boolean} options.closeOnBackdrop - Allow closing by clicking backdrop (default: true)
 */
export function showModal(options = {}) {
    const {
        title = '',
        message = '',
        type = 'info',
        icon = null,
        confirmText = 'OK',
        onConfirm = null,
        closeOnBackdrop = true
    } = options;

    // Remove any existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    // Determine icon based on type
    let modalIcon = icon;
    if (!modalIcon) {
        switch (type) {
            case 'success':
                modalIcon = 'fa-check-circle';
                break;
            case 'error':
                modalIcon = 'fa-exclamation-triangle';
                break;
            case 'warning':
                modalIcon = 'fa-exclamation-circle';
                break;
            case 'info':
            default:
                modalIcon = 'fa-info-circle';
                break;
        }
    }

    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay modal-overlay--active" data-modal-type="${type}">
            <div class="modal-dialog modal-dialog--${type}">
                <div class="modal-header modal-header--${type}">
                    <div class="modal-header__icon">
                        <i class="fas ${modalIcon}"></i>
                    </div>
                    <h2 class="modal-header__title">${title}</h2>
                </div>
                <div class="modal-body">
                    <div class="modal-message">${message}</div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn--confirm modal-btn--${type}" data-action="confirm">
                        ${confirmText}
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalOverlay = document.querySelector('.modal-overlay[data-modal-type="' + type + '"]');
    const dialog = modalOverlay.querySelector('.modal-dialog');
    const confirmBtn = modalOverlay.querySelector('[data-action="confirm"]');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Animation
    requestAnimationFrame(() => {
        dialog.classList.add('modal-dialog--visible');
    });

    // Close function
    const closeModal = () => {
        dialog.classList.remove('modal-dialog--visible');
        modalOverlay.classList.remove('modal-overlay--active');
        document.body.style.overflow = '';
        setTimeout(() => {
            modalOverlay.remove();
        }, 300);
    };

    // Confirm handler
    confirmBtn.addEventListener('click', () => {
        if (onConfirm) {
            onConfirm();
        }
        closeModal();
    });

    // Backdrop click
    if (closeOnBackdrop) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Return close function for programmatic closing
    return closeModal;
}

/**
 * Show an info modal
 */
export function showInfo(title, message, confirmText = 'OK') {
    return showModal({
        title,
        message,
        type: 'info',
        confirmText
    });
}

/**
 * Show a success modal
 */
export function showSuccess(title, message, confirmText = 'OK') {
    return showModal({
        title,
        message,
        type: 'success',
        confirmText
    });
}

/**
 * Show an error modal
 */
export function showError(title, message, confirmText = 'OK') {
    return showModal({
        title,
        message,
        type: 'error',
        confirmText
    });
}

/**
 * Show a warning modal
 */
export function showWarning(title, message, confirmText = 'OK') {
    return showModal({
        title,
        message,
        type: 'warning',
        confirmText
    });
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.showModal = showModal;
    window.showInfo = showInfo;
    window.showSuccess = showSuccess;
    window.showError = showError;
    window.showWarning = showWarning;
}
