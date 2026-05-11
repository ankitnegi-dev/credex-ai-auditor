import type { PricingCatalog } from './types';

export const PRICING_CATALOG: PricingCatalog = {
  "ChatGPT": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Plus",       pricePerSeat: 20,    minSeats: 1 },
      { name: "Team",       pricePerSeat: 25,    minSeats: 2 },
      { name: "Enterprise", pricePerSeat: 60,    minSeats: 150 },
    ]
  },
  "Claude": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 20,    minSeats: 1 },
      { name: "Team",       pricePerSeat: 30,    minSeats: 5 },
      { name: "Enterprise", pricePerSeat: 50,    minSeats: 25 },
    ]
  },
  "Cursor": {
    plans: [
      { name: "Hobby",      pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 20,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 40,    minSeats: 1 },
    ]
  },
  "GitHub Copilot": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 10,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 19,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 39,    minSeats: 1 },
    ]
  },
  "Midjourney": {
    plans: [
      { name: "Basic",      pricePerSeat: 10,    minSeats: 1 },
      { name: "Standard",   pricePerSeat: 30,    minSeats: 1 },
      { name: "Pro",        pricePerSeat: 60,    minSeats: 1 },
      { name: "Mega",       pricePerSeat: 120,   minSeats: 1 },
    ]
  },
  "Gemini": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Advanced",   pricePerSeat: 19.99, minSeats: 1 },
      { name: "Business",   pricePerSeat: 24,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 30,    minSeats: 1 },
    ]
  },
  "Perplexity": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 20,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 40,    minSeats: 5 },
    ]
  },
  "Notion AI": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Plus",       pricePerSeat: 10,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 15,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 20,    minSeats: 100 },
    ]
  },
  "Grammarly": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Premium",    pricePerSeat: 12,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 15,    minSeats: 3 },
      { name: "Enterprise", pricePerSeat: 25,    minSeats: 10 },
    ]
  },
  "Jasper": {
    plans: [
      { name: "Creator",    pricePerSeat: 39,    minSeats: 1 },
      { name: "Pro",        pricePerSeat: 59,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 99,    minSeats: 1 },
    ]
  },
  "Copy.ai": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 36,    minSeats: 1 },
      { name: "Team",       pricePerSeat: 186,   minSeats: 5 },
      { name: "Enterprise", pricePerSeat: 300,   minSeats: 10 },
    ]
  },
  "Runway": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Standard",   pricePerSeat: 12,    minSeats: 1 },
      { name: "Pro",        pricePerSeat: 28,    minSeats: 1 },
      { name: "Unlimited",  pricePerSeat: 76,    minSeats: 1 },
    ]
  },
  "ElevenLabs": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Starter",    pricePerSeat: 5,     minSeats: 1 },
      { name: "Creator",    pricePerSeat: 22,    minSeats: 1 },
      { name: "Pro",        pricePerSeat: 99,    minSeats: 1 },
    ]
  },
  "Synthesia": {
    plans: [
      { name: "Starter",    pricePerSeat: 18,    minSeats: 1 },
      { name: "Creator",    pricePerSeat: 64,    minSeats: 1 },
      { name: "Enterprise", pricePerSeat: 150,   minSeats: 3 },
    ]
  },
  "Otter.ai": {
    plans: [
      { name: "Free",       pricePerSeat: 0,     minSeats: 1 },
      { name: "Pro",        pricePerSeat: 10,    minSeats: 1 },
      { name: "Business",   pricePerSeat: 20,    minSeats: 3 },
      { name: "Enterprise", pricePerSeat: 30,    minSeats: 10 },
    ]
  },
} as const;
