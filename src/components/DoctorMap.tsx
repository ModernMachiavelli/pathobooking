"use client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL!;

const MOCK_DOCTORS = [
  { id: "1", name: "д-р Іваненко", lat: 50.45, lng: 30.52, city: "Київ", tags: ["breast","he"] },
  { id: "2", name: "д-р Коваль",   lat: 49.84, lng: 24.03, city: "Львів", tags: ["gi","ihc"] },
  { id: "3", name: "д-р Шевченко", lat: 46.48, lng: 30.72, city: "Одеса", tags: ["derm","biopsy"] },
];

export default function DoctorMap() {
  const mapRef = useRef<maplibregl.Map|null>(null);
  const divRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    if (mapRef.current || !divRef.current) return;
    const map = new maplibregl.Map({
      container: divRef.current,
      style: styleUrl,
      center: [31.1656, 48.3794],
      zoom: 5
    });

    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');

    map.on("load", () => {
      const features = MOCK_DOCTORS.map(d => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [d.lng, d.lat] },
        properties: { id: d.id, name: d.name, city: d.city, tags: d.tags.join(", ") }
      }));

      map.addSource("doctors", { type: "geojson", data: { type: "FeatureCollection", features } });
      map.addLayer({
        id: "doctor-points",
        type: "circle",
        source: "doctors",
        paint: { "circle-radius": 6, "circle-stroke-width": 1, "circle-stroke-color": "#111", "circle-color": "#2dd4bf" }
      });

      const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: true });
      map.on("click", "doctor-points", (e) => {
        const f = e.features?.[0];
        const p = f?.properties as any;
        const [x,y] = (f!.geometry as any).coordinates;
        popup.setLngLat([x,y]).setHTML(`<strong>${p.name}</strong><br/>${p.city}<br/><small>${p.tags}</small>`).addTo(map);
      });

      map.on("mouseenter", "doctor-points", () => map.getCanvas().style.cursor = "pointer");
      map.on("mouseleave", "doctor-points", () => map.getCanvas().style.cursor = "");
    });

    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return <div ref={divRef} className="w-full h-[70dvh] rounded-xl overflow-hidden border"/>;
}
