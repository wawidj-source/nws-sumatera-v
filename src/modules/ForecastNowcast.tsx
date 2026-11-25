import React, { useEffect, useState } from 'react';
import { CloudLightning, Droplets, Pause, Play, Satellite, Waves, Wind } from 'lucide-react';
import { FORECAST_144H, SUBDAS_SOIL_MOISTURE } from '../data/mockData';
import { ForecastMultiChart } from '../components/HydroCharts';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';
import { SubDasSoilMoisture } from '../types/sda';

export const ForecastNowcast: React.FC = () => {
  const [hourIndex, setHourIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'satellite' | 'nowcast' | 'coincidence'>('satellite');

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setHourIndex((prev) => (prev + 1) % FORECAST_144H.length);
    }, 650);
    return () => window.clearInterval(t);
  }, [playing]);

  const currentHour = FORECAST_144H[hourIndex];

  const soilColumns: TableColumn<SubDasSoilMoisture>[] = [
    { key: 'subDas', label: 'Sub-DAS', isRowHeader: true, render: (r) => r.subDas },
    { key: 'das', label: 'DAS Induk', render: (r) => r.das },
    { key: 'vwc', label: 'Soil Moisture (% VWC)', align: 'right', render: (r) => <span className="font-bold tabular-nums">{r.vwcPct}%</span> },
    { key: 'm3', label: 'Satuan (m³/m³)', align: 'right', render: (r) => <span className="tabular-nums">{r.m3m3.toFixed(3)}</span> },
    {
      key: 'class',
      label: 'Kelas Kejenuhan',
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            r.saturationClass === 'Kritis Jenuh'
              ? 'bg-rose-500/20 text-rose-400'
              : r.saturationClass === 'Jenuh Tinggi'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/15 text-emerald-400'
          }`}
        >
          {r.saturationClass}
        </span>
      ),
    },
    { key: 'csi', label: 'Skor Akurasi Nowcast (CSI)', align: 'right', render: (r) => <span className="tabular-nums text-sky-400">{r.nowcastCsi.toFixed(2)} (RMSE {r.nowcastRmse})</span> },
  ];

  return (
    <div className="space-y-5">
      {/* Subscription Metadata Banner */}
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Satellite className="mt-0.5 h-5 w-5 text-sky-400 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Prakiraan Cuaca Satelit Orbit Rendah (LEO + GNSS-RO) — Langganan 12 Bulan Wilayah BWS Sumatera V
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Grid <strong>3 × 3 km</strong> • Horizon <strong>6 Hari (144 Jam)</strong> • Pembaruan <strong>2×/hari</strong> • <strong>42 Parameter Atmosfer</strong> • Soil Moisture Harian <strong>100 × 100 m</strong> (% VWC / m³/m³)
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-1 text-xs">
            {[
              { id: 'satellite', label: 'Satelit 144 Jam & Soil Moisture' },
              { id: 'nowcast', label: 'Nowcasting 0–6 Jam & BMKG' },
              { id: 'coincidence', label: 'Koinsidensi Hujan & Pasang Muara' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`rounded-md px-3 py-1.5 font-semibold transition ${
                  activeTab === t.id ? 'bg-[var(--brand-accent)] text-slate-950' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 144h Interactive Timeline Scrubber */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-accent)] px-3 py-1.5 text-xs font-bold text-slate-950"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? 'Jeda Animasi' : 'Putar Animasi 144 Jam'}
            </button>
            <div className="text-xs">
              <span className="text-[var(--text-secondary)]">Langkah Prakiraan: </span>
              <strong className="tabular-nums text-[var(--text-primary)]">
                +{currentHour.hourOffset} Jam ({currentHour.labelWib} WIB)
              </strong>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              currentHour.cycloneRisk === 'Tinggi'
                ? 'bg-rose-500/20 text-rose-400'
                : currentHour.cycloneRisk === 'Sedang'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            Risiko Siklon / Badai Tropis: {currentHour.cycloneRisk}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={FORECAST_144H.length - 1}
          value={hourIndex}
          onChange={(e) => setHourIndex(Number(e.target.value))}
          aria-label="Geser horizon waktu prakiraan 144 jam"
          className="mt-3 w-full"
        />

        {/* 42-Parameter Sample Telemetry Cards */}
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8 text-xs">
          <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
            <div className="text-[10px] text-[var(--text-secondary)]">Hujan (1 Jam)</div>
            <div className="mt-0.5 font-bold tabular-nums text-sky-400">{currentHour.rainSatelliteMmH} mm/j</div>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
            <div className="text-[10px] text-[var(--text-secondary)]">Prakiraan BMKG</div>
            <div className="mt-0.5 font-bold tabular-nums text-amber-400">{currentHour.rainBmkgMmH} mm/j</div>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
            <div className="text-[10px] text-[var(--text-secondary)]">Suhu / Embun</div>
            <div className="mt-0.5 font-bold tabular-nums">{currentHour.tempC}° / {currentHour.dewPointC}°C</div>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
            <div className="text-[10px] text-[var(--text-secondary)]">Angin (Arah)</div>
            <div className="mt-0.5 font-bold tabular-nums flex items-center gap-1">
              <Wind className="h-3 w-3 text-sky-400" /> {currentHour.windSpeedMs} m/s ({currentHour.windDirDeg}°)
            </div>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
            <div className="text-[10px] text-[var(--text-secondary)]">Kelembapan (RH)</div>
            <div className="mt-0.5 font-bold tabular-nums">{currentHour.rhPct}%</div>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
            <div className="text-[10px] text-[var(--text-secondary)]">Tekanan Udara</div>
            <div className="mt-0.5 font-bold tabular-nums">{currentHour.pressureHpa} hPa</div>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
            <div className="text-[10px] text-[var(--text-secondary)]">Radiasi Matahari</div>
            <div className="mt-0.5 font-bold tabular-nums">{currentHour.solarWm2} W/m²</div>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
            <div className="text-[10px] text-[var(--text-secondary)]">Tutupan Awan</div>
            <div className="mt-0.5 font-bold tabular-nums">{currentHour.cloudPct}%</div>
          </div>
        </div>
      </div>

      {/* Main Chart per Tab */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        {activeTab === 'coincidence' ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <Waves className="h-4 w-4 text-rose-400" /> Analisis Koinsidensi Hujan Hulu &amp; Pasang Laut Muara Padang
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Batang biru: intensitas hujan kiriman • Garis merah muda: elevasi pasang surut Teluk Bayur (m). Zona merah menandai jendela risiko banjir rob + kiriman hulu bersamaan.
                </p>
              </div>
              <span className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-400">
                Puncak Koinsidensi: 18:15 WIB (Pasang 2.17 m)
              </span>
            </div>
            <ForecastMultiChart hours={FORECAST_144H} mode="coincidence" />
          </>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <CloudLightning className="h-4 w-4 text-sky-400" />
                  {activeTab === 'nowcast'
                    ? 'Modul Nowcasting 0–6 Jam (Koreksi Bias ARR/AWS) vs Prakiraan BMKG'
                    : 'Prakiraan Hujan Satelit LEO 3×3 km vs BMKG (36 Jam Pertama)'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Batang biru: Satelit LEO • Garis kuning putus-putus: BMKG • Garis hijau: Nowcast 0–6 jam terkoreksi pos ARR/AWS lokal.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-400">
                  Skor CSI Nowcast: 0.84
                </span>
                <span className="rounded-md bg-sky-500/15 px-2.5 py-1 font-semibold text-sky-400">
                  RMSE: 2.0 mm/j
                </span>
              </div>
            </div>
            <ForecastMultiChart hours={FORECAST_144H} mode="rain-compare" />
          </>
        )}
      </div>

      {/* Soil Moisture 100x100m Table */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Droplets className="h-4 w-4 text-amber-400" /> Kelembapan Tanah Harian (100 × 100 m) &amp; Skor Akurasi Nowcast per Sub-DAS
        </div>
        <ResponsiveTable
          caption="Agregasi Soil Moisture & Nowcasting per Sub-DAS BWS Sumatera V"
          columns={soilColumns}
          rows={SUBDAS_SOIL_MOISTURE}
          rowKey={(r) => r.subDas}
        />
      </div>
    </div>
  );
};
