import { useEffect, useRef } from "react";
import { MapView } from "@/components/Map";
import { Kiosk } from "@/lib/kiosks";

interface KioskMapProps {
  kiosks: Kiosk[];
  selectedKiosk: Kiosk | null;
}

interface MarkerWithInfo extends google.maps.marker.AdvancedMarkerElement {
  infoWindow?: google.maps.InfoWindow;
}

export default function KioskMap({ kiosks, selectedKiosk }: KioskMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MarkerWithInfo[]>([]);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Set initial center to Jeddah
    map.setCenter({ lat: 21.5433, lng: 39.1726 });
    map.setZoom(12);

    // Add markers for all kiosks
    addMarkers(map, kiosks);
  };

  const addMarkers = async (map: google.maps.Map, kioskList: Kiosk[]) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Wait for marker library to be available
    if (!window.google?.maps?.marker) {
      setTimeout(() => addMarkers(map, kioskList), 100);
      return;
    }

    // Add new markers
    kioskList.forEach((kiosk) => {
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: kiosk.latitude, lng: kiosk.longitude },
        title: kiosk.name,
      }) as MarkerWithInfo;

      // Create info window content
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${kiosk.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${kiosk.location}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #9ca3af;">${kiosk.address}</p>
            <div style="margin: 8px 0; padding: 8px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
              <p style="margin: 4px 0; font-size: 13px; color: #6b7280;">
                <strong>Hours:</strong> ${kiosk.hours[0]?.open} - ${kiosk.hours[0]?.close}
              </p>
              <p style="margin: 4px 0; font-size: 13px; color: #6b7280;">
                <strong>Distance:</strong> ${kiosk.distance?.toFixed(1)} km
              </p>
            </div>
            <a href="/station/${kiosk.id}" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background-color: #06b6d4; color: white; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">
              View Details
            </a>
          </div>
        `,
      });

      marker.addListener("click", () => {
        // Close all other info windows
        markersRef.current.forEach((m) => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        infoWindow.open({
          anchor: marker,
          map,
        });
      });

      // Attach info window to marker for later reference
      marker.infoWindow = infoWindow;

      markersRef.current.push(marker);
    });
  };

  // Update markers when kiosks change
  useEffect(() => {
    if (mapRef.current) {
      addMarkers(mapRef.current, kiosks);
    }
  }, [kiosks]);

  // Pan to selected kiosk
  useEffect(() => {
    if (selectedKiosk && mapRef.current) {
      mapRef.current.panTo({ lat: selectedKiosk.latitude, lng: selectedKiosk.longitude });
      mapRef.current.setZoom(14);

      // Open info window for selected marker
      const marker = markersRef.current.find((m) => {
        const pos = m.position as any;
        return Math.abs(pos.lat - selectedKiosk.latitude) < 0.0001 && Math.abs(pos.lng - selectedKiosk.longitude) < 0.0001;
      });

      if (marker && marker.infoWindow) {
        marker.infoWindow.open({
          anchor: marker,
          map: mapRef.current,
        });
      }
    }
  }, [selectedKiosk]);

  return <MapView onMapReady={handleMapReady} className="w-full h-full" />;
}
