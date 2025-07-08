import { createContext, useContext, useState, useEffect } from 'react'

interface StoreSettings {
  storeName: string
  productPrice: number
  backgroundColor: string
}

interface StoreContextType {
  settings: StoreSettings
  updateSettings: (newSettings: Partial<StoreSettings>) => void
}

const defaultSettings: StoreSettings = {
  storeName: "Layan",
  productPrice: 20.00,
  backgroundColor: "#ffffff"
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)

  // Load from localStorage after component mounts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('storeSettings')
      if (saved) {
        setSettings(JSON.parse(saved))
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    }
  }, [])

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    // Save to localStorage
    try {
      localStorage.setItem('storeSettings', JSON.stringify(updatedSettings))
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error)
    }
  }

  return (
    <StoreContext.Provider value={{ settings, updateSettings }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
