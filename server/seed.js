import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { HotelModel } from './models/Hotel.js';

dotenv.config();

// Ensure DNS SRV lookup uses public DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const LITEAPI_KEY = process.env.VITE_LITEAPI_KEY || 'sand_3a7fba9d-0928-4cc4-a8c0-c3322344b63e';
const LITEAPI_BASE = 'https://api.liteapi.travel/v3.0';

// Strip HTML tags and decode HTML entities from descriptions
function cleanHtmlDescription(html) {
  if (!html) return '';

  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ');

  text = text.replace(/<[^>]+>/g, '');

  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  text = text.replace(/&[a-z0-9#]+;/gi, (match) => {
    const lower = match.toLowerCase();
    if (entities[lower]) return entities[lower];
    if (lower.startsWith('&#x')) {
      const code = parseInt(lower.slice(3, -1), 16);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    }
    if (lower.startsWith('&#')) {
      const code = parseInt(lower.slice(2, -1), 10);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    }
    return match;
  });

  const paragraphs = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return paragraphs.join('\n\n');
}

// Map raw LiteAPI object to Hotel schema
function mapLiteApiToHotel(raw, index, targetCity) {
  const getRating = () => {
    if (raw.reviewScore) return parseFloat(raw.reviewScore.toFixed(1));
    const stars = raw.stars || raw.starRating || 4;
    return parseFloat(Math.min(5.0, 3.0 + stars * 0.4).toFixed(1));
  };

  const getPrice = () => {
    if (raw.startingFrom && raw.startingFrom.amount) {
      return Math.round(raw.startingFrom.amount);
    }
    const stars = raw.stars || raw.starRating || 4;
    return 100 + stars * 40 + (index % 5) * 15;
  };

  const getType = () => {
    const stars = raw.stars || raw.starRating || 4;
    if (stars >= 5) return 'Luxury';
    if (stars === 4) return 'Deluxe';
    if (stars === 3) return 'Business';
    return 'Hotel';
  };

  const fallbackImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  ];

  const image = raw.main_photo || raw.thumbnail || fallbackImages[index % fallbackImages.length];

  return {
    id: index + 1,
    name: raw.name || 'Boutique Hotel',
    city: targetCity.city,
    country: targetCity.countryCode,
    address: raw.address || (raw.address && raw.address.line1) || `${targetCity.city} City Center`,
    price: getPrice(),
    rating: getRating(),
    description: cleanHtmlDescription(
      raw.hotelDescription ||
        raw.description ||
        `Experience comfort and world-class service at ${raw.name || 'this hotel'} in ${targetCity.city}.`
    ),
    image: image,
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Room Service'],
    rooms: raw.rooms || 120,
    type: getType(),
  };
}

// Extended list of 34 global destinations across 18 countries
const TARGET_CITIES = [
  // USA
  { city: 'New York', countryCode: 'US' },
  { city: 'Los Angeles', countryCode: 'US' },
  { city: 'Chicago', countryCode: 'US' },
  { city: 'Miami', countryCode: 'US' },
  { city: 'San Francisco', countryCode: 'US' },
  { city: 'Las Vegas', countryCode: 'US' },
  { city: 'Boston', countryCode: 'US' },
  { city: 'Seattle', countryCode: 'US' },
  { city: 'Denver', countryCode: 'US' },
  { city: 'Orlando', countryCode: 'US' },
  // Pakistan
  { city: 'Lahore', countryCode: 'PK' },
  { city: 'Karachi', countryCode: 'PK' },
  { city: 'Islamabad', countryCode: 'PK' },
  // Middle East
  { city: 'Dubai', countryCode: 'AE' },
  { city: 'Abu Dhabi', countryCode: 'AE' },
  { city: 'Riyadh', countryCode: 'SA' },
  // Europe
  { city: 'London', countryCode: 'GB' },
  { city: 'Paris', countryCode: 'FR' },
  { city: 'Rome', countryCode: 'IT' },
  { city: 'Barcelona', countryCode: 'ES' },
  { city: 'Amsterdam', countryCode: 'NL' },
  { city: 'Berlin', countryCode: 'DE' },
  { city: 'Madrid', countryCode: 'ES' },
  { city: 'Prague', countryCode: 'CZ' },
  { city: 'Vienna', countryCode: 'AT' },
  // Asia & Australia
  { city: 'Tokyo', countryCode: 'JP' },
  { city: 'Singapore', countryCode: 'SG' },
  { city: 'Bangkok', countryCode: 'TH' },
  { city: 'Sydney', countryCode: 'AU' },
  { city: 'Istanbul', countryCode: 'TR' },
  { city: 'Seoul', countryCode: 'KR' },
  { city: 'Kuala Lumpur', countryCode: 'MY' },
  // Canada
  { city: 'Toronto', countryCode: 'CA' },
  { city: 'Vancouver', countryCode: 'CA' },
];

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is missing in environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    console.log(`Starting expanded LiteAPI migration across ${TARGET_CITIES.length} global cities...`);
    const allFetchedHotels = [];
    let successCount = 0;
    let failCount = 0;

    for (const item of TARGET_CITIES) {
      try {
        const url = `${LITEAPI_BASE}/data/hotels?countryCode=${item.countryCode}&cityName=${encodeURIComponent(
          item.city
        )}&limit=50`;

        const res = await fetch(url, {
          headers: {
            'X-API-Key': LITEAPI_KEY,
            Accept: 'application/json',
          },
        });

        if (res.ok) {
          const json = await res.json();
          const rawList = json.data || [];
          console.log(`📡 [${item.countryCode}] ${item.city}: Received ${rawList.length} hotels`);
          rawList.forEach((raw) => {
            allFetchedHotels.push({ raw, cityInfo: item });
          });
          successCount++;
        } else {
          console.warn(`⚠️ [${item.countryCode}] ${item.city}: LiteAPI returned status ${res.status}`);
          failCount++;
        }
      } catch (err) {
        console.warn(`⚠️ [${item.countryCode}] ${item.city}: Fetch error - ${err.message}`);
        failCount++;
      }

      // 200ms rate limit delay buffer between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`\nTransforming ${allFetchedHotels.length} raw LiteAPI hotel records...`);
    const hotelsToSeed = allFetchedHotels.map((item, idx) =>
      mapLiteApiToHotel(item.raw, idx, item.cityInfo)
    );

    console.log('Clearing existing hotel collection in MongoDB Atlas...');
    await HotelModel.deleteMany({});

    console.log(`Bulk inserting ${hotelsToSeed.length} LiteAPI hotels into MongoDB Atlas...`);
    const inserted = await HotelModel.insertMany(hotelsToSeed);

    console.log(`\n============================================================`);
    console.log(`🎉 MIGRATION COMPLETE!`);
    console.log(`Total hotels inserted: ${inserted.length}`);
    console.log(`Total cities successfully queried: ${successCount} / ${TARGET_CITIES.length}`);
    console.log(`Failed city requests: ${failCount}`);
    console.log(`============================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
