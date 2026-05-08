import type { Product } from '../schemas/commerce.js';

export const EXAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Eco‑Friendly Water Bottle',
    subtitle: 'Stay hydrated sustainably',
    imageUrl: 'https://example.com/images/water-bottle.jpg',
    price: '$19.99',
    badge: 'Best Seller',
    rating: 4.7
  },
  {
    id: 'prod-2',
    title: 'Wireless Noise‑Cancelling Headphones',
    subtitle: 'Immersive sound for music lovers',
    imageUrl: 'https://example.com/images/headphones.jpg',
    price: '$199.99',
    badge: 'Premium',
    rating: 4.9
  },
  {
    id: 'prod-3',
    title: 'Organic Cotton T‑Shirt',
    subtitle: 'Soft and sustainable fashion',
    imageUrl: 'https://example.com/images/tshirt.jpg',
    price: '$29.99',
    badge: 'Eco',
    rating: 4.3
  }
];
