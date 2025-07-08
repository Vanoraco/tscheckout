
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { StoreProvider, useStore } from './contexts/StoreContext'
import StripeCheckout from './components/StripeCheckout'

// Dashboard component with store context
function Dashboard() {
  const { settings, updateSettings } = useStore()
  const [formData, setFormData] = useState(settings)
  const [saved, setSaved] = useState(false)

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    updateSettings(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const predefinedColors = [
    { name: 'Pure White', value: '#ffffff' },
    { name: 'Light Gray', value: '#f8fafc' },
    { name: 'Sky Blue', value: '#f0f9ff' },
    { name: 'Emerald', value: '#ecfdf5' },
    { name: 'Violet', value: '#faf5ff' },
    { name: 'Rose', value: '#fff1f2' },
    { name: 'Amber', value: '#fffbeb' },
    { name: 'Neutral', value: '#f5f5f5' }
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-600 mt-0.5">Manage your store settings and checkout experience</p>
                </div>
              </div>
              <Link
                to="/checkout"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Preview checkout
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Store settings</h2>
                <p className="text-sm text-gray-600 mt-1">Configure your store information and checkout appearance</p>
              </div>

              <div className="space-y-6">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store name
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Enter your store name"
                  />
                </div>

                {/* Product Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product price
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.productPrice}
                      onChange={(e) => handleInputChange('productPrice', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be displayed as ${formData.productPrice.toFixed(2)}
                  </p>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background color
                  </label>

                  {/* Color Palette */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleInputChange('backgroundColor', color.value)}
                        className={`relative h-10 rounded-md border-2 transition-colors ${
                          formData.backgroundColor === color.value
                            ? 'border-gray-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {formData.backgroundColor === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a preset color or enter a custom hex value
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleSave}
                      className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Save changes
                    </button>
                    {saved && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                <p className="text-sm text-gray-600 mt-1">See how your checkout will look</p>
              </div>

              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg border-2 border-dashed border-gray-300 text-center"
                  style={{ backgroundColor: formData.backgroundColor }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-5 h-5 bg-gray-400 rounded mr-2 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-gray-600 rounded-sm"></div>
                    </div>
                    <span className="text-base font-medium text-gray-700">{formData.storeName || 'Store Name'}</span>
                  </div>
                  <h4 className="text-base text-gray-500 mb-1">Product Title</h4>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ${formData.productPrice.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600">Product Description</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Current settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Store name</span>
                      <span className="text-gray-900">{formData.storeName || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price</span>
                      <span className="text-gray-900">${formData.productPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Background</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded border border-gray-300"
                          style={{ backgroundColor: formData.backgroundColor }}
                        ></div>
                        <span className="text-gray-900 font-mono text-xs">{formData.backgroundColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Checkout wrapper that uses the original component
function Checkout() {
  return <StripeCheckout />
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Router>
    </StoreProvider>
  )
}

export default App
