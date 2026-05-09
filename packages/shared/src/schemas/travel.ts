import { z } from 'zod';

export const hotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  country: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  pricePerNight: z.string(),
  imageUrl: z.string().url().optional(),
  amenities: z.array(z.string()).optional()
});

export type Hotel = z.infer<typeof hotelSchema>;

export const flightLegSchema = z.object({
  airline: z.string(),
  flightNumber: z.string(),
  origin: z.string(),
  destination: z.string(),
  departsAt: z.string(),
  arrivesAt: z.string(),
  durationMinutes: z.number().optional()
});

export type FlightLeg = z.infer<typeof flightLegSchema>;

export const flightSummarySchema = z.object({
  id: z.string(),
  outbound: flightLegSchema,
  return: flightLegSchema.optional(),
  price: z.string(),
  bookingClass: z.string().optional(),
  stops: z.number().int().min(0).optional()
});

export type FlightSummary = z.infer<typeof flightSummarySchema>;

export const itineraryStopSchema = z.object({
  id: z.string(),
  title: z.string(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  kind: z.enum(['flight', 'hotel', 'activity', 'transfer']).optional()
});

export type ItineraryStop = z.infer<typeof itineraryStopSchema>;

export const itinerarySchema = z.object({
  id: z.string(),
  title: z.string(),
  stops: z.array(itineraryStopSchema)
});

export type Itinerary = z.infer<typeof itinerarySchema>;

export const destinationSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string().optional(),
  imageUrl: z.string().url().optional(),
  tagline: z.string().optional(),
  bestSeason: z.string().optional(),
  averagePrice: z.string().optional()
});

export type Destination = z.infer<typeof destinationSchema>;
