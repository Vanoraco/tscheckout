import { useState } from "react"
import { Link } from "react-router-dom"
import { useStripe } from '@stripe/react-stripe-js'
import { useStore } from "../contexts/StoreContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Info, Settings, Store, CheckCircle, Loader2, AlertCircle } from "lucide-react"

export default function StripeCheckoutSimple() {
  const stripe = useStripe()
  const { settings } = useStore()
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Check URL parameters for success/cancel states
  const urlParams = new URLSearchParams(window.location.search)
  const isSuccess = urlParams.get('success') === 'true'
  const isCanceled = urlParams.get('canceled') === 'true'

  const [paymentSuccess] = useState(isSuccess)
  const [paymentError, setPaymentError] = useState<string | null>(
    isCanceled ? 'Payment was canceled. You can try again.' : null
  )

  const validateEmail = (value: string) => {
    if (!value) return null // Email is optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format"
    return null
  }

  const handleSubmit = async () => {
    if (!stripe) {
      setPaymentError('Stripe has not loaded yet. Please try again.')
      return
    }

    // Validate email if provided
    const emailValidationError = validateEmail(email)
    setEmailError(emailValidationError)
    if (emailValidationError) return

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Call our API to create a Stripe Checkout Session
      // In development, use localhost server; in production, use Vercel serverless function
      const endpoint = import.meta.env.MODE === 'development'
        ? 'http://localhost:3001/api/create-checkout-session'
        : '/api/create-checkout-session'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: settings.productPrice,
          currency: 'usd',
          productName: settings.storeName,
          customerEmail: email || undefined,
          successUrl: `${window.location.origin}/checkout?success=true`,
          cancelUrl: `${window.location.origin}/checkout?canceled=true`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      })

      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout')
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Failed to start checkout process.')
      setIsProcessing(false)
    }
  }

  // Success Screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: settings.backgroundColor
      }}>
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">Thank you for your purchase from {settings.storeName}</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Store:</span>
                <span className="font-medium">{settings.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">${settings.productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono text-xs">{`ORDER-${Date.now()}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-600 font-medium">✓ Completed</span>
              </div>
              {email && (
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => window.location.href = '/checkout'}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Make Another Purchase
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      backgroundColor: settings.backgroundColor
    }}>
      {/* Dashboard Link */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-2 sm:px-3 py-2 rounded-md hover:bg-white transition-colors shadow-sm border text-sm"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden">Menu</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column - Product Info */}
        <div className="lg:w-1/2 px-4 sm:px-8 lg:px-20 py-6 lg:py-12 flex items-center justify-center order-1 lg:order-1" style={{ backgroundColor: settings.backgroundColor }}>
          <div className="max-w-md w-full text-center lg:text-left">
            <div className="mb-6">
              <Store className="w-8 h-8 text-gray-600 mx-auto lg:mx-0 mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{settings.storeName}</h2>
            </div>
            
            <div>
              <h1 className="text-lg sm:text-xl text-gray-500 mb-3 font-normal">Product Purchase</h1>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                ${settings.productPrice.toFixed(2)}
              </div>
              <p className="text-gray-500 text-base">Secure payment powered by Stripe</p>
            </div>
          </div>
        </div>

        {/* Right Column - Checkout Form */}
        <div className="lg:w-1/2 px-4 sm:px-8 lg:px-20 py-6 lg:py-12 flex items-center justify-center order-2 lg:order-2" style={{ backgroundColor: settings.backgroundColor }}>
          <div className="w-full max-w-md">
            {/* Contact Information */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Contact information</h2>
              <div>
                <Label htmlFor="email" className="text-sm text-gray-600 mb-2 block font-normal">
                  Email (optional)
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError(validateEmail(e.target.value))
                    }}
                    className="h-[35px] text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 bg-white pl-10"
                    placeholder="Enter your email (optional)"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {emailError && <p className="text-red-600 text-xs mt-1">{emailError}</p>}
              </div>
            </div>

            {/* Stripe Checkout Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Secure Checkout</h3>
                  <p className="text-xs text-blue-800">
                    You'll be redirected to Stripe's secure checkout page to enter your payment details. 
                    All payment information is processed securely by Stripe.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{paymentError}</p>
              </div>
            )}

            {/* Checkout Button */}
            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm mb-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to Stripe...
                </div>
              ) : (
                `Continue to Checkout - $${settings.productPrice.toFixed(2)}`
              )}
            </Button>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500">
              <span>Powered by </span>
              <span className="font-semibold text-gray-700">Stripe</span>
              <span className="mx-3">|</span>
              <a href="#" className="hover:text-gray-700">
                Terms
              </a>
              <span className="mx-3">|</span>
              <a href="#" className="hover:text-gray-700">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
