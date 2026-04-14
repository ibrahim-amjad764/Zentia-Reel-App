// app/api/user/location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../src/lib/auth';
import { AppDataSource } from '../../../../src/db/data-source';
import { initDB } from '../../../../src/db/init-db';
import { User } from '../../../../src/entities/user';


// GET /api/user/location - Get current user location
export async function GET(req: NextRequest) {
  console.log("[User Location API] GET request received");
  
  try {
    await initDB();

    // Defensive null check
    if (!AppDataSource) {
      console.error("[User Location API] AppDataSource is null after initDB");
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const userRepo = AppDataSource.getRepository(User);

    // Get authenticated user
    const user = await getCurrentUser(req);
    
    console.log("[User Location API] Fetching location for user:", user?.email);
    
    // Validate user
    if (!user) {
      console.log("[User Location API] No user found");
      return NextResponse.json({
        success: false,
        error: {
          code: 401,
          message: 'User authentication required'
        }
      }, { status: 401 });
    }

    console.log("[User Location API] User location data:", {
      latitude: user.lat,
      longitude: user.lng,
      city: user.location?.city,
      country: user.location?.country
    });

    return NextResponse.json({
      success: true,
      location: {
        latitude: user.lat,
        longitude: user.lng,
        city: user.location?.city,
        country: user.location?.country,
      }
    });

  } catch (err) {
    console.error("[User Location API] GET Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: "Failed to fetch user location", 
      details: errorMessage 
    }, { status: 500 });
  }
}

// POST /api/user/location - Save user location with geocoding
export async function POST(req: NextRequest) {
  console.log("[User Location API] POST request received - Processing Geolocation Update");
  
  try {
    await initDB();

    if (!AppDataSource) {
      console.error("[User Location API] Database source unavailable");
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // 1. Input: Accept latitude and longitude from the user
    const body = await req.json();
    const { latitude, longitude } = body;
    
    console.log("[User Location API] Received Coordinates:", { latitude, longitude });

    if (!latitude || !longitude) {
      console.log("[User Location API] Error: Missing coordinates");
      return NextResponse.json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      }, { status: 400 });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Get authenticated user
    const user = await getCurrentUser(req);
    if (!user) {
      console.log("[User Location API] Unauthorized access attempt");
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Geocoding: Get city and country from Nominatim (OpenStreetMap)
    let city: string | null = null;
    let country: string | null = null;

    try {
      console.log("[User Location API] Initiating reverse geocoding...");
      // Nominatim requires a User-Agent header and we force English for consistent naming
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        { 
          headers: { 
            'User-Agent': 'Zentia-Reel-App/1.0',
            'Accept-Language': 'en' // Ensure results are in English
          } 
        }
      );

      if (response.ok) {
        const data = await response.json();
        const addr = data.address;
        
        // Extract city (can be city, town, village, or suburb in Nominatim)
        city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || null;
        country = addr.country || null;
        
        console.log("[User Location API] Geocoding successful:", { city, country });
      } else {
        console.warn("[User Location API] Geocoding service returned error status:", response.status);
      }
    } catch (geocodeError) {
      // 6. Error handling: If geocoding fails, save lat/lng and set city/country as null
      console.error("[User Location API] Geocoding service failed:", geocodeError);
    }

    // 3. Database: Save latitude, longitude, city, and country in the user’s record
    const userRepo = AppDataSource.getRepository(User);
    
    user.lat = lat;
    user.lng = lng;
    user.city = city;
    user.country = country;

    console.log("[User Location API] Saving record to DB for user:", user.email);
    const savedUser = await userRepo.save(user);

    // 4. API Response: Return latitude, longitude, city, and country
    return NextResponse.json({
      success: true,
      message: 'Location synchronized successfully',
      data: {
        latitude: savedUser.lat,
        longitude: savedUser.lng,
        city: savedUser.city,
        country: savedUser.country
      }
    });

  } catch (err) {
    console.error("[User Location API] Critical POST Error:", err);
    return NextResponse.json({ 
      success: false, 
      message: "Internal sync error", 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
