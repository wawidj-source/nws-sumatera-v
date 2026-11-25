import React, { useState } from 'react';
import {
  Crosshair,
  Eye,
  Image as ImageIcon,
  Layers,
  Maximize2,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Station } from '../types/sda';
import { ModalDialog } from './ModalDialog';

type ViewMode = 'split' | 'ortho' | 'dem';

interface DroneOrthoViewerProps {
  station: Station;
  sedimentChangeCm: number;
  surveyDate: string;
}

export const DroneOrthoViewer: React.FC<DroneOrthoViewerProps> = ({
  station,
  sedimentChangeCm,
  surveyDate,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [splitPct, setSplitPct] = useState(54);
  const [showCrossSections, setShowCrossSections] = useState(true);
  const [showSedimentZone, setShowSedimentZone] = useState(true);
  const [showGcp, setShowGcp] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Interpolated cursor telemetry anchored to station WGS84 / UTM 47S
  const [cursorNorm, setCursorNorm] = useState({ x: 0.5, y: 0.5 });

  const baseEasting = Math.round(658200 + (station.lon - 100.4258) * 111320);
  const baseNorthing = Math.round(9897950 + (station.lat + 0.9225) * 110574);
  const cursorEasting = Math.round(baseEasting - 160 + cursorNorm.x * 320);
  const cursorNorthing = Math.round(baseNorthing + 90 - cursorNorm.y * 180);
  const cursorLat = (station.lat + (0.5 - cursorNorm.y) * 0.0016).toFixed(6);
  const cursorLon = (station.lon + (cursorNorm.x - 0.5) * 0.0028).toFixed(6);

  // Approximate elevation profile: lower near center y=0.5 (river), higher on banks
  const distFromCenter = Math.abs(cursorNorm.y - 0.5) * 2;
  const sandbarBump =
    Math.abs(cursorNorm.x - 0.5) < 0.16 && Math.abs(cursorNorm.y - 0.52) < 0.12 ? 0.65 : 0;
  const cursorElev = (station.elevationMdpl - 1.2 + distFromCenter * 6.4 + sandbarBump).toFixed(2);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setCursorNorm({ x, y });
  };

  const renderCanvas = (inModal: boolean) => (
    <div
      onPointerMove={handlePointerMove}
      className={`relative w-full overflow-hidden rounded-lg border border-slate-800 bg-[#07111f] select-none ${
        inModal ? 'aspect-video' : 'aspect-[16/9]'
      }`}
    >
      <div
        className="relative h-full w-full transition-transform duration-200"
        style={{ transform: inModal ? `scale(${zoom})` : undefined }}
      >
        {/* Base DEM Hillshade Layer */}
        <img
          src="/survey/drone-dem-gunung-nago.png"
          alt={`DEM Hillshade UAV ${station.name}`}
          className={`absolute inset-0 h-full w-full object-cover ${
            viewMode === 'ortho' ? 'opacity-0' : 'opacity-100'
          }`}
          draggable={false}
        />

        {/* Top Orthophoto RGB Layer (clipped in Split mode) */}
        <img
          src="/survey/drone-ortho-gunung-nago.png"
          alt={`Orthophoto UAV RTK ${station.name}`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            clipPath:
              viewMode === 'dem'
                ? 'inset(0 100% 0 0)'
                : viewMode === 'split'
                  ? `inset(0 ${100 - splitPct}% 0 0)`
                  : 'inset(0 0 0 0)',
          }}
          draggable={false}
        />

        {/* GIS Engineering SVG Overlay */}
        <svg
          viewBox="0 0 800 450"
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          {/* Subtle UTM Coordinate Grid */}
          <g stroke="#e2e8f0" strokeOpacity="0.14" strokeWidth="0.7" strokeDasharray="3 4">
            {[160, 320, 480, 640].map((gx) => (
              <line key={gx} x1={gx} y1="0" x2={gx} y2="450" />
            ))}
            {[90, 180, 270, 360].map((gy) => (
              <line key={gy} x1="0" y1={gy} x2="800" y2={gy} />
            ))}
          </g>

          {/* Sedimentation & Scouring Polygons */}
          {showSedimentZone && (
            <g>
              <path
                d="M305,222 Q395,188 492,216 Q465,260 365,256 Q318,248 305,222 Z"
                fill="#f59e0b"
                fillOpacity="0.28"
                stroke="#fbbf24"
                strokeWidth="1.8"
                strokeDasharray="5 3"
              />
              <rect x="315" y="164" width="174" height="22" rx="4" fill="#020617" fillOpacity="0.82" stroke="#f59e0b" strokeWidth="0.8" />
              <text x="402" y="179" textAnchor="middle" fill="#fde68a" fontSize="10.5" fontWeight="700">
                Gosong Pasir ({sedimentChangeCm >= 0 ? `+${sedimentChangeCm}` : sedimentChangeCm} cm • 412 m³)
              </text>

              <path
                d="M545,265 Q615,255 660,285 Q620,308 552,292 Z"
                fill="#38bdf8"
                fillOpacity="0.24"
                stroke="#38bdf8"
                strokeWidth="1.4"
                strokeDasharray="4 3"
              />
              <rect x="520" y="302" width="152" height="20" rx="4" fill="#020617" fillOpacity="0.82" stroke="#38bdf8" strokeWidth="0.8" />
              <text x="596" y="315" textAnchor="middle" fill="#bae6fd" fontSize="9.5" fontWeight="700">
                Zona Gerusan Tebing (−12 cm)
              </text>
            </g>
          )}

          {/* Cross-Section Transect Lines */}
          {showCrossSections && (
            <g>
              {[
                { x: 215, label: 'CS-01 (0+000)' },
                { x: 400, label: 'CS-02 (0+120)' },
                { x: 595, label: 'CS-03 (0+240)' },
              ].map((cs) => (
                <g key={cs.label}>
                  <line
                    x1={cs.x}
                    y1="72"
                    x2={cs.x}
                    y2="378"
                    stroke="#22d3ee"
                    strokeWidth="1.6"
                    strokeDasharray="6 4"
                  />
                  <circle cx={cs.x} cy="72" r="3.5" fill="#22d3ee" />
                  <circle cx={cs.x} cy="378" r="3.5" fill="#22d3ee" />
                  <rect x={cs.x - 42} y="48" width="84" height="17" rx="3" fill="#020617" fillOpacity="0.82" />
                  <text x={cs.x} y="60" textAnchor="middle" fill="#67e8f9" fontSize="9.5" fontWeight="700">
                    {cs.label}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* RTK Ground Control Points (GCP) */}
          {showGcp && (
            <g>
              {[
                { x: 148, y: 128, label: `BM-01 (+${(station.elevationMdpl + 3.8).toFixed(1)}m)` },
                { x: 425, y: 342, label: `GCP-02 (+${(station.elevationMdpl + 2.4).toFixed(1)}m)` },
                { x: 678, y: 122, label: `GCP-03 (+${(station.elevationMdpl + 4.1).toFixed(1)}m)` },
              ].map((pt) => (
                <g key={pt.label} transform={`translate(${pt.x}, ${pt.y})`}>
                  <circle r="7" fill="none" stroke="#facc15" strokeWidth="1.6" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#facc15" strokeWidth="1.2" />
                  <line x1="0" y1="-10" x2="0" y2="10" stroke="#facc15" strokeWidth="1.2" />
                  <rect x="11" y="-9" width="94" height="16" rx="3" fill="#020617" fillOpacity="0.84" />
                  <text x="15" y="2" fill="#fef08a" fontSize="9" fontWeight="700">
                    {pt.label}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* Split Curtain Handle */}
        {viewMode === 'split' && (
          <div
            className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
            style={{ left: `${splitPct}%` }}
          >
            <div className="absolute top-1/2 -left-3.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-slate-950/90 text-white shadow-lg">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </div>
            <span className="absolute top-2.5 right-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300">
              RGB ORTHO
            </span>
            <span className="absolute top-2.5 left-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300">
              DEM HILLSHADE
            </span>
          </div>
        )}
      </div>

      {/* Interactive Transparent Range Overlay for Split Swipe */}
      {viewMode === 'split' && (
        <input
          type="range"
          min={5}
          max={95}
          value={splitPct}
          onChange={(e) => setSplitPct(Number(e.target.value))}
          aria-label="Geser pembanding Orthophoto RGB dan DEM Hillshade"
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        />
      )}

      {/* Top Left Acquisition Stamp */}
      <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 rounded bg-slate-950/82 px-2 py-1 font-mono text-[10px] text-slate-200 backdrop-blur border border-slate-700/80">
        GSD: 3.2 cm/px • UAV RTK • RMSE H 1.8 cm / V 2.4 cm • {surveyDate}
      </div>

      {/* North Arrow & Scale Bar Bottom Left */}
      <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex items-center gap-3 rounded bg-slate-950/85 px-2.5 py-1 font-mono text-[10px] text-slate-200 border border-slate-700/80">
        <span className="font-bold text-sky-400">▲ N</span>
        <div className="flex flex-col">
          <div className="flex h-1.5 w-20 border border-slate-300">
            <span className="w-1/2 bg-slate-200" />
            <span className="w-1/2 bg-slate-800" />
          </div>
          <span className="mt-0.5 text-[9px] text-slate-300">0 — 25 — 50 m</span>
        </div>
      </div>

      {/* DEM Elevation Legend Bottom Right */}
      <div className="pointer-events-none absolute right-2.5 bottom-2.5 z-10 flex items-center gap-2 rounded bg-slate-950/85 px-2.5 py-1 font-mono text-[9.5px] text-slate-200 border border-slate-700/80">
        <span>+{(station.elevationMdpl - 1.5).toFixed(1)}m</span>
        <span
          className="h-2 w-20 rounded-sm"
          style={{
            background: 'linear-gradient(90deg, #1d4ed8, #06b6d4, #22c55e, #eab308, #ea580c)',
          }}
        />
        <span>+{(station.elevationMdpl + 5.5).toFixed(1)}m</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-3">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <ImageIcon className="h-4 w-4" />
              <span>Orthophoto &amp; DEM Drone — {station.name}</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                EPSG:32747 Valid
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              Geser garis tengah untuk membandingkan mosaik foto udara RGB dan model elevasi permukaan (DEM) secara langsung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-0.5 text-[11px]">
              {[
                { id: 'split', label: 'Split RGB | DEM' },
                { id: 'ortho', label: 'Orthophoto' },
                { id: 'dem', label: 'DEM Hillshade' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewMode(m.id as ViewMode)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition ${
                    viewMode === m.id
                      ? 'bg-[var(--brand-accent)] text-slate-950'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              title="Inspeksi Peta Drone Layar Penuh"
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[11px] font-semibold hover:bg-[var(--brand-accent)] hover:text-slate-950"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Inspeksi
            </button>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setShowCrossSections((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium ${
              showCrossSections
                ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            <Layers className="h-3 w-3" /> Garis Penampang (CS-01..03)
          </button>
          <button
            type="button"
            onClick={() => setShowSedimentZone((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium ${
              showSedimentZone
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            <Eye className="h-3 w-3" /> Zona Sedimentasi &amp; Gerusan
          </button>
          <button
            type="button"
            onClick={() => setShowGcp((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium ${
              showGcp
                ? 'border-yellow-500/50 bg-yellow-500/15 text-yellow-300'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            <Crosshair className="h-3 w-3" /> Titik Kontrol RTK (GCP)
          </button>
        </div>

        {/* Interactive Image Viewport */}
        {renderCanvas(false)}

        {/* Live GIS Coordinate & Elevation Cursor Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 font-mono text-[11px] tabular-nums">
          <span>
            <span className="text-[var(--text-secondary)]">UTM 47S:</span>{' '}
            <strong className="text-[var(--text-primary)]">
              {cursorEasting} mE, {cursorNorthing} mN
            </strong>
          </span>
          <span>
            <span className="text-[var(--text-secondary)]">WGS84:</span>{' '}
            <strong className="text-sky-400">
              {cursorLat}, {cursorLon}
            </strong>
          </span>
          <span>
            <span className="text-[var(--text-secondary)]">Elevasi DEM:</span>{' '}
            <strong className="text-emerald-400">+{cursorElev} mdpl</strong>
          </span>
        </div>
      </div>

      {/* Fullscreen GIS Inspection Modal */}
      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Inspeksi Orthophoto & DEM UAV RTK — ${station.name}`}
        subtitle={`Proyeksi UTM Zona 47S (EPSG:32747) • GSD 3.2 cm/px • Tanggal Akuisisi ${surveyDate}`}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-0.5 text-xs">
              {[
                { id: 'split', label: 'Split RGB | DEM' },
                { id: 'ortho', label: 'Orthophoto RGB' },
                { id: 'dem', label: 'DEM Hillshade' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewMode(m.id as ViewMode)}
                  className={`rounded-md px-3 py-1 font-semibold ${
                    viewMode === m.id ? 'bg-[var(--brand-accent)] text-slate-950' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                className="rounded-lg border border-[var(--border-subtle)] p-1.5 hover:bg-[var(--surface-elevated)]"
                aria-label="Perkecil Orthophoto"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="tabular-nums font-mono px-1">{zoom.toFixed(2)}×</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.25, Number((z + 0.25).toFixed(2))))}
                className="rounded-lg border border-[var(--border-subtle)] p-1.5 hover:bg-[var(--surface-elevated)]"
                aria-label="Perbesar Orthophoto"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {renderCanvas(true)}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--surface-muted)] px-3 py-2 font-mono text-xs tabular-nums">
            <span>UTM 47S: {cursorEasting} mE, {cursorNorthing} mN</span>
            <span>WGS84: {cursorLat}, {cursorLon}</span>
            <span className="text-emerald-400 font-bold">Elevasi Permukaan: +{cursorElev} mdpl</span>
          </div>
        </div>
      </ModalDialog>
    </>
  );
};
