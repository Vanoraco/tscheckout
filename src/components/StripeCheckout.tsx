import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "../contexts/StoreContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Info, Lock, ChevronDown, Settings, Store, CheckCircle, Loader2, AlertCircle } from "lucide-react"

// Flag component using flag-icons library for professional flag icons
const FlagIcon = ({ countryCode, className = "" }: { countryCode: string; className?: string }) => {
  // Alternative: Using Flaticon URLs (uncomment to use instead of flag-icons)
  const flaticonUrls: { [key: string]: string } = {
    "US": "https://cdn-icons-png.flaticon.com/32/197/197484.png", // United States
    "GB": "https://cdn-icons-png.flaticon.com/32/197/197374.png", // United Kingdom
    "CA": "https://cdn-icons-png.flaticon.com/32/197/197430.png", // Canada
    "AU": "https://cdn-icons-png.flaticon.com/32/197/197507.png", // Australia
    "DE": "https://cdn-icons-png.flaticon.com/32/197/197571.png", // Germany
    "FR": "https://cdn-icons-png.flaticon.com/32/197/197560.png", // France
    "IN": "https://cdn-icons-png.flaticon.com/32/197/197419.png", // India
    "JP": "https://cdn-icons-png.flaticon.com/32/197/197604.png", // Japan
    "BR": "https://cdn-icons-png.flaticon.com/32/197/197386.png"  // Brazil
  }

  // Option 2: Use Flaticon images (preferred implementation)
  return (
    <img
      src={flaticonUrls[countryCode] || "https://cdn-icons-png.flaticon.com/32/197/197484.png"}
      alt={`${countryCode} flag`}
      className={`inline-block w-6 h-4 rounded-sm border border-gray-300 object-cover ${className}`}
      title={countryCode}
    />
  )
}

const countries = [
  { code: "US", name: "United States", prefix: "+1" },
  { code: "GB", name: "United Kingdom", prefix: "+44" },
  { code: "CA", name: "Canada", prefix: "+1" },
  { code: "AU", name: "Australia", prefix: "+61" },
  { code: "DE", name: "Germany", prefix: "+49" },
  { code: "FR", name: "France", prefix: "+33" },
  { code: "IN", name: "India", prefix: "+91" },
  { code: "JP", name: "Japan", prefix: "+81" },
  { code: "BR", name: "Brazil", prefix: "+55" },
]

export default function StripeCheckout() {
  const { settings } = useStore()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [cardholderName, setCardholderName] = useState("")
  const [country, setCountry] = useState("United States")
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(countries[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [saveInfo, setSaveInfo] = useState(false)

  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [cardNumberError, setCardNumberError] = useState<string | null>(null)
  const [expiryError, setExpiryError] = useState<string | null>(null)
  const [cvcError, setCvcError] = useState<string | null>(null)
  const [cardholderNameError, setCardholderNameError] = useState<string | null>(null)

  const validateEmail = (value: string) => {
    if (!value) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format"
    return null
  }

  const validatePhone = (value: string) => {
    if (!value) return "Phone number is required"
    const cleanPhone = value.replace(/\s/g, "")
    if (!/^\d+$/.test(cleanPhone)) return "Invalid phone format"
    if (cleanPhone.length < 7) return "Phone number too short"
    if (cleanPhone.length > 15) return "Phone number too long"
    return null
  }

  const validateCardNumber = (value: string) => {
    if (!value) return "Card number is required"
    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(value)) return "Invalid card number format"
    return null
  }

  const validateExpiry = (value: string) => {
    if (!value) return "Expiry date is required"
    if (!/^\d{2} \/ \d{2}$/.test(value)) return "Invalid expiry format"

    // Check if date is valid and not in the past
    const [month, year] = value.split(" / ")
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10) + 2000 // Convert YY to YYYY

    // Validate month range
    if (monthNum < 1 || monthNum > 12) return "Invalid month"

    // Check if date is in the past
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // getMonth() returns 0-11

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return "Card has expired"
    }

    return null
  }

  const validateCvc = (value: string) => {
    if (!value) return "CVC is required"
    if (!/^\d{3,4}$/.test(value)) return "Invalid CVC format"
    return null
  }

  const validateCardholderName = (value: string) => {
    if (!value) return "Cardholder name is required"
    return null
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
    setCardNumberError(validateCardNumber(formatted))
  }

  const formatExpiry = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, "")

    // Limit to 4 digits (MMYY)
    const limited = v.substring(0, 4)

    // Add slash after MM
    if (limited.length >= 2) {
      return limited.substring(0, 2) + " / " + limited.substring(2)
    }

    return limited
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    setExpiry(formatted)
    setExpiryError(validateExpiry(formatted))
  }

  const formatCvc = (value: string) => {
    // Remove all non-digits and limit to 4 characters
    return value.replace(/\D/g, "").substring(0, 4)
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCvc(e.target.value)
    setCvc(formatted)
    setCvcError(validateCvc(formatted))
  }

  const formatPhone = (value: string) => {
    // Remove all non-digits and limit to reasonable length
    return value.replace(/\D/g, "").substring(0, 15)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    setPhoneError(validatePhone(formatted))
  }

  const handleCountrySelect = (selectedCountry: (typeof countries)[0]) => {
    setSelectedPhoneCountry(selectedCountry)
    setShowCountryDropdown(false)
    // Clear phone number when country changes
    setPhone("")
  }

  const validateForm = () => {
    setEmailError(validateEmail(email))
    setPhoneError(validatePhone(phone))
    setCardNumberError(validateCardNumber(cardNumber))
    setExpiryError(validateExpiry(expiry))
    setCvcError(validateCvc(cvc))
    setCardholderNameError(validateCardholderName(cardholderName))

    return !(
      validateEmail(email) ||
      validatePhone(phone) ||
      validateCardNumber(cardNumber) ||
      validateExpiry(expiry) ||
      validateCvc(cvc) ||
      validateCardholderName(cardholderName)
    )
  }

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate payment success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1

      if (isSuccess) {
        setPaymentSuccess(true)
        // Save order details to localStorage for demo
        const orderDetails = {
          orderId: `ORDER-${Date.now()}`,
          email,
          phone: `${selectedPhoneCountry.prefix} ${phone}`,
          amount: settings.productPrice,
          cardLast4: cardNumber.slice(-4),
          timestamp: new Date().toISOString(),
          storeName: settings.storeName
        }
        localStorage.setItem('lastOrder', JSON.stringify(orderDetails))
      } else {
        throw new Error('Payment declined. Please try a different card.')
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid = !!(
    email &&
    phone &&
    cardNumber &&
    expiry &&
    cvc &&
    cardholderName &&
    !validateEmail(email) &&
    !validatePhone(phone) &&
    !validateCardNumber(cardNumber) &&
    !validateExpiry(expiry) &&
    !validateCvc(cvc) &&
    !validateCardholderName(cardholderName)
  )

  // Success Screen
  if (paymentSuccess) {
    const orderDetails = JSON.parse(localStorage.getItem('lastOrder') || '{}')
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: settings.backgroundColor
      }}>
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Thank you for your purchase from {settings.storeName}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${orderDetails.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{orderDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Card:</span>
                <span>****{orderDetails.cardLast4}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setPaymentSuccess(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Make Another Purchase
            </Button>
            <Link
              to="/dashboard"
              className="block w-full text-center py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back to Dashboard
            </Link>
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
          className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-md hover:bg-white transition-colors shadow-sm border"
        >
          <Settings className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 min-h-screen">
        {/* Left Column - Product Info */}
        <div className="px-20 pt-[60px] flex flex-col items-center relative" style={{ backgroundColor: settings.backgroundColor }}>
          {/* Concave shadow effect */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-100/30 to-transparent"></div>
          <div className="max-w-xs w-full text-center">
            {/* Header */}
            <div className="flex items-center justify-center mb-[45px]">
              <Store className="w-6 h-6 text-gray-600 mr-3" />
              <span className="text-lg font-medium text-gray-700">{settings.storeName}</span>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-xl text-gray-500 mb-3 font-normal">Product Title</h1>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ${settings.productPrice.toFixed(2)}
              </div>
              <p className="text-gray-500 text-base">Product Description</p>
            </div>
          </div>
        </div>

        {/* Right Column - Checkout Form */}
        <div className="px-20 py-6 flex items-start justify-center" style={{ backgroundColor: settings.backgroundColor }}>
          <div className="w-full max-w-sm pt-1">
            {/* Contact Information */}
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Contact information</h2>
              <div className="space-y-0">
                <div>
                  <Label htmlFor="email" className="text-sm text-gray-600 mb-2 block font-normal">
                    Contact information
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-20" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setEmailError(validateEmail(e.target.value))
                      }}
                      className="pl-12 h-[35px] text-sm border-gray-300 rounded-t-md rounded-b-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 bg-white relative focus:z-10"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 cursor-pointer z-20 w-4 h-4 flex items-center justify-center"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <FlagIcon countryCode={selectedPhoneCountry.code} />
                  </div>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {countries.map((countryOption) => (
                        <div
                          key={countryOption.code}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCountrySelect(countryOption)}
                        >
                          <FlagIcon countryCode={countryOption.code} className="mr-3" />
                          <span className="text-sm text-gray-700 mr-2">{countryOption.name}</span>
                          <span className="text-sm text-gray-500 ml-auto">{countryOption.prefix}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onFocus={() => setShowCountryDropdown(false)}
                    className="pl-12 pr-12 h-[35px] text-sm border-gray-300 rounded-t-none rounded-b-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 bg-white"
                    placeholder="1234567890"
                    maxLength={15}
                  />
                  <Info className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                </div>

                {/* Error messages for contact information */}
                <div className="mt-2">
                  {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                  {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Payment method</h2>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="card" className="text-sm text-gray-600 mb-2 block font-normal">
                    Card information
                  </Label>
                  <div className="space-y-0">
                    <div className="relative">
                      <Input
                        id="card"
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="h-[35px] text-sm border-gray-300 rounded-t-md rounded-b-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 bg-white pr-20 relative focus:z-10"
                        placeholder="1234 1234 1234 1234"
                        maxLength={19}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-1 z-20">
                        <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          VISA
                        </div>
                        <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center relative overflow-hidden">
                          <div className="w-3 h-3 bg-red-600 rounded-full absolute -left-0.5"></div>
                          <div className="w-3 h-3 bg-orange-400 rounded-full absolute -right-0.5"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex -space-x-px">
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className="h-[35px] text-sm border-gray-300 rounded-bl-md rounded-br-none rounded-t-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus:z-10 bg-white relative"
                          placeholder="MM / YY"
                          maxLength={7}
                        />
                      </div>
                      <div className="flex-1 relative">
                        <Input
                          type="text"
                          value={cvc}
                          onChange={handleCvcChange}
                          className="h-[35px] text-sm border-gray-300 rounded-bl-none rounded-br-md rounded-t-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus:z-10 bg-white pr-12 relative"
                          placeholder="CVC"
                          maxLength={4}
                        />
                        <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-20" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardholder" className="text-sm text-gray-600 mb-2 block font-normal">
                    Cardholder name
                  </Label>
                  <Input
                    id="cardholder"
                    type="text"
                    value={cardholderName}
                    onChange={(e) => {
                      setCardholderName(e.target.value)
                      setCardholderNameError(validateCardholderName(e.target.value))
                    }}
                    className="h-[35px] text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 bg-white"
                    placeholder="John Doe"
                  />
                </div>

                {/* Error messages for payment information */}
                <div className="mt-2">
                  {cardNumberError && <p className="text-red-500 text-sm">{cardNumberError}</p>}
                  {expiryError && <p className="text-red-500 text-sm">{expiryError}</p>}
                  {cvcError && <p className="text-red-500 text-sm">{cvcError}</p>}
                  {cardholderNameError && <p className="text-red-500 text-sm">{cardholderNameError}</p>}
                </div>

                <div>
                  <Label htmlFor="country" className="text-sm text-gray-600 mb-2 block font-normal">
                    Country or region
                  </Label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-[35px] text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-0 focus:outline-none bg-white px-4 appearance-none"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Information Checkbox */}
            <div className="mb-4">
              <div className="flex items-start space-x-4 p-3 border border-gray-200 rounded-md bg-white">
                <Checkbox id="save-info" checked={saveInfo} onCheckedChange={(checked) => setSaveInfo(checked === true)} className="mt-0.5 w-4 h-4" />
                <div className="space-y-2">
                  <Label htmlFor="save-info" className="text-sm font-medium text-gray-900 cursor-pointer leading-tight">
                    Save my information for faster checkout
                  </Label>
                  <p className="text-xs text-gray-500 leading-tight">
                    Pay faster on Layan and everywhere Link is accepted.
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

            {/* Pay Button */}
            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm mb-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!isFormValid || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                `Pay $${settings.productPrice.toFixed(2)}`
              )}
            </Button>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500">
              <span>Powered by </span>
              <span className="font-semibold text-gray-700">stripe</span>
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

      {/* Click outside to close dropdown */}
      {showCountryDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />}
    </div>
  )
}
