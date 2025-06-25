// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_API_URL || '/api'  // Use Vercel functions or deployed backend
    : 'http://127.0.0.1:8000',  // Local development
  
  ENDPOINTS: {
    VERIFY_CLAIM: '/verify-claim',
    BREAKDOWN_CLAIM: '/breakdown-claim'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 