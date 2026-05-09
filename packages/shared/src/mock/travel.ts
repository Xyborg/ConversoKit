import type {
  Destination,
  FlightSummary,
  Hotel,
  Itinerary
} from '../schemas/travel.js';

export const EXAMPLE_HOTELS: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'Casa del Mar',
    city: 'Lisbon',
    country: 'Portugal',
    rating: 4.6,
    pricePerNight: '€185',
    imageUrl: 'https://example.com/images/casa-del-mar.jpg',
    amenities: ['Pool', 'Breakfast', 'Free Wi-Fi']
  },
  {
    id: 'hotel-2',
    name: 'Mountain Lodge Suites',
    city: 'Banff',
    country: 'Canada',
    rating: 4.8,
    pricePerNight: 'CA$320',
    amenities: ['Hot tub', 'Ski-in/out']
  }
];

export const EXAMPLE_FLIGHT: FlightSummary = {
  id: 'flight-1',
  price: '€420',
  bookingClass: 'Economy',
  stops: 0,
  outbound: {
    airline: 'TAP',
    flightNumber: 'TP123',
    origin: 'BER',
    destination: 'LIS',
    departsAt: '2026-07-12T08:30:00Z',
    arrivesAt: '2026-07-12T11:45:00Z',
    durationMinutes: 195
  },
  return: {
    airline: 'TAP',
    flightNumber: 'TP456',
    origin: 'LIS',
    destination: 'BER',
    departsAt: '2026-07-19T14:00:00Z',
    arrivesAt: '2026-07-19T19:30:00Z',
    durationMinutes: 210
  }
};

export const EXAMPLE_ITINERARY: Itinerary = {
  id: 'itin-1',
  title: 'Lisbon long weekend',
  stops: [
    {
      id: 's1',
      title: 'Flight BER → LIS',
      startsAt: '2026-07-12T08:30:00Z',
      endsAt: '2026-07-12T11:45:00Z',
      kind: 'flight'
    },
    {
      id: 's2',
      title: 'Check-in: Casa del Mar',
      startsAt: '2026-07-12T15:00:00Z',
      kind: 'hotel',
      location: 'Lisbon'
    },
    {
      id: 's3',
      title: 'Tram 28 city tour',
      startsAt: '2026-07-13T10:00:00Z',
      endsAt: '2026-07-13T12:00:00Z',
      kind: 'activity'
    },
    {
      id: 's4',
      title: 'Flight LIS → BER',
      startsAt: '2026-07-19T14:00:00Z',
      endsAt: '2026-07-19T19:30:00Z',
      kind: 'flight'
    }
  ]
};

export const EXAMPLE_DESTINATIONS: Destination[] = [
  {
    id: 'dest-1',
    name: 'Lisbon',
    country: 'Portugal',
    tagline: 'Sunshine, pastel buildings, and tram rides.',
    bestSeason: 'Apr–Oct',
    averagePrice: '€'
  },
  {
    id: 'dest-2',
    name: 'Banff',
    country: 'Canada',
    tagline: 'Alpine lakes, hiking, and après-ski.',
    bestSeason: 'Jun–Sep / Dec–Mar',
    averagePrice: 'CA$$'
  },
  {
    id: 'dest-3',
    name: 'Kyoto',
    country: 'Japan',
    tagline: 'Temples, tea ceremonies, and cherry blossom season.',
    bestSeason: 'Mar–May / Oct–Nov',
    averagePrice: '¥¥'
  }
];
