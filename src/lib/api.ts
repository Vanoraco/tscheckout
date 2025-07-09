// API configuration for different environments
const getApiBaseUrl = (): string => {
  // In production (Vercel), use the same domain
  if (import.meta.env.PROD) {
    return window.location.origin
  }
  
  // In development, use localhost backend
  return 'http://localhost:3001'
}

export const API_BASE_URL = getApiBaseUrl()

// API endpoints
export const API_ENDPOINTS = {
  CREATE_CHECKOUT_SESSION: `${API_BASE_URL}/api/create-checkout-session`,
  GET_CHECKOUT_SESSION: (sessionId: string) => `${API_BASE_URL}/api/checkout-session/${sessionId}`,
  VALIDATE_PAYMENT_SESSION: `${API_BASE_URL}/api/validate-payment-session`,
  HEALTH: `${API_BASE_URL}/health`
} as const

// Helper function for making API requests
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}
