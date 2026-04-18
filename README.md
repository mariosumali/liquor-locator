# Liquor Locator 🥃

A web app that finds the nearest liquor store to your location and displays a compass pointing towards it with real-time distance tracking.

## Features

- **Real-time Compass**: Animated compass that points toward the nearest liquor store
- **Distance Tracker**: Live distance updates as you move (in feet/miles)
- **Store Information**: Name, address, rating, and open/closed status
- **Open in Maps**: One-tap navigation to your preferred maps app
- **Mobile-first Design**: Optimized for smartphones with dark theme

## Setup

### Prerequisites

- Node.js 18+
- A Google Cloud account with Places API enabled

### Get a Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API (New)** in APIs & Services
4. Create credentials → API Key
5. (Recommended) Restrict the API key to your domain

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API key to .env
# VITE_GOOGLE_PLACES_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS v4** for styling
- **Google Places API** for store search
- Browser Geolocation & DeviceOrientation APIs

## How It Works

1. The app requests your location permission
2. Your coordinates are sent to Google Places API to find nearby liquor stores
3. The compass calculates the bearing from you to the store
4. On mobile devices with a compass, the needle adjusts based on your phone's orientation
5. Distance updates in real-time as you move

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Compass orientation works best on mobile devices
- iOS Safari requires a user gesture to enable compass (handled automatically)

## Privacy

Your location is only used client-side to find nearby stores and calculate directions. No location data is stored or sent to any server other than Google Places API.
