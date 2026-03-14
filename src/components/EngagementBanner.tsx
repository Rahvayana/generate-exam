'use client'

import React, { useState, useEffect } from 'react'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface BannerData {
  id: string
  title: string
  message: string
  buttonText: string
  buttonUrl: string
  allowDismiss: boolean
}

interface EngagementBannerProps {
  className?: string
}

export function EngagementBanner({ className = '' }: EngagementBannerProps) {
  const [banners, setBanners] = useState<BannerData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    fetchActiveBanners()
  }, [])

  const fetchActiveBanners = async () => {
    try {
      const response = await fetch('/api/banner/active')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.banners.length > 0) {
          setBanners(data.banners)
        }
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = async (bannerId: string) => {
    setIsClosing(true)

    try {
      await fetch('/api/banner/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId }),
      })

      // Move to next banner or close if no more
      if (currentIndex < banners.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setIsClosing(false)
      } else {
        setBanners([])
      }
    } catch (error) {
      console.error('Error dismissing banner:', error)
      setIsClosing(false)
    }
  }

  const handleButtonClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isLoading || banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        isClosing ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      } ${className}`}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white text-sm">{currentBanner.title}</h3>
          </div>
          {currentBanner.allowDismiss && (
            <button
              onClick={() => handleDismiss(currentBanner.id)}
              className="text-white/80 hover:text-white transition-colors p-0.5 rounded-md hover:bg-white/20"
              aria-label="Close banner"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-slate-700 text-sm mb-4 leading-relaxed">
            {currentBanner.message}
          </p>

          {/* Action Button */}
          <button
            onClick={() => handleButtonClick(currentBanner.buttonUrl)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 px-4 rounded-xl font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            {currentBanner.buttonText}
          </button>
        </div>

        {/* Banner Indicator (if multiple banners) */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-6 bg-blue-500'
                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
