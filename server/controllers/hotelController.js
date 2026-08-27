import { HotelModel } from '../models/Hotel.js';

// Fallback seed data in case MongoDB is empty or connecting for the first time
const MOCK_HOTELS = [
  {
    id: 1,
    name: 'Grand Luxury Hotel',
    city: 'New York',
    country: 'USA',
    address: '123 Park Avenue, Manhattan',
    price: 250,
    rating: 4.7,
    description:
      'Experience luxury in the heart of Manhattan. Our hotel offers world-class amenities, stunning city views, and exceptional service. Perfect for business travelers and tourists alike.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Room Service'],
    rooms: 150,
    type: 'Luxury',
  },
  {
    id: 2,
    name: 'Seaside Resort & Spa',
    city: 'Miami',
    country: 'USA',
    address: '456 Ocean Drive, South Beach',
    price: 180,
    rating: 4.5,
    description:
      'Relax by the ocean at our beautiful beachfront resort. Enjoy pristine beaches, world-class spa treatments, and exquisite dining experiences with ocean views.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Restaurant', 'Water Sports'],
    rooms: 200,
    type: 'Resort',
  },
  {
    id: 3,
    name: 'Downtown Business Hotel',
    city: 'Chicago',
    country: 'USA',
    address: '789 Michigan Avenue',
    price: 150,
    rating: 4.3,
    description:
      'Ideal for business travelers, located in the financial district with easy access to major corporate offices and convention centers.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    amenities: ['WiFi', 'Business Center', 'Gym', 'Conference Rooms', 'Restaurant'],
    rooms: 120,
    type: 'Business',
  },
  {
    id: 4,
    name: 'Mountain View Lodge',
    city: 'Denver',
    country: 'USA',
    address: '321 Mountain Road',
    price: 120,
    rating: 4.6,
    description:
      'Escape to nature with breathtaking mountain views. Perfect for outdoor enthusiasts with easy access to hiking trails and skiing.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    amenities: ['WiFi', 'Fireplace', 'Mountain Views', 'Hiking Access', 'Restaurant'],
    rooms: 80,
    type: 'Lodge',
  },
  {
    id: 5,
    name: 'Historic Boutique Inn',
    city: 'Boston',
    country: 'USA',
    address: '555 Beacon Street',
    price: 200,
    rating: 4.8,
    description:
      'Stay in a beautifully restored historic building with modern comforts. Each room is uniquely designed, blending classic elegance with contemporary amenities.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    amenities: ['WiFi', 'Historic Building', 'Restaurant', 'Bar', 'Concierge'],
    rooms: 45,
    type: 'Boutique',
  },
  {
    id: 6,
    name: 'Coastal Paradise Hotel',
    city: 'San Diego',
    country: 'USA',
    address: '888 Pacific Coast Highway',
    price: 190,
    rating: 4.6,
    description:
      'Discover paradise on the California coast with stunning ocean views, direct beach access, and exceptional dining with fresh local seafood.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Gym', 'Surfboard Rental'],
    rooms: 180,
    type: 'Resort',
  },
];

// Helper to query hotel by id (numeric, string, or ObjectId)
const findHotelQuery = (id) => {
  const isNumber = !isNaN(Number(id));
  const queries = [];
  if (isNumber) {
    queries.push({ id: Number(id) });
  }
  queries.push({ id: String(id) });
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    queries.push({ _id: id });
  }
  return { $or: queries };
};

// GET /api/hotels
export const getHotels = async (req, res) => {
  try {
    const { city } = req.query;
    let filter = {};

    if (city && city.trim() !== '') {
      filter.city = { $regex: city.trim(), $options: 'i' };
    }

    let hotels = await HotelModel.find(filter).sort({ createdAt: -1 });

    // Fallback if database has no records yet
    if (hotels.length === 0 && (!city || city.trim() === '')) {
      hotels = MOCK_HOTELS;
    } else if (hotels.length === 0 && city) {
      // If city search in DB returns 0, search mock data for seamless demo
      const mockFiltered = MOCK_HOTELS.filter((h) =>
        h.city.toLowerCase().includes(city.toLowerCase())
      );
      if (mockFiltered.length > 0) {
        hotels = mockFiltered;
      }
    }

    return res.status(200).json({
      status: 'success',
      results: hotels.length,
      data: hotels,
    });
  } catch (error) {
    console.error('Error in getHotels:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch hotels',
      error: error.message,
    });
  }
};

// GET /api/hotels/:id
export const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    let hotel = await HotelModel.findOne(findHotelQuery(id));

    if (!hotel) {
      // Check fallback mock data
      const mockMatch = MOCK_HOTELS.find((h) => String(h.id) === String(id));
      if (mockMatch) {
        return res.status(200).json({
          status: 'success',
          data: mockMatch,
        });
      }
      return res.status(404).json({
        status: 'fail',
        message: `Hotel with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: hotel,
    });
  } catch (error) {
    console.error('Error in getHotelById:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch hotel details',
      error: error.message,
    });
  }
};

// POST /api/hotels
export const createHotel = async (req, res) => {
  try {
    const { name, city, country, address, price, rating, description, image, images, amenities, rooms, type } = req.body;

    if (!name || !city || !country || !address || price === undefined || !description || !image) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields (name, city, country, address, price, description, image)',
      });
    }

    // Auto-assign custom numeric id if not specified
    const nextId = Date.now();

    const newHotel = await HotelModel.create({
      id: req.body.id || nextId,
      name,
      city,
      country,
      address,
      price: Number(price),
      rating: rating ? Number(rating) : 4.5,
      description,
      image,
      images: Array.isArray(images) ? images : [image],
      amenities: Array.isArray(amenities)
        ? amenities
        : typeof amenities === 'string'
        ? amenities.split(',').map((a) => a.trim())
        : ['WiFi', 'Air Conditioning'],
      rooms: rooms ? Number(rooms) : 50,
      type: type || 'Luxury',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Hotel created successfully',
      data: newHotel,
    });
  } catch (error) {
    console.error('Error in createHotel:', error);
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Could not create hotel',
    });
  }
};

// PUT /api/hotels/:id
export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedHotel = await HotelModel.findOneAndUpdate(
      findHotelQuery(id),
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({
        status: 'fail',
        message: `Hotel with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Hotel updated successfully',
      data: updatedHotel,
    });
  } catch (error) {
    console.error('Error in updateHotel:', error);
    return res.status(400).json({
      status: 'fail',
      message: error.message || 'Could not update hotel',
    });
  }
};

// DELETE /api/hotels/:id
export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedHotel = await HotelModel.findOneAndDelete(findHotelQuery(id));

    if (!deletedHotel) {
      return res.status(404).json({
        status: 'fail',
        message: `Hotel with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Hotel deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error in deleteHotel:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Could not delete hotel',
      error: error.message,
    });
  }
};
