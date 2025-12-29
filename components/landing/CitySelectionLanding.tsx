'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCities } from '@/lib/hooks/useCities';
import { useCityStore } from '@/lib/stores/cityStore';
import { useI18n } from '@/lib/contexts/I18nContext';
import { getLocalizedName } from '@/lib/utils/localizedNames';
import { getCityImage } from '@/lib/utils/cityImages';
import BottomNavigation from '@/components/layout/BottomNavigation';

export default function CitySelectionLanding() {
  const router = useRouter();
  const { locale, isRTL } = useI18n();
  const { data: cities = [], isLoading } = useCities();
  const { setSelectedCity } = useCityStore();
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Only render content after client-side hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
    router.push(`/?cityId=${cityId}`);
  };

  // Filter cities - show only German cities
  const germanCities = cities.filter((city) => {
    const cityName = getLocalizedName(city.name, locale)?.toLowerCase() || '';
    // Include major German cities
    return cityName;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 pb-16 md:pb-0">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {isRTL ? 'شهر خود را انتخاب کنید' : 'Wählen Sie Ihre Stadt'}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            {isRTL 
              ? 'برای مشاهده آگهی‌های شهر مورد نظر، یکی از شهرهای زیر را انتخاب کنید'
              : 'Wählen Sie eine Stadt aus, um Anzeigen in Ihrer Nähe zu sehen'
            }
          </p>
        </div>

        {/* Cities Grid */}
        {!mounted || isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-w-6xl mx-auto">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-lg border border-gray-200 h-24"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-w-6xl mx-auto">
            {germanCities.map((city) => {
              const cityName = getLocalizedName(city.name, locale) || 'Unknown';
              const cityIcon = getCityImage(cityName);
              const isHovered = hoveredCity === city.id;
              
              return (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city.id)}
                  onMouseEnter={() => setHoveredCity(city.id)}
                  onMouseLeave={() => setHoveredCity(null)}
                  className={`
                    relative group
                    bg-white rounded-lg border-2 transition-all duration-300
                    h-24
                    flex flex-col items-center justify-center
                    shadow-sm hover:shadow-md
                    transform hover:scale-105
                    ${isHovered 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                    }
                  `}
                >
                  {/* City Icon/Emoji */}
                  <div className={`
                    text-3xl mb-1 transition-transform duration-300
                    ${isHovered ? 'scale-110' : 'scale-100'}
                  `}>
                    {cityIcon}
                  </div>
                  
                  {/* City Name */}
                  <span className={`
                    text-xs font-semibold transition-colors duration-300 px-1 text-center
                    ${isHovered ? 'text-red-600' : 'text-gray-700'}
                  `}>
                    {cityName}
                  </span>

                  {/* Hover Effect Overlay */}
                  <div className={`
                    absolute inset-0 rounded-lg
                    bg-gradient-to-br from-red-500/10 to-transparent
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                  `} />
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

