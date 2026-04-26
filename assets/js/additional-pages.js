/* ============================================
   ADDITIONAL PAGES JAVASCRIPT
   ============================================ */

/* Vet Locator */
class VetLocator {
    constructor() {
        this.map = null;
        this.markers = [];
        this.initMap();
    }

    initMap() {
        const defaultLocation = { lat: 40.7128, lng: -74.0060 };
        this.map = new google.maps.Map(document.querySelector('.vet-map'), {
            zoom: 12,
            center: defaultLocation,
            styles: this.getMapStyles()
        });

        this.loadVets();
    }

    loadVets() {
        const vets = document.querySelectorAll('[data-vet-id]');
        vets.forEach(vet => {
            const lat = parseFloat(vet.dataset.vetLat);
            const lng = parseFloat(vet.dataset.vetLng);
            const name = vet.dataset.vetName;

            const marker = new google.maps.Marker({
                position: { lat, lng },
                map: this.map,
                title: name
            });

            marker.addListener('click', () => {
                this.showVetInfo(vet);
            });

            this.markers.push(marker);
        });
    }

    showVetInfo(vetElement) {
        const vetId = vetElement.dataset.vetId;
        window.location.href = `/profile/${vetId}`;
    }

    getMapStyles() {
        return [
            {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#c9e6eb' }]
            }
        ];
    }
}

/* Blog */
class BlogManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
    }

    searchBlog() {
        const query = document.getElementById('blog-search').value;
        if (query.trim()) {
            window.location.href = `/blog?search=${encodeURIComponent(query)}`;
        }
    }

    filterByCategory(category) {
        window.location.href = `/blog?category=${category}`;
    }

    subscribeNewsletter(email) {
        return API.post('/newsletter/subscribe', { email });
    }
}

/* Cart Management */
class CartManager {
    constructor() {
        this.items = [];
        this.loadCart();
    }

    loadCart() {
        const cartData = localStorage.getItem('cart');
        this.items = cartData ? JSON.parse(cartData) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    addItem(birdId, quantity = 1) {
        const existingItem = this.items.find(item => item.birdId === birdId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ birdId, quantity });
        }
        
        this.saveCart();
        return true;
    }

    removeItem(birdId) {
        this.items = this.items.filter(item => item.birdId !== birdId);
        this.saveCart();
        return true;
    }

    updateQuantity(birdId, quantity) {
        const item = this.items.find(item => item.birdId === birdId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
        return true;
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        return true;
    }

    getTotal() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getItems() {
        return this.items;
    }
}

/* Wishlist Management */
class WishlistManager {
    constructor() {
        this.items = [];
        this.loadWishlist();
    }

    loadWishlist() {
        const wishlistData = localStorage.getItem('wishlist');
        this.items = wishlistData ? JSON.parse(wishlistData) : [];
    }

    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }

    addItem(birdId) {
        if (!this.items.includes(birdId)) {
            this.items.push(birdId);
            this.saveWishlist();
            return true;
        }
        return false;
    }

    removeItem(birdId) {
        this.items = this.items.filter(id => id !== birdId);
        this.saveWishlist();
        return true;
    }

    toggleItem(birdId) {
        if (this.items.includes(birdId)) {
            return this.removeItem(birdId);
        } else {
            return this.addItem(birdId);
        }
    }

    hasItem(birdId) {
        return this.items.includes(birdId);
    }

    getItems() {
        return this.items;
    }

    clear() {
        this.items = [];
        this.saveWishlist();
    }
}

/* Notification Manager */
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
    }

    loadNotifications() {
        return API.get('/notifications')
            .then(response => {
                this.notifications = response.notifications;
                this.unreadCount = response.unreadCount;
                return this.notifications;
            });
    }

    markAsRead(notificationId) {
        return API.post(`/notifications/${notificationId}/read`)
            .then(response => {
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.isRead = true;
                    this.unreadCount--;
                }
                return true;
            });
    }

    markAllAsRead() {
        return API.post('/notifications/mark-all-read')
            .then(response => {
                this.notifications.forEach(n => n.isRead = true);
                this.unreadCount = 0;
                return true;
            });
    }

    deleteNotification(notificationId) {
        return API.post(`/notifications/${notificationId}/delete`)
            .then(response => {
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
                return true;
            });
    }

    getUnreadCount() {
        return this.unreadCount;
    }
}

/* Search Manager */
class SearchManager {
    constructor() {
        this.query = '';
        this.filters = {};
        this.results = [];
    }

    search(query, filters = {}) {
        this.query = query;
        this.filters = filters;

        const params = new URLSearchParams();
        params.append('q', query);
        
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        return API.get(`/search?${params.toString()}`)
            .then(response => {
                this.results = response.results;
                return this.results;
            });
    }

    getResults() {
        return this.results;
    }

    applyFilter(filterName, filterValue) {
        this.filters[filterName] = filterValue;
        return this.search(this.query, this.filters);
    }
}

/* Payment Status Manager */
class PaymentStatusManager {
    constructor() {
        this.orderId = null;
        this.status = null;
    }

    checkPaymentStatus(orderId) {
        this.orderId = orderId;
        
        return API.get(`/payment-status/${orderId}`)
            .then(response => {
                this.status = response.status;
                
                if (this.status === 'pending') {
                    setTimeout(() => this.checkPaymentStatus(orderId), 3000);
                }
                
                return this.status;
            });
    }

    getStatus() {
        return this.status;
    }
}

/* Settings Manager */
class SettingsManager {
    constructor() {
        this.settings = {};
    }

    loadSettings() {
        return API.get('/settings')
            .then(response => {
                this.settings = response;
                return this.settings;
            });
    }

    updateProfile(profileData) {
        return API.post('/settings/profile', profileData);
    }

    updatePassword(currentPassword, newPassword) {
        return API.post('/settings/password', {
            currentPassword,
            newPassword
        });
    }

    updateNotificationPreferences(preferences) {
        return API.post('/settings/notifications', preferences);
    }

    updatePrivacySettings(privacySettings) {
        return API.post('/settings/privacy', privacySettings);
    }

    deleteAccount() {
        return API.post('/settings/delete-account');
    }
}

/* Order Tracking Manager */
class OrderTrackingManager {
    constructor() {
        this.orderId = null;
        this.orderData = null;
    }

    loadOrderTracking(orderId) {
        this.orderId = orderId;
        
        return API.get(`/order-tracking/${orderId}`)
            .then(response => {
                this.orderData = response;
                this.renderTimeline();
                return this.orderData;
            });
    }

    renderTimeline() {
        const timeline = document.querySelector('.order-timeline');
        if (!timeline) return;

        const statuses = ['pending', 'confirmed', 'shipped', 'in-transit', 'delivered'];
        const currentStatusIndex = statuses.indexOf(this.orderData.status);

        timeline.innerHTML = statuses.map((status, index) => `
            <div class="timeline-item ${index <= currentStatusIndex ? 'completed' : ''}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h4>${status.charAt(0).toUpperCase() + status.slice(1)}</h4>
                    ${this.orderData.statusUpdates[status] ? `<p>${this.orderData.statusUpdates[status]}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    getOrderData() {
        return this.orderData;
    }
}

/* Initialize Global Instances */
const cart = new CartManager();
const wishlist = new WishlistManager();
const notifications = new NotificationManager();
const search = new SearchManager();
const settings = new SettingsManager();

/* Utility Functions */
function initializeVetLocator() {
    if (document.querySelector('.vet-map')) {
        new VetLocator();
    }
}

function initializeBlog() {
    if (document.querySelector('.blog-container')) {
        new BlogManager();
    }
}

function updateCartBadge() {
    const badge = document.querySelector('[data-cart-count]');
    if (badge) {
        badge.textContent = cart.getTotal();
    }
}

function updateWishlistBadge() {
    const badge = document.querySelector('[data-wishlist-count]');
    if (badge) {
        badge.textContent = wishlist.getItems().length;
    }
}

/* Event Listeners */
document.addEventListener('DOMContentLoaded', () => {
    initializeVetLocator();
    initializeBlog();
    updateCartBadge();
    updateWishlistBadge();
});

/* Export for use in other scripts */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CartManager,
        WishlistManager,
        NotificationManager,
        SearchManager,
        SettingsManager,
        OrderTrackingManager,
        VetLocator,
        BlogManager
    };
}
