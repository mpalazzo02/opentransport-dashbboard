import { GoogleMap, Polyline, useJsApiLoader } from '@react-google-maps/api';
import React from 'react';

interface FeaturedJourneyMapProps {
  polyline: string | null;
  center: { lat: number; lng: number };
}

// Utility to decode Google encoded polyline
function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

export const FeaturedJourneyMap: React.FC<FeaturedJourneyMapProps> = ({ polyline, center }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) return <div className="h-[300px] flex items-center justify-center">Loading map...</div>;
  if (!polyline) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No route data</div>;

  const path = decodePolyline(polyline);

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '12px' }}
      center={center}
      zoom={12}
      options={{
        disableDefaultUI: true,
        clickableIcons: false,
        mapTypeControl: false,
      }}
    >
      <Polyline
        path={path}
        options={{ strokeColor: '#007bff', strokeOpacity: 0.8, strokeWeight: 4 }}
      />
    </GoogleMap>
  );
};
