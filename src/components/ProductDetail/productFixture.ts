import type { Product } from '@/types/product';

export const galaxy: Product = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  description: 'Samsung flagship with a 6.8 inch screen.',
  basePrice: 1329,
  rating: 4.6,
  specs: {
    screen: '6.8" Dynamic AMOLED 2X',
    resolution: '3120 x 1440 pixels',
    processor: 'Snapdragon 8 Gen 3',
    mainCamera: '200 MP',
    selfieCamera: '12 MP',
    battery: '5000 mAh',
    os: 'Android 14',
    screenRefreshRate: '120 Hz',
  },
  colorOptions: [
    {
      name: 'Titanium Violet',
      hexCode: '#8E6F96',
      imageUrl: '/api/images/SMG-S24U-titanium-violet.webp',
    },
    {
      name: 'Titanium Black',
      hexCode: '#000000',
      imageUrl: '/api/images/SMG-S24U-titanium-black.webp',
    },
  ],
  storageOptions: [
    { capacity: '256 GB', price: 1229 },
    { capacity: '512 GB', price: 1329 },
  ],
  similarProducts: [
    {
      id: 'GPX-8A',
      brand: 'Google',
      name: 'Pixel 8a',
      basePrice: 459,
      imageUrl: '/api/images/GPX-8A-obsidiana.webp',
    },
  ],
};
