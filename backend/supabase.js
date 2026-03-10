// backend/supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { config } from './config.js';

// Initialize Supabase Client
export const supabase = createClient(
    config.supabase.url,
    config.supabase.key
);

// ===== DATABASE FUNCTIONS =====

// Get All Products
export async function getProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Get Product by ID
export async function getProductById(id) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Create Order
export async function createOrder(orderData) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        return null;
    }
}

// Subscribe to Newsletter
export async function subscribeNewsletter(email) {
    try {
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email, subscribed_at: new Date().toISOString() }])
            .select()
            .single();
        
        if (error) {
            if (error.code === '23505') {
                return { message: 'Email sudah terdaftar' };
            }
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error subscribing:', error);
        return null;
    }
}

// Submit Contact Form
export async function submitContactForm(data) {
    try {
        const { data: result, error } = await supabase
            .from('contact_messages')
            .insert([{
                name: data.name,
                email: data.email,
                message: data.message,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error submitting contact:', error);
        return null;
    }
}

// Get Cart from Storage (for persistent cart)
export function getCartFromStorage() {
    const cart = localStorage.getItem('ralies_cart');
    return cart ? JSON.parse(cart) : [];
}

// Save Cart to Storage
export function saveCartToStorage(cart) {
    localStorage.setItem('ralies_cart', JSON.stringify(cart));
}

// User Authentication (Optional - for future)
export async function signUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error signing up:', error);
        return null;
    }
}

export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error signing in:', error);
        return null;
    }
}

export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
}