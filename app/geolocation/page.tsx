'use client';

import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { NextRequest } from 'next/server';
import { Button } from '../../components/ui/button';

export default function GeolocationPage() {
  // State management for location data and UI states
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLocation, setSavedLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    city?: string | null;
    country?: string | null;
    timestamp: string | null;
  }>({ latitude: null, longitude: null, city: null, country: null, timestamp: null });

  const getCurrentLocation = async () => {
    console.log('[GeolocationPage] Starting location request...');
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      console.error('[GeolocationPage]', errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        console.log('[GeolocationPage] Position acquired:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });

        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        // Save to database immediately
        await saveLocationToDatabase(latitude, longitude);
        setLoading(false);
      },

      // Error callback
      (error) => {
        console.error('[GeolocationPage] Geolocation error:', error);
        let errorMessage = 'Unable to retrieve location';

        // User-friendly error messages
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setError(errorMessage);
        setLoading(false);
      },

      {
        enableHighAccuracy: true, //exact location
        timeout: 10000, 
        maximumAge: 0 //Refresh loction every time 
      }
    );
  };

  const saveLocationToDatabase = async (latitude: number, longitude: number) => {
    console.log('[GeolocationPage] Saving to database:', { latitude, longitude });
    try {
      // Call user location API with geocoding
      const response = await fetch('/api/user/location', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          latitude, 
          longitude, 
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Database save failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('[GeolocationPage] Database save successful:', result);
      
      setSavedLocation({ 
        latitude, 
        longitude, 
        city: result.location?.city,
        country: result.location?.country,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Location save error:', error);
      setError('Failed to save location to database');
    }
  };

  useEffect(() => {
    const loadSavedLocation = async () => {
      console.log('[GeolocationPage] Page saved location...');
      try {
        const response = await fetch('/api/user/location');
        if (response.ok) {
          const data = await response.json();
          if (data.latitude && data.longitude) {
            console.log('[GeolocationPage] Saved location loaded:', data);
            setSavedLocation(data);
          }
        }
      } catch (error) {
        console.log('[GeolocationPage] No saved location found');
      }
    }
    loadSavedLocation();
  }, []);
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Current Location Card */}
      <Card className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-white/20 dark:border-zinc-700">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Current Location
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your real-time coordinates
              </p>
            </div>

            {location.latitude && location.longitude ? (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Latitude:
                    </span>
                    <span className="text-sm font-mono font-bold text-[#FF7E5F]">
                      {location.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Longitude:
                    </span>
                    <span className="text-sm font-mono font-bold text-[#FF7E5F]">
                      {location.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-8 text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500">No location data yet</p>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={getCurrentLocation}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#FF7E5F] to-[#FEB47B] text-white font-bold rounded-xl hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Getting Location...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>Get Current Location</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Location Card */}
      <Card className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-white/20 dark:border-zinc-700">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Saved Location
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Location stored in database
              </p>
            </div>

            {savedLocation.latitude && savedLocation.longitude ? (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Latitude:
                    </span>
                    <span className="text-sm font-mono font-bold text-green-600 dark:text-green-400">
                      {savedLocation.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Longitude:
                    </span>
                    <span className="text-sm font-mono font-bold text-green-600 dark:text-green-400">
                      {savedLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  {savedLocation.timestamp && (
                    <div className="pt-2 border-t border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Saved: {new Date(savedLocation.timestamp).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500">?</span>
                </div>
                <p className="text-sm text-gray-500">No saved location in database</p>
              </div>
            )}

            {/* Success Indicator */}
            {savedLocation.latitude && !loading && !error && (
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle size={16} />
                <span>Location saved successfully</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Error Display */}
      {
        error && (
          <Card className="mt-8 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                <AlertCircle size={20} />
                <div>
                  <h3 className="font-semibold">Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }
    </div>
  );
}
