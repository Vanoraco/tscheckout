import { loadStripe } from '@stripe/stripe-js'

// Get the publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env.local file')
}

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey || 'pk_test_demo')

// Stripe test card numbers for sandbox testing
export const TEST_CARDS = {
  VISA_SUCCESS: '4242424242424242',
  VISA_DECLINED: '4000000000000002',
  MASTERCARD_SUCCESS: '5555555555554444',
  AMEX_SUCCESS: '378282246310005',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED_CARD: '4000000000000069',
  INCORRECT_CVC: '4000000000000127',
  PROCESSING_ERROR: '4000000000000119'
}

// Helper function to format card number for display
export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(' ')
  } else {
    return v
  }
}

// Helper function to format expiry date
export const formatExpiry = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (v.length >= 2) {
    return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '')
  }
  return v
}

// Helper function to validate card number using Luhn algorithm
export const validateCardNumber = (cardNumber: string): boolean => {
  const num = cardNumber.replace(/\s/g, '')
  if (!/^\d+$/.test(num)) return false
  
  let sum = 0
  let shouldDouble = false
  
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10)
    
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    
    sum += digit
    shouldDouble = !shouldDouble
  }
  
  return sum % 10 === 0 && num.length >= 13 && num.length <= 19
}

// Helper function to get card type from number
export const getCardType = (cardNumber: string): string => {
  const num = cardNumber.replace(/\s/g, '')
  
  if (/^4/.test(num)) return 'visa'
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard'
  if (/^3[47]/.test(num)) return 'amex'
  if (/^6/.test(num)) return 'discover'
  
  return 'unknown'
}
