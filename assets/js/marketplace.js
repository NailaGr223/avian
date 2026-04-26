/* ============================================
   MARKETPLACE JAVASCRIPT
   ============================================ */

/**
 * Marketplace Filters Management
 */
const MarketplaceFilters = {
    currentFilters: {},
    
    init: function() {
        this.setupFilterListeners();
        this.setupSortListener();
        this.setupViewToggle();
        this.loadFiltersFromURL();
    },
    
    setupFilterListeners: function() {
        const filterOptions = document.querySelectorAll('.filter-option input');
        const rangeInputs = document.querySelectorAll('.filter-range input');
        
        filterOptions.forEach(option => {
            option.addEventListener('change', () => {
                this.applyFilters();
            });
        });
        
        rangeInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    },
    
    setupSortListener: function() {
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    },
    
    setupViewToggle: function() {
        const viewButtons = document.querySelectorAll('.view-toggle button');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.changeView(btn.dataset.view);
            });
        });
    },
    
    applyFilters: function() {
        this.collectFilters();
        this.updateURL();
        this.fetchFilteredBirds();
    },
    
    collectFilters: function() {
        this.currentFilters = {};
        
        const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            const filterName = checkbox.name;
            if (!this.currentFilters[filterName]) {
                this.currentFilters[filterName] = [];
            }
            this.currentFilters[filterName].push(checkbox.value);
        });
        
        const priceMin = document.querySelector('input[name="price_min"]');
        const priceMax = document.querySelector('input[name="price_max"]');
        if (priceMin && priceMin.value) {
            this.currentFilters.price_min = priceMin.value;
        }
        if (priceMax && priceMax.value) {
            this.currentFilters.price_max = priceMax.value;
        }
        
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect && sortSelect.value) {
            this.currentFilters.sort = sortSelect.value;
        }
    },
    
    updateURL: function() {
        const params = new URLSearchParams();
        
        Object.keys(this.currentFilters).forEach(key => {
            const value = this.currentFilters[key];
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else {
                params.set(key, value);
            }
        });
        
        window.history.replaceState({}, '', `?${params.toString()}`);
    },
    
    fetchFilteredBirds: function() {
        const params = new URLSearchParams();
        
        Object.keys(this.currentFilters).forEach(key => {
            const value = this.currentFilters[key];
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else {
                params.set(key, value);
            }
        });
        
        API.get(`/api/birds?${params.toString()}`)
            .then(response => {
                this.renderBirds(response.birds);
            })
            .catch(error => {
                Notification.error('Failed to load birds');
            });
    },
    
    renderBirds: function(birds) {
        const grid = document.querySelector('.bird-listings-grid');
        if (!grid) return;
        
        if (birds.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">🔍</div>
                    <h3 class="empty-state-title">No birds found</h3>
                    <p class="empty-state-text">Try adjusting your filters to find what you're looking for.</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = birds.map(bird => this.createBirdCard(bird)).join('');
        this.attachCardListeners();
    },
    
    createBirdCard: function(bird) {
        return `
            <div class="bird-listing-card" data-bird-id="${bird.id}">
                <div class="bird-listing-image">
                    <img src="${bird.image_url}" alt="${bird.breed}" loading="lazy" />
                    <div class="bird-listing-badges">
                        ${bird.is_verified ? '<span class="bird-listing-badge verified">✓ Verified</span>' : ''}
                        ${bird.is_featured ? '<span class="bird-listing-badge featured">Featured</span>' : ''}
                    </div>
                </div>
                
                <div class="bird-listing-body">
                    <h3 class="bird-listing-title">${bird.breed}</h3>
                    <p class="bird-listing-breed">${bird.species}</p>
                    
                    <div class="bird-listing-details">
                        <div class="bird-listing-detail">
                            <span class="bird-listing-detail-label">Age</span>
                            <span class="bird-listing-detail-value">${bird.age}</span>
                        </div>
                        <div class="bird-listing-detail">
                            <span class="bird-listing-detail-label">Gender</span>
                            <span class="bird-listing-detail-value">${bird.gender}</span>
                        </div>
                        <div class="bird-listing-detail">
                            <span class="bird-listing-detail-label">Health</span>
                            <span class="bird-listing-detail-value">${bird.health_status}</span>
                        </div>
                        <div class="bird-listing-detail">
                            <span class="bird-listing-detail-label">Stock</span>
                            <span class="bird-listing-detail-value">${bird.quantity_available}</span>
                        </div>
                    </div>
                    
                    <div class="bird-listing-location">
                        <span>📍</span>
                        <span>${bird.location}</span>
                    </div>
                    
                    ${bird.price ? `<div class="bird-listing-price">$${bird.price}</div>` : ''}
                    
                    <div class="bird-listing-seller">
                        <div class="bird-listing-seller-avatar">${bird.seller_name.charAt(0)}</div>
                        <div class="bird-listing-seller-info">
                            <div class="bird-listing-seller-name">${bird.seller_name}</div>
                            <div class="bird-listing-seller-rating">⭐ ${bird.seller_rating}</div>
                        </div>
                    </div>
                    
                    <div class="bird-listing-actions">
                        <button class="btn btn-primary btn-view" data-bird-id="${bird.id}">View</button>
                        <button class="btn btn-outline btn-cart" data-bird-id="${bird.id}">Cart</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    attachCardListeners: function() {
        const viewBtns = document.querySelectorAll('.bird-listing-actions .btn-view');
        const cartBtns = document.querySelectorAll('.bird-listing-actions .btn-cart');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const birdId = btn.dataset.birdId;
                window.location.href = `/bird/${birdId}`;
            });
        });
        
        cartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const birdId = btn.dataset.birdId;
                this.addToCart(birdId, btn);
            });
        });
    },
    
    addToCart: function(birdId, btn) {
        API.post('/cart/add', { bird_id: birdId })
            .then(response => {
                Notification.success('Added to cart!');
                btn.textContent = '✓ Added';
                btn.disabled = true;
                setTimeout(() => {
                    btn.textContent = 'Cart';
                    btn.disabled = false;
                }, 2000);
            })
            .catch(error => {
                Notification.error('Failed to add to cart');
            });
    },
    
    changeView: function(view) {
        const grid = document.querySelector('.bird-listings-grid');
        if (view === 'grid') {
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        } else if (view === 'list') {
            grid.style.gridTemplateColumns = '1fr';
        }
    },
    
    loadFiltersFromURL: function() {
        const params = new URLSearchParams(window.location.search);
        
        params.forEach((value, key) => {
            if (key.startsWith('price')) {
                const input = document.querySelector(`input[name="${key}"]`);
                if (input) input.value = value;
            } else {
                const checkbox = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (checkbox) checkbox.checked = true;
            }
        });
        
        this.applyFilters();
    }
};

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    MarketplaceFilters.init();
});
