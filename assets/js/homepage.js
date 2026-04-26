/* ============================================
   HOMEPAGE JAVASCRIPT
   ============================================ */

/**
 * Hero Carousel Management
 */
const HeroCarousel = {
    currentIndex: 0,
    autoPlayInterval: null,
    slides: [],
    indicators: [],
    
    init: function() {
        const carousel = document.getElementById('hero-carousel');
        if (!carousel) return;
        
        this.slides = carousel.querySelectorAll('.carousel-slide');
        this.indicators = carousel.querySelectorAll('.carousel-indicator');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        
        if (this.slides.length === 0) return;
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        
        this.startAutoPlay();
        this.updateCarousel();
    },
    
    updateCarousel: function() {
        const container = document.querySelector('.carousel-container');
        if (container) {
            const offset = -this.currentIndex * 100;
            container.style.transform = `translateX(${offset}%)`;
        }
        
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    },
    
    nextSlide: function() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateCarousel();
    },
    
    prevSlide: function() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateCarousel();
    },
    
    goToSlide: function(index) {
        this.currentIndex = index;
        this.updateCarousel();
        this.stopAutoPlay();
        this.startAutoPlay();
    },
    
    startAutoPlay: function() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    },
    
    stopAutoPlay: function() {
        clearInterval(this.autoPlayInterval);
    }
};

/**
 * Bird Card Interactions
 */
const BirdCardInteractions = {
    init: function() {
        const addToCartBtns = document.querySelectorAll('.bird-card .btn-add-to-cart');
        const viewDetailsBtns = document.querySelectorAll('.bird-card .btn-view-details');
        
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAddToCart(e));
        });
        
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewDetails(e));
        });
    },
    
    handleAddToCart: function(event) {
        event.preventDefault();
        const btn = event.target.closest('.btn-add-to-cart');
        const birdId = btn.dataset.birdId;
        
        if (!birdId) {
            Notification.error('Bird ID not found');
            return;
        }
        
        API.post('/cart/add', { bird_id: birdId })
            .then(response => {
                Notification.success('Bird added to cart!');
                this.updateCartCount();
            })
            .catch(error => {
                Notification.error('Failed to add to cart');
            });
    },
    
    handleViewDetails: function(event) {
        event.preventDefault();
        const btn = event.target.closest('.btn-view-details');
        const birdId = btn.dataset.birdId;
        
        if (birdId) {
            window.location.href = `/bird/${birdId}`;
        }
    },
    
    updateCartCount: function() {
        API.get('/cart/count')
            .then(response => {
                const badge = document.querySelector('.header-action-badge');
                if (badge) {
                    badge.textContent = response.count;
                }
            });
    }
};

/**
 * Vet Card Interactions
 */
const VetCardInteractions = {
    init: function() {
        const contactBtns = document.querySelectorAll('.vet-card .btn-contact');
        const viewProfileBtns = document.querySelectorAll('.vet-card .btn-view-profile');
        
        contactBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleContact(e));
        });
        
        viewProfileBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewProfile(e));
        });
    },
    
    handleContact: function(event) {
        event.preventDefault();
        const btn = event.target.closest('.btn-contact');
        const vetId = btn.dataset.vetId;
        
        if (vetId) {
            window.location.href = `/messages?vet_id=${vetId}`;
        }
    },
    
    handleViewProfile: function(event) {
        event.preventDefault();
        const btn = event.target.closest('.btn-view-profile');
        const vetId = btn.dataset.vetId;
        
        if (vetId) {
            window.location.href = `/vet/${vetId}`;
        }
    }
};

/**
 * Blog Post Interactions
 */
const BlogPostInteractions = {
    init: function() {
        const readMoreBtns = document.querySelectorAll('.blog-post-card');
        
        readMoreBtns.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('a')) {
                    const postId = card.dataset.postId;
                    if (postId) {
                        window.location.href = `/blog/${postId}`;
                    }
                }
            });
        });
    }
};

/**
 * Smooth Scroll to Sections
 */
const SmoothScroll = {
    init: function() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
};

/**
 * Intersection Observer for Animations
 */
const ScrollAnimations = {
    init: function() {
        if (!('IntersectionObserver' in window)) return;
        
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        const animatableElements = document.querySelectorAll('.bird-card, .vet-card, .blog-post-card');
        animatableElements.forEach(el => observer.observe(el));
    }
};

/**
 * Initialize all homepage features on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    HeroCarousel.init();
    BirdCardInteractions.init();
    VetCardInteractions.init();
    BlogPostInteractions.init();
    SmoothScroll.init();
    ScrollAnimations.init();
});
