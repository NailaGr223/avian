/* ============================================
   AUTHENTICATION JAVASCRIPT
   ============================================ */

/**
 * Authentication Form Management
 */
const AuthForm = {
    init: function() {
        this.setupTabSwitching();
        this.setupFormValidation();
        this.setupPasswordStrength();
        this.setupRoleSelection();
        this.setupFormSubmission();
    },
    
    setupTabSwitching: function() {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetForm = tab.dataset.form;
                
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));
                
                tab.classList.add('active');
                const form = document.getElementById(targetForm);
                if (form) {
                    form.classList.add('active');
                }
            });
        });
    },
    
    setupFormValidation: function() {
        const forms = document.querySelectorAll('.auth-form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('.form-control');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        this.validateField(input);
                    }
                });
            });
        });
    },
    
    validateField: function(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        const name = field.name;
        
        field.classList.remove('error');
        
        if (required && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        if (type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        if (name === 'password' && value && value.length < 8) {
            this.showFieldError(field, 'Password must be at least 8 characters');
            return false;
        }
        
        if (name === 'confirm_password') {
            const passwordField = field.form.querySelector('input[name="password"]');
            if (value && passwordField && value !== passwordField.value) {
                this.showFieldError(field, 'Passwords do not match');
                return false;
            }
        }
        
        if (name === 'phone' && value && !this.isValidPhone(value)) {
            this.showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
        
        return true;
    },
    
    showFieldError: function(field, message) {
        field.classList.add('error');
        let errorElement = field.nextElementSibling;
        
        if (!errorElement || !errorElement.classList.contains('form-error')) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = message;
    },
    
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidPhone: function(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },
    
    setupPasswordStrength: function() {
        const passwordInputs = document.querySelectorAll('input[name="password"]');
        
        passwordInputs.forEach(input => {
            input.addEventListener('input', () => {
                const strength = this.calculatePasswordStrength(input.value);
                this.displayPasswordStrength(input, strength);
            });
        });
    },
    
    calculatePasswordStrength: function(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        
        if (strength <= 2) return 'weak';
        if (strength <= 3) return 'medium';
        return 'strong';
    },
    
    displayPasswordStrength: function(field, strength) {
        let strengthElement = field.nextElementSibling;
        
        if (!strengthElement || !strengthElement.classList.contains('password-strength')) {
            strengthElement = document.createElement('div');
            strengthElement.className = 'password-strength';
            field.parentNode.insertBefore(strengthElement, field.nextSibling);
        }
        
        strengthElement.className = `password-strength show ${strength}`;
        
        const strengthText = {
            weak: 'Weak password',
            medium: 'Medium strength',
            strong: 'Strong password'
        };
        
        strengthElement.textContent = strengthText[strength];
    },
    
    setupRoleSelection: function() {
        const roleOptions = document.querySelectorAll('.role-option input[type="radio"]');
        
        roleOptions.forEach(option => {
            option.addEventListener('change', () => {
                const role = option.value;
                this.updateFormForRole(role);
            });
        });
    },
    
    updateFormForRole: function(role) {
        const vetFields = document.querySelectorAll('[data-role="vet"]');
        const sellerFields = document.querySelectorAll('[data-role="seller"]');
        
        vetFields.forEach(field => {
            field.style.display = role === 'vet' ? 'block' : 'none';
            if (role === 'vet') {
                field.querySelectorAll('input, select').forEach(input => {
                    input.required = true;
                });
            } else {
                field.querySelectorAll('input, select').forEach(input => {
                    input.required = false;
                });
            }
        });
        
        sellerFields.forEach(field => {
            field.style.display = role === 'seller' ? 'block' : 'none';
            if (role === 'seller') {
                field.querySelectorAll('input, select').forEach(input => {
                    input.required = true;
                });
            } else {
                field.querySelectorAll('input, select').forEach(input => {
                    input.required = false;
                });
            }
        });
    },
    
    setupFormSubmission: function() {
        const forms = document.querySelectorAll('.auth-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        });
    },
    
    handleFormSubmit: function(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('.form-submit');
        
        if (!this.validateForm(form)) {
            Notification.error('Please fix the errors in the form');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        const formData = new FormData(form);
        const endpoint = form.dataset.endpoint || '/auth/register';
        
        API.post(endpoint, Object.fromEntries(formData))
            .then(response => {
                Notification.success(response.message || 'Success!');
                setTimeout(() => {
                    window.location.href = response.redirect || '/';
                }, 1500);
            })
            .catch(error => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
                Notification.error(error.message || 'An error occurred');
            });
    },
    
    validateForm: function(form) {
        const inputs = form.querySelectorAll('.form-control');
        let isValid = true;
        
        inputs.forEach(input => {
            if (input.offsetParent !== null) {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }
};

/**
 * Login Form Management
 */
const LoginForm = {
    init: function() {
        this.setupFormValidation();
        this.setupFormSubmission();
        this.setupRememberMe();
    },
    
    setupFormValidation: function() {
        const form = document.getElementById('login-form');
        if (!form) return;
        
        const inputs = form.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    },
    
    validateField: function(field) {
        const value = field.value.trim();
        const type = field.type;
        
        if (!value) {
            AuthForm.showFieldError(field, 'This field is required');
            return false;
        }
        
        if (type === 'email' && !AuthForm.isValidEmail(value)) {
            AuthForm.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        field.classList.remove('error');
        return true;
    },
    
    setupFormSubmission: function() {
        const form = document.getElementById('login-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });
    },
    
    handleSubmit: function(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('.form-submit');
        
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const rememberMe = form.querySelector('input[name="remember_me"]')?.checked || false;
        
        if (!email || !password) {
            Notification.error('Please fill in all fields');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        API.post('/auth/login', {
            email: email,
            password: password,
            remember_me: rememberMe
        })
            .then(response => {
                Notification.success('Login successful!');
                setTimeout(() => {
                    window.location.href = response.redirect || '/dashboard';
                }, 1000);
            })
            .catch(error => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
                Notification.error(error.message || 'Login failed');
            });
    },
    
    setupRememberMe: function() {
        const rememberCheckbox = document.querySelector('input[name="remember_me"]');
        if (!rememberCheckbox) return;
        
        const savedEmail = localStorage.getItem('remembered-email');
        if (savedEmail) {
            const emailInput = document.querySelector('input[name="email"]');
            if (emailInput) {
                emailInput.value = savedEmail;
                rememberCheckbox.checked = true;
            }
        }
        
        rememberCheckbox.addEventListener('change', () => {
            const emailInput = document.querySelector('input[name="email"]');
            if (rememberCheckbox.checked && emailInput) {
                localStorage.setItem('remembered-email', emailInput.value);
            } else {
                localStorage.removeItem('remembered-email');
            }
        });
    }
};

/**
 * Social Login
 */
const SocialLogin = {
    init: function() {
        const socialBtns = document.querySelectorAll('.social-login-btn');
        
        socialBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = btn.dataset.provider;
                this.handleSocialLogin(provider);
            });
        });
    },
    
    handleSocialLogin: function(provider) {
        const redirectUrl = `/auth/social/${provider}`;
        window.location.href = redirectUrl;
    }
};

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        LoginForm.init();
    }
    
    if (registerForm) {
        AuthForm.init();
    }
    
    SocialLogin.init();
});
