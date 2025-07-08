import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { ArrowRight, Store, Palette, DollarSign, CheckCircle, X } from 'lucide-react'

export default function Dashboard() {
  const { settings, updateSettings } = useStore()
  const [formData, setFormData] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const predefinedColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#f8f9fa' },
    { name: 'Blue', value: '#e3f2fd' },
    { name: 'Green', value: '#e8f5e8' },
    { name: 'Purple', value: '#f3e5f5' },
    { name: 'Orange', value: '#fff3e0' },
    { name: 'Pink', value: '#fce4ec' },
    { name: 'Yellow', value: '#fffde7' }
  ]

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    updateSettings(formData)
    setSaved(true)
    setShowToast(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                Store Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your store settings and appearance</p>
            </div>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base self-start sm:self-auto"
            >
              View Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Store Settings</h2>
          
          <div className="space-y-6">
            {/* Store Name */}
            <div>
              <Label htmlFor="storeName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Store className="w-4 h-4" />
                Store Name
              </Label>
              <Input
                id="storeName"
                type="text"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="h-[35px]"
                placeholder="Enter your store name"
              />
            </div>

            {/* Product Price */}
            <div>
              <Label htmlFor="productPrice" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Product Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.productPrice}
                  onChange={(e) => handleInputChange('productPrice', parseFloat(e.target.value) || 0)}
                  className="h-[35px] pl-8"
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Preview: {formatPrice(formData.productPrice)}
              </p>
            </div>

            {/* Background Color */}
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Palette className="w-4 h-4" />
                Background Color
              </Label>
              
              {/* Color Picker Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleInputChange('backgroundColor', color.value)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      formData.backgroundColor === color.value 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <div className="text-xs font-medium text-gray-700">{color.name}</div>
                  </button>
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  className="h-8 text-sm font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Preview */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Preview</Label>
              <div 
                className="p-4 rounded-lg border-2 border-dashed border-gray-300"
                style={{ backgroundColor: formData.backgroundColor }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Store className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{formData.storeName}</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(formData.productPrice)}</p>
                  <p className="text-sm text-gray-600 mt-2">This is how your checkout page will look</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save Settings
              </Button>
              {saved && (
                <span className="text-green-600 text-sm font-medium">✓ Settings saved successfully!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Settings saved successfully!</span>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto hover:bg-green-700 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
