// backend/api.js
import { supabase, subscribeNewsletter, submitContactForm, createOrder, saveCartToStorage } from './supabase.js';

// ===== EMAILJS INTEGRATION (Alternative to Supabase for emails) =====

export async function sendEmail(templateId, params) {
    // If using EmailJS (uncomment and configure)
    /*
    try {
        const emailjs = await import('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/+esm');
        emailjs.init(config.emailjs.publicKey);
        
        const result = await emailjs.send(
            config.emailjs.serviceId,
            templateId,
            params
        );
        
        return { success: true, result };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
    */
    
    // Using Supabase instead (recommended)
    return { success: true };
}

// ===== NEWSLETTER SUBSCRIPTION =====

export async function handleNewsletterSubmit(email) {
    // Validate email
    if (!email || !isValidEmail(email)) {
        return { success: false, message: 'Email tidak valid' };
    }
    
    // Save to database
    const result = await subscribeNewsletter(email);
    
    if (result) {
        // Send confirmation email (optional)
        await sendEmail('template_newsletter', {
            to_email: email,
            message: 'Terima kasih telah bergabung menjadi RaLies Ally!'
        });
        
        return { success: true, message: 'Berhasil berlangganan!' };
    }
    
    return { success: false, message: 'Gagal berlangganan' };
}

// ===== CONTACT FORM =====

export async function handleContactSubmit(formData) {
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
        return { success: false, message: 'Semua field wajib diisi' };
    }
    
    if (!isValidEmail(formData.email)) {
        return { success: false, message: 'Email tidak valid' };
    }
    
    // Save to database
    const result = await submitContactForm(formData);
    
    if (result) {
        // Send email notification to admin (optional)
        await sendEmail('template_contact', {
            to_name: formData.name,
            from_email: formData.email,
            message: formData.message
        });
        
        return { success: true, message: 'Pesan terkirim!' };
    }
    
    return { success: false, message: 'Gagal mengirim pesan' };
}

// ===== ORDER CHECKOUT =====

export async function handleCheckout(cart, customerData) {
    // Validate cart
    if (!cart || cart.length === 0) {
        return { success: false, message: 'Keranjang kosong' };
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order in database
    const orderData = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        items: cart,
        total_amount: total,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    const order = await createOrder(orderData);
    
    if (order) {
        // Clear cart
        cart = [];
        saveCartToStorage(cart);
        
        // Send order confirmation email (optional)
        await sendEmail('template_order', {
            to_name: customerData.name,
            to_email: customerData.email,
            order_id: order.id,
            total: total.toLocaleString('id-ID')
        });
        
        return { success: true, message: 'Order berhasil!', orderId: order.id };
    }
    
    return { success: false, message: 'Gagal membuat order' };
}

// ===== UTILITY FUNCTIONS =====

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}