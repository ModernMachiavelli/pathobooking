// src/components/doctors-map.tsx
'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type DoctorForMap = {
  id: string;
  fullName: string;
  lat: number | null;
  lng: number | null;
  city: string;
  region: string;
  specialization: string;
};

interface DoctorsMapProps {
  doctors: DoctorForMap[];
}

export function DoctorsMap({ doctors }: DoctorsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // вже ініціалізовано

    // Центр України
    const initialCenter: [number, number] = [31.1656, 48.3794];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style:
        // TODO: постав свій ключ MapTiler або інший стиль
        'https://api.maptiler.com/maps/streets/style.json?key=YOUR_MAPTILER_KEY',
      center: initialCenter,
      zoom: 5,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Додаємо маркери, коли є карта і лікарі
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // При кожній зміні списку лікарів прибираємо старі маркери
    // Хак: зберігати маркери в window, щоб мати до них доступ
    const w = window as any;
    if (!w.__doctorMarkers) {
      w.__doctorMarkers = [];
    } else {
      w.__doctorMarkers.forEach((m: maplibregl.Marker) => m.remove());
      w.__doctorMarkers = [];
    }

    const validDoctors = doctors.filter(
      (d) => typeof d.lat === 'number' && typeof d.lng === 'number'
    ) as (DoctorForMap & { lat: number; lng: number })[];

    validDoctors.forEach((doc) => {
      const el = document.createElement('div');
      el.className =
        'rounded-full bg-red-600 border-2 border-white w-4 h-4 shadow';

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([doc.lng, doc.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 16 }).setHTML(`
            <div style="font-size: 14px; line-height: 1.3;">
              <strong>${doc.fullName}</strong><br/>
              <span>${doc.specialization}</span><br/>
              <span>${doc.city}, ${doc.region}</span>
            </div>
          `)
        )
        .addTo(map);

      w.__doctorMarkers.push(marker);
    });

    // Якщо є хоча б 1 лікар з координатами — піджимаємо карту під їх bbox
    if (validDoctors.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      validDoctors.forEach((doc) => {
        bounds.extend([doc.lng, doc.lat]);
      });
      map.fitBounds(bounds, { padding: 40, maxZoom: 10, duration: 800 });
    }
  }, [doctors]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
