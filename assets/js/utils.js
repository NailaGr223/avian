/* ============================================
   BIRD MARKETPLACE - UTILITY FUNCTIONS
   ============================================ */

/**
 * Dark Mode Management
 */
const DarkMode = {
    STORAGE_KEY: 'bird-marketplace-theme',
    DARK_CLASS: 'data-theme',
    
    init: function() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'light';
        this.setTheme(savedTheme);
        this.attachToggleListener();
    },
    
    setTheme: function(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute(this.DARK_CLASS, 'dark');
        } else {
            document.documentElement.removeAttribute(this.DARK_CLASS);
        }
        localStorage.setItem(this.STORAGE_KEY, theme);
    },
    
    toggle: function() {
        const currentTheme = document.documentElement.getAttribute(this.DARK_CLASS);
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    },
    
    attachToggleListener: function() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }
    }
};

/**
 * Preloader Management
 */
const Preloader = {
    show: function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'flex';
        }
    },
    
    hide: function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
    },
    
    hideOnLoad: function() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.hide());
        } else {
            this.hide();
        }
    }
};

/**
 * Mobile Menu Toggle
 */
const MobileMenu = {
    init: function() {
        const hamburger = document.querySelector('.hamburger-menu');
        const mobileNav = document.querySelector('.mobile-nav');
        const closeBtn = document.querySelector('.mobile-nav-close');
        
        if (hamburger) {
            hamburger.addEventListener('click', () => this.toggle(mobileNav));
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close(mobileNav));
        }
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.mobile-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => this.close(mobileNav));
        });
    },
    
    toggle: function(menu) {
        if (menu) {
            menu.classList.toggle('active');
        }
    },
    
    close: function(menu) {
        if (menu) {
            menu.classList.remove('active');
        }
    }
};

/**
 * Carousel Navigation
 */
const Carousel = {
    init: function(carouselId) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;
        
        const container = carousel.querySelector('.carousel-container');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const indicators = carousel.querySelectorAll('.carousel-indicator');
        
        let currentIndex = 0;
        let autoPlayInterval;
        
        const updateCarousel = () => {
            const offset = -currentIndex * 100;
            container.style.transform = `translateX(${offset}%)`;
            
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        };
        
        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        };
        
        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        };
        
        const startAutoPlay = () => {
            autoPlayInterval = setInterval(nextSlide, 5000);
        };
        
        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };
        
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
                stopAutoPlay();
                startAutoPlay();
            });
        });
        
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        
        startAutoPlay();
        updateCarousel();
    },
    
    initAll: function() {
        const carousels = document.querySelectorAll('[data-carousel]');
        carousels.forEach(carousel => {
            this.init(carousel.id);
        });
    }
};

/**
 * Form Validation
 */
const FormValidator = {
    validate: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    validateField: function(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        if (required && !value) {
            this.showError(field, 'This field is required');
            return false;
        }
        
        if (type === 'email' && value && !this.isValidEmail(value)) {
            this.showError(field, 'Please enter a valid email');
            return false;
        }
        
        if (type === 'password' && value && value.length < 8) {
            this.showError(field, 'Password must be at least 8 characters');
            return false;
        }
        
        this.clearError(field);
        return true;
    },
    
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    showError: function(field, message) {
        field.classList.add('error');
        let errorElement = field.nextElementSibling;
        
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = message;
    },
    
    clearError: function(field) {
        field.classList.remove('error');
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
    }
};

/**
 * API Helper
 */
const API = {
    baseURL: '/api',
    
    request: async function(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        const config = {
            headers,
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    get: function(endpoint, options = {}) {
        return this.request(endpoint, { method: 'GET', ...options });
    },
    
    post: function(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    },
    
    put: function(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    },
    
    delete: function(endpoint, options = {}) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }
};

/**
 * Notification System
 */
const Notification = {
    show: function(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.warn('Notification container not found');
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    },
    
    success: function(message, duration = 3000) {
        this.show(message, 'success', duration);
    },
    
    error: function(message, duration = 3000) {
        this.show(message, 'error', duration);
    },
    
    warning: function(message, duration = 3000) {
        this.show(message, 'warning', duration);
    },
    
    info: function(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
};

/**
 * Lazy Loading Images
 */
const LazyLoad = {
    init: function() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
};

/**
 * Initialize all utilities on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    DarkMode.init();
    MobileMenu.init();
    Carousel.initAll();
    LazyLoad.init();
    Preloader.hideOnLoad();
});
