// script.js - UPDATED WITH BACKEND INTEGRATION

import { supabase, getCartFromStorage, saveCartToStorage } from './backend/supabase.js';
import { handleNewsletterSubmit, handleContactSubmit, handleCheckout, formatCurrency } from './backend/api.js';

// ===== INITIALIZE CART FROM STORAGE =====
let cart = getCartFromStorage();
updateCart();

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.getElementById('nav-menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== MOBILE MENU TOGGLE =====
mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// ===== CART SIDEBAR =====
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.querySelector('.cart-count');

cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeCart.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    saveCartToStorage(cart);
    updateCart();
    openCartAfterAdd();
    
    // Show notification
    showNotification('Produk ditambahkan ke keranjang!', 'success');
}

function openCartAfterAdd() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    saveCartToStorage(cart);
    updateCart();
}

function updateQuantity(productName, change) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productName);
        } else {
            saveCartToStorage(cart);
            updateCart();
        }
    }
}

function updateCart() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray-500);">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>Keranjang Anda kosong</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.style.cssText = `
                display: flex;
                gap: 16px;
                padding: 16px 0;
                border-bottom: 1px solid var(--gray-200);
            `;
            
            itemElement.innerHTML = `
                <div style="flex: 1;">
                    <h4 style="font-family: var(--font-serif); margin-bottom: 4px;">${item.name}</h4>
                    <p style="color: var(--sage); font-weight: 600;">${formatCurrency(item.price)}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button onclick="updateQuantity('${item.name}', -1)" 
                            style="width: 28px; height: 28px; background: var(--gray-100); border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-minus" style="font-size: 0.75rem;"></i>
                    </button>
                    <span style="font-weight: 600; min-width: 24px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', 1)" 
                            style="width: 28px; height: 28px; background: var(--gray-100); border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-plus" style="font-size: 0.75rem;"></i>
                    </button>
                </div>
                <button onclick="removeFromCart('${item.name}')" 
                        style="color: var(--gray-400); cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            cartItems.appendChild(itemElement);
        });
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = formatCurrency(total);
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// ===== CHECKOUT FUNCTION =====
async function handleCheckoutClick() {
    if (cart.length === 0) {
        showNotification('Keranjang kosong!', 'error');
        return;
    }
    
    // Simple checkout (for production, add checkout form/modal)
    const customerData = {
        name: prompt('Masukkan nama Anda:'),
        email: prompt('Masukkan email Anda:'),
        phone: prompt('Masukkan nomor WhatsApp:'),
        address: prompt('Masukkan alamat pengiriman:')
    };
    
    if (!customerData.name || !customerData.email) {
        showNotification('Data tidak lengkap!', 'error');
        return;
    }
    
    // Show loading
    showNotification('Memproses order...', 'loading');
    
    // Process checkout
    const result = await handleCheckout(cart, customerData);
    
    if (result.success) {
        showNotification(`Order berhasil! ID: ${result.orderId}`, 'success');
        closeCartSidebar();
        cart = [];
        saveCartToStorage(cart);
        updateCart();
        
        // Redirect to WhatsApp for payment (simple solution)
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const message = `Halo RaLies, saya ingin order:\n\n${cart.map(i => `- ${i.name} x${i.quantity}`).join('\n')}\n\nTotal: ${formatCurrency(total)}\n\nNama: ${customerData.name}\nEmail: ${customerData.email}\nPhone: ${customerData.phone}\nAddress: ${customerData.address}`;
        
        setTimeout(() => {
            window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(message)}`, '_blank');
        }, 1500);
    } else {
        showNotification(result.message, 'error');
    }
}

// Add checkout button event listener
document.querySelector('.cart-footer .btn-primary').addEventListener('click', handleCheckoutClick);

// ===== NEWSLETTER FORM =====
const newsletterForm = document.getElementById('newsletter-form');

newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('.email-input').value;
    
    showNotification('Memproses...', 'loading');
    
    const result = await handleNewsletterSubmit(email);
    
    if (result.success) {
        showNotification(result.message, 'success');
        newsletterForm.reset();
    } else {
        showNotification(result.message, 'error');
    }
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: contactForm.querySelector('input[type="text"]').value,
        email: contactForm.querySelector('input[type="email"]').value,
        message: contactForm.querySelector('textarea').value
    };
    
    showNotification('Mengirim pesan...', 'loading');
    
    const result = await handleContactSubmit(formData);
    
    if (result.success) {
        showNotification(result.message, 'success');
        contactForm.reset();
    } else {
        showNotification(result.message, 'error');
    }
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        padding: 16px 24px;
        background-color: ${type === 'success' ? 'var(--sage)' : type === 'error' ? '#dc2626' : 'var(--charcoal)'};
        color: white;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== QUICK VIEW MODAL =====
const quickViewModal = document.getElementById('quick-view-modal');
const closeModal = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

function quickView(productName) {
    const products = {
        'Camp Collar Shirt': {
            name: 'Camp Collar Shirt',
            price: 299000,
            description: 'Premium Cotton Linen dengan warna earthy tones.',
            features: ['55% Linen, 45% Cotton', '140-160 GSM', 'Coconut shell buttons'],
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=700&fit=crop'
        },
        'Boxy Jacket': {
            name: 'Boxy Jacket',
            price: 599000,
            description: 'Canvas premium dengan fit boxy yang modern.',
            features: ['12oz Cotton Canvas', 'YKK zipper', 'Ribbed cuffs & hem'],
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=700&fit=crop'
        },
        'Camp Collar - Sage': {
            name: 'Camp Collar - Sage',
            price: 299000,
            description: 'Warna sage green yang natural dan timeless.',
            features: ['55% Linen, 45% Cotton', 'Sage green color', 'Breathable fabric'],
            image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=700&fit=crop'
        }
    };
    
    const product = products[productName];
    
    if (product) {
        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                <div>
                    <img src="${product.image}" alt="${product.name}" 
                         style="width: 100%; border-radius: 8px; object-fit: cover;">
                </div>
                <div>
                    <h2 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 12px; color: var(--charcoal);">
                        ${product.name}
                    </h2>
                    <p style="font-size: 1.5rem; color: var(--sage); font-weight: 600; margin-bottom: 20px;">
                        ${formatCurrency(product.price)}
                    </p>
                    <p style="color: var(--gray-600); line-height: 1.7; margin-bottom: 24px;">
                        ${product.description}
                    </p>
                    <div style="margin-bottom: 32px;">
                        <h4 style="font-weight: 600; margin-bottom: 12px; color: var(--charcoal);">Features:</h4>
                        <ul style="list-style: none;">
                            ${product.features.map(feature => `
                                <li style="padding: 8px 0; color: var(--gray-600);">
                                    <i class="fas fa-check" style="color: var(--sage); margin-right: 8px;"></i>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button onclick="addToCart('${product.name}', ${product.price}); closeModal.click();" 
                                class="btn btn-primary" style="flex: 1;">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        quickViewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

closeModal.addEventListener('click', () => {
    quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
});

quickViewModal.addEventListener('click', (e) => {
    if (e.target === quickViewModal) {
        quickViewModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            if (entry.target.querySelector('.stat-number')) {
                animateStats(entry.target);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .value-card, .product-card, .meaning-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

function animateStats(container) {
    const statNumbers = container.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                stat.textContent = target + (target === 100 ? '%' : '+');
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current) + (target === 100 ? '%' : '+');
            }
        }, 16);
    });
}

const alliesSection = document.querySelector('.allies');
if (alliesSection) {
    observer.observe(alliesSection);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== PARALLAX EFFECT =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image-wrapper');
    
    if (heroImage && scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    document.body.classList.add('loaded');
    console.log('🎉 RaLies website loaded successfully!');
    console.log('Rally Together. Rise as Allies.');
});