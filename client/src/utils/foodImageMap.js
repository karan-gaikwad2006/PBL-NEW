const FOOD_IMAGE_MAP = Object.freeze({
  ragi: '/images/foods/ragi.jpg',
  nachni: '/images/foods/ragi.jpg',
  jowar: '/images/foods/jowar.jpg',
  sorghum: '/images/foods/jowar.jpg',
  bajra: '/images/foods/bajra.jpg',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=80',
  wheat: '/images/foods/wheat.jpg',
  gehu: '/images/foods/wheat.jpg',
  chana: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=640&q=80',
  'moong dal': '/images/foods/moong-dal.jpg',
  moong: '/images/foods/moong-dal.jpg',
  'mung dal': '/images/foods/moong-dal.jpg',
  'mixed dal': '/images/foods/mixed-dal.jpg',
  dal: '/images/foods/mixed-dal.jpg',
  pulses: '/images/foods/mixed-dal.jpg',
  peanuts: 'https://images.unsplash.com/photo-1567892737950-30c4db37cd89?auto=format&fit=crop&w=640&q=80',
  jaggery: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=640&q=80',
  'green leafy vegetables': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=640&q=80',
  'seasonal vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=640&q=80',
  'groundnut oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=640&q=80',
  'milk powder': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=640&q=80',
  soya: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=640&q=80',
});

function normalizeFoodName(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[()\-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFoodImageUrl(foodName) {
  const normalized = normalizeFoodName(foodName);
  const exact = FOOD_IMAGE_MAP[normalized];
  if (exact) return exact;
  const matchedKey = Object.keys(FOOD_IMAGE_MAP).find((key) => normalized.includes(key) || key.includes(normalized));
  return matchedKey ? FOOD_IMAGE_MAP[matchedKey] : null;
}

export { FOOD_IMAGE_MAP, getFoodImageUrl, normalizeFoodName };