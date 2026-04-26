/* ============================================
   API WRAPPER & UTILITIES
   ============================================ */

class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        this.token = this.getAuthToken();
    }

    getAuthToken() {
        return localStorage.getItem('authToken') || null;
    }

    setAuthToken(token) {
        if (token) {
            localStorage.setItem('authToken', token);
            this.token = token;
            this.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    clearAuthToken() {
        localStorage.removeItem('authToken');
        this.token = null;
        delete this.headers['Authorization'];
    }

    async request(method, endpoint, data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: this.headers
        };

        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data && method !== 'GET') {
            if (data instanceof FormData) {
                delete options.headers['Content-Type'];
                options.body = data;
            } else {
                options.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, options);

            if (response.status === 401) {
                this.clearAuthToken();
                window.location.href = '/login';
                return null;
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    get(endpoint) {
        return this.request('GET', endpoint);
    }

    post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    }

    patch(endpoint, data) {
        return this.request('PATCH', endpoint, data);
    }

    delete(endpoint) {
        return this.request('DELETE', endpoint);
    }
}

/* Notification System */
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background-color: ${this.getBackgroundColor(type)};
            color: ${this.getTextColor(type)};
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
        `;

        notification.innerHTML = `
            <span>${this.getIcon(type)}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                font-size: 20px;
                padding: 0;
                margin-left: auto;
            ">×</button>
        `;

        this.container.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        return notification;
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    getBackgroundColor(type) {
        const colors = {
            success: '#d4edda',
            error: '#f8d7da',
            warning: '#fff3cd',
            info: '#d1ecf1'
        };
        return colors[type] || colors.info;
    }

    getTextColor(type) {
        const colors = {
            success: '#155724',
            error: '#721c24',
            warning: '#856404',
            info: '#0c5460'
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '!',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
}

/* Modal System */
class Modal {
    constructor(title, content, options = {}) {
        this.title = title;
        this.content = content;
        this.options = {
            size: 'medium',
            closeButton: true,
            backdrop: true,
            ...options
        };
        this.element = null;
    }

    create() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const dialog = document.createElement('div');
        dialog.className = 'modal-dialog';
        dialog.style.cssText = `
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: ${this.getSizeWidth()};
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        `;

        let html = `
            <div style="padding: 20px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 20px; color: #333;">${this.title}</h2>
        `;

        if (this.options.closeButton) {
            html += `
                <button onclick="this.closest('.modal-overlay').remove()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                ">×</button>
            `;
        }

        html += `
            </div>
            <div style="padding: 20px;">
                ${this.content}
            </div>
        `;

        dialog.innerHTML = html;
        modal.appendChild(dialog);

        if (this.options.backdrop) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        this.element = modal;
        return modal;
    }

    show() {
        const modal = this.create();
        document.body.appendChild(modal);
        return modal;
    }

    close() {
        if (this.element) {
            this.element.remove();
        }
    }

    getSizeWidth() {
        const sizes = {
            small: '400px',
            medium: '600px',
            large: '800px'
        };
        return sizes[this.options.size] || sizes.medium;
    }
}

/* Confirm Dialog */
function showConfirm(message, onConfirm, onCancel) {
    const modal = new Modal('Confirm', `
        <p style="margin-bottom: 20px; color: #666;">${message}</p>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="
                this.closest('.modal-overlay').remove();
                ${onConfirm.toString().match(/\{([\s\S]*)\}/)[1]}
            ">Confirm</button>
        </div>
    `, { closeButton: false });
    
    return modal.show();
}

/* Global Instances */
const API = new APIClient('/api');
const Notification = new NotificationSystem();

/* Add CSS Animations */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .modal-overlay {
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

/* Export for use in other scripts */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APIClient,
        NotificationSystem,
        Modal,
        showConfirm
    };
}
