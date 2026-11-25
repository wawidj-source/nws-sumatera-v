import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  Crosshair,
  Download,
  Eye,
  Home,
  Maximize2,
  Moon,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Station } from '../types/sda';
import { SIAGA_META } from './StatusBadge';
import { ModalDialog } from './ModalDialog';

const CCTV_IMAGE_MAP: Record<string, { src: string; channel: string; presetLabel: string }> = {
  'pos-kuranji-gn': {
    src: '/cctv/cam-gunung-nago.png',
    channel: 'CH01',
    presetLabel: 'Mercu Bendung & Mistar',
  },
  'pos-kuranji-pb': {
    src: '/cctv/cam-pasar-baru.png',
    channel: 'CH02',
    presetLabel: 'Tebing Jembatan Pasar Baru',
  },
  'pos-arau-kk': {
    src: '/cctv/cam-kampung-koto.png',
    channel: 'CH03',
    presetLabel: 'Pintu Air Kampung Koto',
  },
  'pos-tide-tb': {
    src: '/cctv/cam-teluk-bayur.png',
    channel: 'CH04',
    presetLabel: 'Muara & Pasang Surut',
  },
};

function formatNowWib(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dd}-${mo}-${yyyy} ${hh}:${mm}:${ss} WIB`;
}

const RainCanvasOverlay: React.FC<{ rainfallMmH: number; irMode: boolean }> = ({
  rainfallMmH,
  irMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dropCount = Math.min(95, Math.max(12, Math.round(rainfallMmH * 2.4)));
    const drops = Array.from({ length: dropCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: 10 + Math.random() * 14,
      speed: 5 + Math.random() * 6,
      alpha: 0.14 + Math.random() * 0.25,
    }));

    let rafId = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle rain streaks scaled by rainfall intensity
      if (rainfallMmH > 1) {
        ctx.lineWidth = 1;
        for (const d of drops) {
          ctx.strokeStyle = irMode
            ? `rgba(167, 243, 208, ${d.alpha})`
            : `rgba(226, 232, 240, ${d.alpha})`;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 3.5, d.y + d.len);
          ctx.stroke();

          d.x -= 1.2;
          d.y += d.speed;
          if (d.y > canvas.height) {
            d.y = -d.len;
            d.x = Math.random() * (canvas.width + 40);
          }
        }
      }

      // Faint camera sensor grain line
      const scanY = (Date.now() / 18) % canvas.height;
      ctx.fillStyle = irMode ? 'rgba(110, 231, 183, 0.04)' : 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, scanY, canvas.width, 2);

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [rainfallMmH, irMode]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};

export const CctvFeedCard: React.FC<{ station: Station; compact?: boolean }> = ({
  station,
  compact = false,
}) => {
  const [liveTime, setLiveTime] = useState(formatNowWib);
  const [irMode, setIrMode] = useState(false);
  const [aiCv, setAiCv] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('Default');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setLiveTime(formatNowWib()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const camInfo = CCTV_IMAGE_MAP[station.id] ?? {
    src: '/cctv/cam-gunung-nago.png',
    channel: 'CH05',
    presetLabel: 'Pantau Utama',
  };
  const meta = SIAGA_META[station.status];

  // Calibrated vertical position (%) for AI water-level overlay
  const ratio = Math.min(1, Math.max(0, station.waterLevelM / Math.max(3.5, station.thresholds.siaga1)));
  const waterLinePct = Math.round(78 - ratio * 36);

  const handleSnapshot = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (irMode) {
      ctx.filter = 'grayscale(1) contrast(1.28) brightness(0.95) sepia(0.38) hue-rotate(72deg)';
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    // Stamp authentic OSD onto downloaded snapshot
    ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
    ctx.fillRect(0, 0, canvas.width, 46);
    ctx.fillRect(0, canvas.height - 44, canvas.width, 44);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(
      `${camInfo.channel} // CAM-${station.code}  |  ${liveTime}  |  GPS: ${station.lat.toFixed(4)}, ${station.lon.toFixed(4)}`,
      20,
      30
    );
    ctx.fillStyle = meta.color;
    ctx.fillText(
      `${meta.label.toUpperCase()} • TMA: ${station.waterLevelM.toFixed(2)} m (+${(station.elevationMdpl + station.waterLevelM).toFixed(2)} mdpl) • Hujan: ${station.rainfallMmH.toFixed(1)} mm/j`,
      20,
      canvas.height - 16
    );

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `snapshot-${station.code}-${Date.now()}.png`;
    a.click();
  };

  const applyPreset = (name: string, z: number, px: number, py: number) => {
    setActivePreset(name);
    setZoom(z);
    setPanX(px);
    setPanY(py);
  };

  const renderFeedViewport = (inModal: boolean) => (
    <div className="relative aspect-video w-full overflow-hidden bg-black select-none">
      <img
        ref={!inModal ? imgRef : undefined}
        src={camInfo.src}
        alt={`CCTV Real-Time ${station.name}`}
        className={`h-full w-full object-cover transition-transform duration-300 ${
          irMode ? 'cctv-ir-filter' : 'brightness-95 contrast-105'
        }`}
        style={{
          transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
        }}
      />

      {/* Animated Rain & Camera Scanlines */}
      <RainCanvasOverlay rainfallMmH={station.rainfallMmH} irMode={irMode} />
      <div className="cctv-scanlines pointer-events-none absolute inset-0" />

      {/* Subtle Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 58%, rgba(2, 6, 23, 0.55) 100%)',
        }}
      />

      {/* AI Computer Vision Water-Level Detection Overlay */}
      {aiCv && (
        <div
          className="pointer-events-none absolute inset-x-0 transition-all duration-500"
          style={{ top: `${waterLinePct}%` }}
        >
          <div className="border-t-2 border-dashed border-cyan-400/90 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute right-2 -top-6 flex items-center gap-1 rounded bg-slate-950/85 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-400/40">
            <Crosshair className="h-3 w-3 text-cyan-400" />
            AI-CV: 98.4% • TMA {station.waterLevelM.toFixed(2)} m
          </div>
        </div>
      )}

      {/* Top OSD Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-2.5 pt-2 pb-5 font-mono text-[10px] text-slate-100">
        <div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="inline-flex items-center gap-1 rounded bg-rose-600/90 px-1.5 py-0.2 text-[9px] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              REC
            </span>
            <span>{camInfo.channel} // CAM-{station.code}</span>
            {irMode && (
              <span className="rounded bg-emerald-500/25 px-1 text-[9px] text-emerald-300 border border-emerald-400/40">
                IR-LED ON
              </span>
            )}
          </div>
          <div className="mt-0.5 text-emerald-300 tabular-nums">{liveTime}</div>
          {!compact && (
            <div className="text-[9px] text-slate-300">
              GPS: {station.lat.toFixed(4)}, {station.lon.toFixed(4)} • {camInfo.presetLabel}
            </div>
          )}
        </div>

        <div className="text-right">
          <span
            className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-950"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label.toUpperCase()}
          </span>
          {!compact && (
            <div className="mt-0.5 text-[9px] text-slate-300">RTSP H.265 • 1080p • 25fps</div>
          )}
        </div>
      </div>

      {/* Bottom Hydrological OSD + Action Controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-1.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 pt-5 pb-2">
        <div className="pointer-events-none font-mono text-[10px] text-slate-100 tabular-nums">
          <span className="font-bold text-sky-300">TMA {station.waterLevelM.toFixed(2)} m</span>{' '}
          <span className="text-slate-300">
            (+{(station.elevationMdpl + station.waterLevelM).toFixed(1)} mdpl)
          </span>
          {!compact && (
            <span className="ml-2 text-amber-300">
              Δ {station.fluctuationCmH >= 0 ? `+${station.fluctuationCmH}` : station.fluctuationCmH} cm/j • Hujan {station.rainfallMmH.toFixed(1)} mm/j
            </span>
          )}
        </div>

        {!inModal && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIrMode((v) => !v)}
              title="Toggle Mode Night Vision Inframerah (IR)"
              className={`rounded px-1.5 py-1 text-[10px] font-bold transition ${
                irMode
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-black/70 text-slate-200 hover:bg-slate-800'
              }`}
            >
              IR
            </button>
            <button
              type="button"
              onClick={() => setAiCv((v) => !v)}
              title="Toggle Deteksi Garis Air AI-CV"
              className={`rounded px-1.5 py-1 text-[10px] font-bold transition ${
                aiCv
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-black/70 text-slate-200 hover:bg-slate-800'
              }`}
            >
              AI
            </button>
            <button
              type="button"
              onClick={handleSnapshot}
              title="Ambil Snapshot Frame PNG"
              className="rounded bg-black/70 p-1 text-slate-200 hover:bg-sky-600"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              title="Perbesar & Kontrol PTZ"
              className="inline-flex items-center gap-1 rounded bg-sky-600/90 px-2 py-1 text-[10px] font-bold text-white hover:bg-sky-500"
            >
              <Maximize2 className="h-3 w-3" /> PTZ
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[#040a14] text-slate-200 shadow-md">
        {/* Camera Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-3 py-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-100 truncate pr-2">
            <Camera className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{station.name}</span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-emerald-400">LIVE • 2.4 Mbps</span>
        </div>

        {renderFeedViewport(false)}
      </div>

      {/* Fullscreen PTZ Surveillance Modal */}
      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Live CCTV & Kontrol PTZ — ${station.name}`}
        subtitle={`${camInfo.channel} • CAM-${station.code} • ${station.das} • Latensi VPN ${station.vpnLatencyMs} ms`}
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-800">
            {renderFeedViewport(true)}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            {/* PTZ D-Pad */}
            <div className="sm:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
              <div className="mb-2 text-xs font-bold text-[var(--text-primary)]">
                Kontrol Pan / Tilt / Zoom (PTZ)
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="grid grid-cols-3 gap-1">
                  <span />
                  <button
                    type="button"
                    onClick={() => setPanY((y) => Math.min(12, y + 4))}
                    aria-label="Tilt Atas"
                    className="rounded bg-[var(--surface-elevated)] p-2 hover:bg-[var(--brand-accent)] hover:text-slate-950"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <span />
                  <button
                    type="button"
                    onClick={() => setPanX((x) => Math.min(12, x + 4))}
                    aria-label="Pan Kiri"
                    className="rounded bg-[var(--surface-elevated)] p-2 hover:bg-[var(--brand-accent)] hover:text-slate-950"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('Home', 1, 0, 0)}
                    aria-label="Reset Home PTZ"
                    className="rounded bg-sky-500/20 p-2 text-sky-400 hover:bg-sky-500 hover:text-slate-950"
                  >
                    <Home className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanX((x) => Math.max(-12, x - 4))}
                    aria-label="Pan Kanan"
                    className="rounded bg-[var(--surface-elevated)] p-2 hover:bg-[var(--brand-accent)] hover:text-slate-950"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <span />
                  <button
                    type="button"
                    onClick={() => setPanY((y) => Math.max(-12, y - 4))}
                    aria-label="Tilt Bawah"
                    className="rounded bg-[var(--surface-elevated)] p-2 hover:bg-[var(--brand-accent)] hover:text-slate-950"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <span />
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
                    className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--brand-accent)] hover:text-slate-950"
                  >
                    <ZoomIn className="h-3.5 w-3.5" /> Zoom +
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
                    className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--brand-accent)] hover:text-slate-950"
                  >
                    <ZoomOut className="h-3.5 w-3.5" /> Zoom −
                  </button>
                </div>
              </div>
            </div>

            {/* Presets & Mode Switches */}
            <div className="sm:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 space-y-2.5 text-xs">
              <div className="font-bold text-[var(--text-primary)]">Preset Sudut Kamera &amp; Mode</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Preset 1: Mistar Duga', z: 1.35, px: -6, py: -4 },
                  { label: 'Preset 2: Pintu / Mercu', z: 1.2, px: 5, py: 0 },
                  { label: 'Preset 3: Alur Lebar', z: 1, px: 0, py: 0 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.label, p.z, p.px, p.py)}
                    className={`rounded-lg border px-2.5 py-1 font-semibold ${
                      activePreset === p.label
                        ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-slate-950'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-card)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIrMode((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold ${
                    irMode ? 'bg-emerald-600 text-white' : 'border border-[var(--border-subtle)] bg-[var(--surface-card)]'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" /> {irMode ? 'Mode IR Aktif' : 'Aktifkan Night IR'}
                </button>
                <button
                  type="button"
                  onClick={() => setAiCv((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold ${
                    aiCv ? 'bg-cyan-600 text-white' : 'border border-[var(--border-subtle)] bg-[var(--surface-card)]'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> {aiCv ? 'Overlay AI-CV Aktif' : 'Aktifkan AI-CV'}
                </button>
                <button
                  type="button"
                  onClick={handleSnapshot}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 font-bold text-white hover:bg-sky-500"
                >
                  <Download className="h-3.5 w-3.5" /> Unduh Snapshot
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModalDialog>
    </>
  );
};
