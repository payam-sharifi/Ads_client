/**
 * City images mapping
 * Maps city names to their representative images/icons
 */
export const getCityImage = (cityName: string): string => {
  const name = cityName.toLowerCase();
  
  // Map German cities to their representative images
  const cityImageMap: Record<string, string> = {
    'berlin': '🏛️', // Brandenburg Gate
    'münchen': '🍺', // Beer/Munich
    'munich': '🍺',
    'hamburg': '⚓', // Port/Harbor
    'köln': '⛪', // Cologne Cathedral
    'cologne': '⛪',
    'frankfurt': '🏦', // Financial center
    'stuttgart': '🚗', // Mercedes/Porsche
    'düsseldorf': '🎨', // Art/Culture
    'dortmund': '⚽', // Football
    'برلین': '🏛️',
    'مونیخ': '🍺',
    'هامبورگ': '⚓',
    'کلن': '⛪',
    'فرانکفورت': '🏦',
    'اشتوتگارت': '🚗',
    'دوسلدورف': '🎨',
    'دورتموند': '⚽',
  };

  // Try exact match first
  if (cityImageMap[name]) {
    return cityImageMap[name];
  }

  // Try partial match
  for (const [key, emoji] of Object.entries(cityImageMap)) {
    if (name.includes(key) || key.includes(name)) {
      return emoji;
    }
  }

  // Default city icon
  return '🏙️';
};

