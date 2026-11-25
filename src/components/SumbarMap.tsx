import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Layers, Map as MapIcon, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { EvacuationZone, Station } from '../types/sda';
import { SUMBAR_DAS_POLYGONS, SUMBAR_RIVER_LINES } from '../data/mockData';
import { SIAGA_META } from './StatusBadge';

type BasemapId = 'hybrid' | 'terrain' | 'esri' | 'dark';

interface SumbarMapProps {
  stations: Station[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  showSatelliteRain?: boolean;
  showSoilMoisture?: boolean;
  evacuationZones?: EvacuationZone[];
  compact?: boolean;
}

const BASEMAP_CONFIG: Record<
  BasemapId,
  { label: string; url: string; attribution: string; subdomains?: string; maxZoom: number; overlayUrl?: string }
> = {
  hybrid: {
    label: 'Google Hybrid',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: '0123',
    attribution: '© Google Hybrid',
    maxZoom: 20,
  },
  terrain: {
    label: 'Google Terrain',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: '0123',
    attribution: '© Google Terrain',
    maxZoom: 18,
  },
  esri: {
    label: 'Satelit Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri World Imagery',
    maxZoom: 19,
  },
  dark: {
    label: 'Dark SCADA',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '© OpenStreetMap & CARTO',
    maxZoom: 19,
  },
};

const SUMBAR_CENTER: [number, number] = [-0.78, 100.52];
const SUMBAR_ZOOM = 9;
const PADANG_CENTER: [number, number] = [-0.942, 100.415];
const PADANG_ZOOM = 12;

export const SumbarMap: React.FC<SumbarMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  showSatelliteRain = false,
  showSoilMoisture = false,
  evacuationZones = [],
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const basemapGroupRef = useRef<L.LayerGroup | null>(null);
  const dasGroupRef = useRef<L.LayerGroup | null>(null);
  const satGroupRef = useRef<L.LayerGroup | null>(null);
  const soilGroupRef = useRef<L.LayerGroup | null>(null);
  const evacGroupRef = useRef<L.LayerGroup | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectStation);
  onSelectRef.current = onSelectStation;

  const [basemap, setBasemap] = useState<BasemapId>('hybrid');
  const [layerDas, setLayerDas] = useState(true);
  const [layerSat, setLayerSat] = useState(showSatelliteRain);
  const [layerSoil, setLayerSoil] = useState(showSoilMoisture);
  const [layerEvac, setLayerEvac] = useState(evacuationZones.length > 0);

  // Initialize Leaflet Map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const initialCenter = evacuationZones.length > 0 ? PADANG_CENTER : SUMBAR_CENTER;
    const initialZoom = evacuationZones.length > 0 ? PADANG_ZOOM : compact ? 8 : SUMBAR_ZOOM;

    const map = L.map(el, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true,
    });

    basemapGroupRef.current = L.layerGroup().addTo(map);
    dasGroupRef.current = L.layerGroup().addTo(map);
    satGroupRef.current = L.layerGroup().addTo(map);
    soilGroupRef.current = L.layerGroup().addTo(map);
    evacGroupRef.current = L.layerGroup().addTo(map);
    markerGroupRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [compact, evacuationZones.length]);

  // Switch Basemap Tile Layer
  useEffect(() => {
    const group = basemapGroupRef.current;
    if (!group) return;
    group.clearLayers();

    const cfg = BASEMAP_CONFIG[basemap];
    const baseTile = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      ...(cfg.subdomains ? { subdomains: cfg.subdomains } : {}),
    });
    baseTile.addTo(group);

    if (cfg.overlayUrl) {
      L.tileLayer(cfg.overlayUrl, { maxZoom: cfg.maxZoom }).addTo(group);
    }
  }, [basemap]);

  // Render DAS Polygons & River Polylines
  useEffect(() => {
    const group = dasGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!layerDas) return;

    for (const das of SUMBAR_DAS_POLYGONS) {
      L.polygon(das.coordinates, {
        color: das.color,
        weight: 1.5,
        opacity: 0.75,
        fillColor: das.color,
        fillOpacity: 0.12,
        dashArray: '4 3',
      })
        .bindTooltip(`<strong>${das.name}</strong><br/>${das.ws}`, {
          sticky: true,
          className: 'leaflet-sda-tooltip',
        })
        .addTo(group);
    }

    for (const riv of SUMBAR_RIVER_LINES) {
      L.polyline(riv.coordinates, {
        color: riv.color,
        weight: 3.2,
        opacity: 0.9,
      })
        .bindTooltip(`<strong>${riv.name}</strong><br/>${riv.das}`, {
          sticky: true,
          className: 'leaflet-sda-tooltip',
        })
        .addTo(group);
    }
  }, [layerDas]);

  // Render Satellite 3x3km Precipitation Overlay
  useEffect(() => {
    const group = satGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!layerSat) return;

    const rainCells: { center: [number, number]; radius: number; color: string; label: string }[] = [
      {
        center: [-0.9162, 100.465],
        radius: 5200,
        color: '#ef4444',
        label: 'Inti Hujan Satelit LEO 3×3 km: 31.2 mm/jam (Kuranji Hulu)',
      },
      {
        center: [-0.948, 100.435],
        radius: 8500,
        color: '#38bdf8',
        label: 'Sebaran Hujan Sedang–Lebat: 18–26 mm/jam (Padang Timur)',
      },
      {
        center: [-0.635, 100.315],
        radius: 6800,
        color: '#f59e0b',
        label: 'Sel Hujan Lembah Anai: 14.5 mm/jam',
      },
    ];

    for (const cell of rainCells) {
      L.circle(cell.center, {
        radius: cell.radius,
        color: cell.color,
        weight: 1,
        opacity: 0.55,
        fillColor: cell.color,
        fillOpacity: 0.24,
      })
        .bindTooltip(cell.label, { className: 'leaflet-sda-tooltip' })
        .addTo(group);
    }
  }, [layerSat]);

  // Render Soil Moisture 100x100m Overlay
  useEffect(() => {
    const group = soilGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!layerSoil) return;

    const soilZones: { bounds: [[number, number], [number, number]]; color: string; label: string }[] = [
      {
        bounds: [
          [-0.938, 100.415],
          [-0.892, 100.495],
        ],
        color: '#dc2626',
        label: 'Soil Moisture 100×100 m: 44.8% VWC (Kritis Jenuh — Kuranji Hulu)',
      },
      {
        bounds: [
          [-0.985, 100.395],
          [-0.945, 100.485],
        ],
        color: '#d97706',
        label: 'Soil Moisture 100×100 m: 42.1% VWC (Kritis Jenuh — Arau Hulu)',
      },
    ];

    for (const sz of soilZones) {
      L.rectangle(sz.bounds, {
        color: sz.color,
        weight: 1.5,
        dashArray: '5 3',
        fillColor: sz.color,
        fillOpacity: 0.22,
      })
        .bindTooltip(sz.label, { className: 'leaflet-sda-tooltip' })
        .addTo(group);
    }
  }, [layerSoil]);

  // Render Evacuation Zones, Routes & Assembly Points
  useEffect(() => {
    const group = evacGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!layerEvac || evacuationZones.length === 0) return;

    for (const ez of evacuationZones) {
      L.circle([ez.lat, ez.lon], {
        radius: 950,
        color: '#fb7185',
        weight: 1.5,
        dashArray: '4 3',
        fillColor: '#f43f5e',
        fillOpacity: 0.24,
      })
        .bindTooltip(
          `<strong>Zona Terdampak Kel. ${ez.kelurahan}</strong><br/>Pemicu: ${ez.triggerStatus}<br/>Penduduk Terdampak: ${ez.populationAtRisk.toLocaleString('id-ID')} jiwa`,
          { className: 'leaflet-sda-tooltip' }
        )
        .addTo(group);

      L.polyline(
        [
          [ez.lat, ez.lon],
          [ez.assemblyLat, ez.assemblyLon],
        ],
        {
          color: '#34d399',
          weight: 3.5,
          dashArray: '7 5',
          opacity: 0.95,
        }
      )
        .bindTooltip(`<strong>Jalur Evakuasi:</strong> ${ez.routeSummary}`, {
          className: 'leaflet-sda-tooltip',
        })
        .addTo(group);

      const assemblyIcon = L.divIcon({
        className: 'leaflet-station-wrapper',
        html: `<div style="display:flex;align-items:center;gap:4px;transform:translate(-50%,-50%);white-space:nowrap;">
          <span style="display:inline-flex;width:14px;height:14px;border-radius:3px;background:#10b981;border:2px solid #ecfdf5;box-shadow:0 2px 6px rgba(0,0,0,0.6)"></span>
          <span style="background:rgba(6,78,59,0.92);color:#a7f3d0;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;border:1px solid #34d399">TK ${ez.kelurahan.split(' ')[0]}</span>
        </div>`,
        iconSize: [0, 0],
      });

      L.marker([ez.assemblyLat, ez.assemblyLon], { icon: assemblyIcon })
        .bindTooltip(`<strong>Titik Kumpul Aman:</strong> ${ez.assemblyPoint}`, {
          className: 'leaflet-sda-tooltip',
        })
        .addTo(group);
    }
  }, [layerEvac, evacuationZones]);

  // Render Hydrological Station Markers
  useEffect(() => {
    const group = markerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    for (const st of stations) {
      const meta = SIAGA_META[st.status];
      const isSelected = st.id === selectedStationId;
      const isCritical = st.status === 'siaga1' || st.status === 'siaga2';

      let shapeHtml = '';
      if (st.type === 'ARR') {
        shapeHtml = `<svg width="18" height="18" viewBox="-9 -9 18 18" style="overflow:visible;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.75));">
          <polygon points="0,-8 8,6 -8,6" fill="${meta.color}" stroke="#0f172a" stroke-width="1.8" />
        </svg>`;
      } else if (st.type === 'TIDE') {
        shapeHtml = `<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${meta.color};border:2px solid #0f172a;box-shadow:0 2px 5px rgba(0,0,0,0.75);"></span>`;
      } else {
        shapeHtml = `<span style="display:inline-block;width:15px;height:15px;border-radius:9999px;background:${meta.color};border:2px solid #0f172a;box-shadow:0 2px 5px rgba(0,0,0,0.75);"></span>`;
      }

      const selectedRing = isSelected
        ? `<span style="position:absolute;left:50%;top:50%;width:25px;height:25px;border-radius:9999px;border:2px dashed #ffffff;transform:translate(-50%,-50%);pointer-events:none;"></span>`
        : '';

      const pulseRing = isCritical
        ? `<span class="leaflet-pulse-ring" style="color:${meta.color};"></span>`
        : '';

      const shortCode = st.code.replace('AWLR-', '').replace('ARR-', '');
      const labelHtml = !compact
        ? `<span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);background:rgba(2,6,23,0.84);color:${isSelected ? '#ffffff' : '#e2e8f0'};padding:1px 5px;border-radius:4px;font-size:10px;font-weight:${isSelected ? '700' : '600'};white-space:nowrap;border:1px solid ${isSelected ? '#38bdf8' : 'rgba(148,163,184,0.35)'};box-shadow:0 2px 4px rgba(0,0,0,0.5);">${shortCode}</span>`
        : '';

      const icon = L.divIcon({
        className: 'leaflet-station-wrapper',
        html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:18px;height:18px;transform:translate(-50%,-50%);cursor:pointer;">
          ${pulseRing}${selectedRing}${shapeHtml}${labelHtml}
        </div>`,
        iconSize: [18, 18],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([st.lat, st.lon], { icon });
      const tmaLine =
        st.type === 'ARR'
          ? `Hujan: <strong>${st.rainfallMmH.toFixed(1)} mm/jam</strong>`
          : `TMA: <strong>${st.waterLevelM.toFixed(2)} m</strong> (+${(st.elevationMdpl + st.waterLevelM).toFixed(2)} mdpl) • Hujan: ${st.rainfallMmH.toFixed(1)} mm/j`;

      marker.bindTooltip(
        `<div style="min-width:190px;">
          <div style="font-weight:700;color:#ffffff;font-size:12px;">${st.name}</div>
          <div style="color:#94a3b8;font-size:10.5px;">${st.code} • ${st.das} • ${st.protocol}</div>
          <div style="margin-top:4px;color:#7dd3fc;">${tmaLine}</div>
          <div style="margin-top:2px;color:${meta.color};font-weight:700;">Status: ${meta.label} (${st.lat.toFixed(4)}, ${st.lon.toFixed(4)})</div>
        </div>`,
        { direction: 'top', offset: [0, -10], className: 'leaflet-sda-tooltip' }
      );

      marker.on('click', () => {
        onSelectRef.current(st.id);
      });

      marker.addTo(group);
    }
  }, [stations, selectedStationId, compact]);

  // Smoothly pan to newly selected station if outside view or when user clicks station cards
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const st = stations.find((s) => s.id === selectedStationId);
    if (!st) return;
    if (!map.getBounds().pad(-0.1).contains([st.lat, st.lon])) {
      map.panTo([st.lat, st.lon], { animate: true, duration: 0.45 });
    }
  }, [selectedStationId, stations]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[#061326] text-slate-200">
      {/* Top Floating Layer & Basemap Controls */}
      {!compact && (
        <div className="pointer-events-none absolute top-3 right-14 left-3 z-[400] flex flex-wrap items-center gap-1.5">
          <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-950/90 px-2.5 py-1 text-[11px] font-semibold text-sky-300 backdrop-blur">
            <Layers className="h-3.5 w-3.5" /> WebGIS BWS Sumatera V
          </span>

          {/* Basemap Switcher */}
          <div className="pointer-events-auto inline-flex items-center rounded-md border border-slate-700/80 bg-slate-950/90 p-0.5 backdrop-blur">
            <MapIcon className="mx-1.5 h-3.5 w-3.5 text-emerald-400" />
            {(Object.keys(BASEMAP_CONFIG) as BasemapId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setBasemap(id)}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${
                  basemap === id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {BASEMAP_CONFIG[id].label}
              </button>
            ))}
          </div>

          {/* Hydrological Overlays */}
          <button
            type="button"
            onClick={() => setLayerDas((v) => !v)}
            className={`pointer-events-auto rounded-md border px-2.5 py-1 text-[11px] font-medium backdrop-blur transition ${
              layerDas
                ? 'border-emerald-400/50 bg-emerald-500/25 text-emerald-200'
                : 'border-slate-700 bg-slate-950/85 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Batas DAS &amp; Sungai
          </button>
          <button
            type="button"
            onClick={() => setLayerSat((v) => !v)}
            className={`pointer-events-auto rounded-md border px-2.5 py-1 text-[11px] font-medium backdrop-blur transition ${
              layerSat
                ? 'border-sky-400/50 bg-sky-500/25 text-sky-200'
                : 'border-slate-700 bg-slate-950/85 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Satelit Hujan 3×3 km
          </button>
          <button
            type="button"
            onClick={() => setLayerSoil((v) => !v)}
            className={`pointer-events-auto rounded-md border px-2.5 py-1 text-[11px] font-medium backdrop-blur transition ${
              layerSoil
                ? 'border-amber-400/50 bg-amber-500/25 text-amber-200'
                : 'border-slate-700 bg-slate-950/85 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Soil Moisture 100m
          </button>
          {evacuationZones.length > 0 && (
            <button
              type="button"
              onClick={() => setLayerEvac((v) => !v)}
              className={`pointer-events-auto rounded-md border px-2.5 py-1 text-[11px] font-medium backdrop-blur transition ${
                layerEvac
                  ? 'border-rose-400/50 bg-rose-500/25 text-rose-200'
                  : 'border-slate-700 bg-slate-950/85 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Zona &amp; Jalur Evakuasi
            </button>
          )}
        </div>
      )}

      {/* Zoom & Quick Focus Controls */}
      {!compact && (
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            aria-label="Perbesar peta"
            className="rounded-md border border-slate-700 bg-slate-950/90 p-1.5 text-slate-200 hover:bg-slate-800"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            aria-label="Perkecil peta"
            className="rounded-md border border-slate-700 bg-slate-950/90 p-1.5 text-slate-200 hover:bg-slate-800"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.setView(PADANG_CENTER, PADANG_ZOOM, { animate: true })}
            title="Fokus DAS Kritis Padang (Kuranji & Arau)"
            aria-label="Fokus DAS Padang"
            className="rounded-md border border-slate-700 bg-slate-950/90 p-1.5 text-sky-300 hover:bg-slate-800"
          >
            <Compass className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => mapRef.current?.setView(SUMBAR_CENTER, SUMBAR_ZOOM, { animate: true })}
            title="Tampilkan Seluruh Wilayah Sumbar"
            aria-label="Reset tampilan Sumatera Barat"
            className="rounded-md border border-slate-700 bg-slate-950/90 p-1.5 text-slate-200 hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Leaflet Canvas */}
      <div
        ref={containerRef}
        className={`w-full ${compact ? 'h-[230px]' : 'h-[450px]'}`}
        aria-label="Peta Geografis WebGIS Wilayah Sungai dan Pos Hidrologi BWS Sumatera V"
      />

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950/95 px-3 py-1.5 text-[11px] text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          {(['normal', 'siaga4', 'siaga3', 'siaga2', 'siaga1', 'offline'] as const).map((lvl) => (
            <span key={lvl} className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SIAGA_META[lvl].color }} />
              {SIAGA_META[lvl].label}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-slate-400">
          Basemap: {BASEMAP_CONFIG[basemap].label} • ● AWLR/AWS &nbsp; ▲ ARR &nbsp; ■ Pasang Surut
        </span>
      </div>
    </div>
  );
};
