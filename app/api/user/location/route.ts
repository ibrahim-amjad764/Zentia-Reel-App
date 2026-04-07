// app/api/user/location/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "../../../../src/db/data-source";
import { User } from "../../../../src/entities/user";
import { getCurrentUser } from "../../../../src/lib/auth";
import { initDB } from "../../../../src/db/init-db";

/**
 * Handle POST requests to update user geolocation
 * @param req NextRequest
 * @returns NextResponse
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[Location API] Received request to update location");
    
    // 1. Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
      console.warn("[Location API] Unauthorized access attempt");
      return NextResponse.json({ error: "Access denied. Please sign in." }, { status: 401 });
    }

    // 2. Parse and validate payload
    const body = await req.json();
    const { lat, lng, city, country } = body;

    console.log(`[Location API] Payload: lat=${lat}, lng=${lng}, city=${city}, country=${country}`);

    // Production-ready validation
    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "GPS coordinates (lat/lng) are required." }, { status: 400 });
    }

    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      return NextResponse.json({ error: "Invalid latitude range (-90 to 90)." }, { status: 400 });
    }

    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Invalid longitude range (-180 to 180)." }, { status: 400 });
    }

    if (!city || typeof city !== 'string') {
      return NextResponse.json({ error: "Valid city name is required." }, { status: 400 });
    }

    if (!country || typeof country !== 'string') {
      return NextResponse.json({ error: "Valid country name is required." }, { status: 400 });
    }

    // 3. Initialize Database
    await initDB();
    if (!AppDataSource?.isInitialized) {
      await AppDataSource!.initialize();
    }

    // 4. Update user profile
    const userRepo = AppDataSource!.getRepository(User);
    
    // We update the existing fields and the new geolocation fields
    await userRepo.update(user.id, {
      lat: lat,
      lng: lng,
      city: city,
      country: country,
      location: `${city}, ${country}` // Sync the old descriptive field
    });

    console.log(`[Location API] Successfully updated user ${user.id} to ${city}, ${country}`);

    return NextResponse.json({ 
      success: true, 
      message: "Satellite lock confirmed. Profile location updated.",
      data: { lat, lng, city, country }
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Location API] Critical Error:", error);
    return NextResponse.json({ 
      error: "Internal failure while updating localization.",
      details: error.message 
    }, { status: 500 });
  }
}
