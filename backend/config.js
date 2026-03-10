// backend/config.js
// Konfigurasi environment variables

export const config = {
    // Supabase Configuration
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
    },
    
    // EmailJS Configuration (untuk contact form & newsletter)
    emailjs: {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
        templateIdContact: import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT || '',
        templateIdNewsletter: import.meta.env.VITE_EMAILJS_TEMPLATE_NEWSLETTER || '',
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
    },
    
    // App Configuration
    app: {
        name: 'RaLies',
        currency: 'IDR',
        locale: 'id-ID'
    }
};

export default config;