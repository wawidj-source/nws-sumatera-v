import React from 'react';
import { Monitor, ShieldAlert, Radio, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { SumbarMap } from './SumbarMap';
import { CctvFeedCard } from './CctvPanel';
import { HydrographChart } from './HydroCharts';
import { EVACUATION_ZONES, FORECAST_144H, generateStationSeries } from '../data/mockData';
import { StatusBadge } from './StatusBadge';

export const VideowallView: React.FC = () => {
  const {
    stations,
    selectedStationId,
    setSelectedStationId,
    alarms,
    notifications,
    sopSteps,
    vpnTunnels,
    videowallPreset,
    setVideowallPreset,
    setVideowallMode,
  } = useApp();

  const cctvStations = stations.filter((s) => s.hasCctv).slice(0, 4);
  const criticalStation =
    stations.find((s) => s.status === 'siaga1') ??
    stations.find((s) => s.status === 'siaga2') ??
    stations[0];
  const criticalSeries = generateStationSeries(criticalStation);
  const completedSop = sopSteps.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#040914] text-slate-100">
      {/* Control Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Monitor className="h-5 w-5 text-sky-400" />
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white">
              VIDEOWALL 4×2 PUSAT KENDALI — BWS SUMATERA V (SUMATERA BARAT)
            </h1>
            <p className="text-[11px] text-slate-400">
              Tata Letak Ruang Operasi 8-Panel Simultan • Zona Waktu WIB (UTC+7)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setVideowallPreset('normal')}
              className={`rounded-md px-3 py-1 font-semibold transition ${
                videowallPreset === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Preset Normal
            </button>
            <button
              type="button"
              onClick={() => setVideowallPreset('siaga')}
              className={`rounded-md px-3 py-1 font-semibold transition ${
                videowallPreset === 'siaga' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Preset Siaga Banjir
            </button>
          </div>

          <button
            type="button"
            onClick={() => setVideowallMode(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <X className="h-4 w-4" /> Keluar Videowall
          </button>
        </div>
      </header>

      {/* 4x2 Grid */}
      <div className="grid flex-1 grid-cols-1 gap-2.5 overflow-y-auto p-2.5 md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-2">
        {videowallPreset === 'normal' ? (
          <>
            {/* Tile 1: Map */}
            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
              <div className="mb-1.5 text-xs font-bold text-sky-400">1. Peta Sebaran Pos & Aset SDA</div>
              <div className="flex-1">
                <SumbarMap stations={stations} selectedStationId={selectedStationId} onSelectStation={setSelectedStationId} compact />
              </div>
            </div>

            {/* Tile 2: Ringkasan DAS */}
            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
              <div className="mb-2 text-xs font-bold text-sky-400">2. Ringkasan Status per DAS</div>
              <div className="space-y-1.5 overflow-y-auto text-xs">
                {stations.slice(0, 6).map((st) => (
                  <div key={st.id} className="flex items-center justify-between rounded-lg bg-slate-900/90 px-2.5 py-1.5">
                    <div className="truncate pr-2">
                      <div className="truncate font-semibold text-slate-100">{st.name}</div>
                      <div className="text-[10px] text-slate-400">{st.das}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-sky-300 font-semibold">
                        {st.type === 'ARR' ? `${st.rainfallMmH} mm/j` : `${st.waterLevelM.toFixed(2)} m`}
                      </span>
                      <StatusBadge status={st.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tile 3 & 4: CCTV 1 & 2 */}
            {cctvStations.slice(0, 2).map((st, idx) => (
              <div key={st.id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                <div className="mb-1.5 text-xs font-bold text-sky-400">
                  {idx + 3}. CCTV Lapangan — {st.name}
                </div>
                <CctvFeedCard station={st} />
              </div>
            ))}

            {/* Tile 5 & 6: CCTV 3 & 4 */}
            {cctvStations.slice(2, 4).map((st, idx) => (
              <div key={st.id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                <div className="mb-1.5 text-xs font-bold text-sky-400">
                  {idx + 5}. CCTV Lapangan — {st.name}
                </div>
                <CctvFeedCard station={st} />
              </div>
            ))}

            {/* Tile 7: Satelit LEO Rain */}
            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
              <div className="mb-2 text-xs font-bold text-sky-400">7. Prakiraan Satelit LEO 3×3 km (24 Jam)</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-900 p-2.5">
                  <div className="text-[10px] text-slate-400">Puncak Hujan Satelit</div>
                  <div className="mt-1 text-lg font-bold text-sky-300 tabular-nums">
                    {Math.max(...FORECAST_144H.slice(0, 24).map((f) => f.rainSatelliteMmH)).toFixed(1)} mm/j
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2.5">
                  <div className="text-[10px] text-slate-400">Kecepatan Angin Maks</div>
                  <div className="mt-1 text-lg font-bold text-amber-300 tabular-nums">
                    {Math.max(...FORECAST_144H.slice(0, 24).map((f) => f.windSpeedMs)).toFixed(1)} m/s
                  </div>
                </div>
                <div className="col-span-2 rounded-lg bg-slate-900 p-2.5">
                  <div className="text-[10px] text-slate-400">Status Integrasi GNSS-RO & BMKG</div>
                  <div className="mt-1 text-xs font-semibold text-emerald-400">
                    Sinkronisasi 2×/hari Aktif • 42 Parameter Atmosfer Termuat
                  </div>
                </div>
              </div>
            </div>

            {/* Tile 8: Server & VPN */}
            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
              <div className="mb-2 text-xs font-bold text-sky-400">8. Kesehatan VPN & Server Historian</div>
              <div className="space-y-1.5 text-xs">
                {vpnTunnels.slice(0, 5).map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded bg-slate-900 px-2.5 py-1">
                    <span className="font-mono text-[11px]">{v.stationCode}</span>
                    <span className="text-slate-400">{v.tunnelType}</span>
                    <span
                      className={`font-semibold ${
                        v.status === 'Terhubung'
                          ? 'text-emerald-400'
                          : v.status === 'Degradasi'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {v.status} ({v.latencyMs}ms)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preset Siaga: 8 critical panels */}
            <div className="flex flex-col rounded-xl border border-rose-500/40 bg-slate-950 p-2.5">
              <div className="mb-1.5 text-xs font-bold text-rose-400">1. Peta Zona Banjir & Jalur Evakuasi</div>
              <SumbarMap
                stations={stations}
                selectedStationId={criticalStation.id}
                onSelectStation={setSelectedStationId}
                showSatelliteRain
                evacuationZones={EVACUATION_ZONES}
                compact
              />
            </div>

            <div className="flex flex-col rounded-xl border border-rose-500/40 bg-slate-950 p-2.5">
              <div className="mb-2 text-xs font-bold text-rose-400">2. Skema Hulu–Hilir & ETA Eskalasi</div>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
                  <div className="text-[11px] text-amber-300">Pos Kritis Utama</div>
                  <div className="text-sm font-bold text-white">{criticalStation.name}</div>
                  <div className="mt-1 flex items-center justify-between tabular-nums">
                    <span>TMA: {criticalStation.waterLevelM.toFixed(2)} m</span>
                    <span className="text-rose-300">+{criticalStation.fluctuationCmH} cm/jam</span>
                  </div>
                  <div className="mt-1 text-[11px] text-sky-300">
                    {criticalStation.escalationEtaText ?? 'Pemantauan intensif'} ({criticalStation.escalationUncertaintyText ?? '± 15 mnt'})
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 p-2 text-[11px] text-slate-300">
                  Alur Propagasi: <strong>ARR Limau Manis</strong> (40 mnt) → <strong>AWLR Gn. Nago</strong> (35 mnt) → <strong>AWLR Pasar Baru</strong> → <strong>Muara Padang</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-rose-500/40 bg-slate-950 p-2.5">
              <div className="mb-1.5 text-xs font-bold text-rose-400">3. Hidrograf & Hujan Kritis</div>
              <HydrographChart station={criticalStation} series={criticalSeries} height={210} />
            </div>

            <div className="flex flex-col rounded-xl border border-rose-500/40 bg-slate-950 p-2.5">
              <div className="mb-1.5 text-xs font-bold text-rose-400">4. CCTV Titik Kritis ({criticalStation.code})</div>
              <CctvFeedCard station={criticalStation} />
            </div>

            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <ShieldAlert className="h-4 w-4" /> 5. Antrean Alarm Aktif
              </div>
              <div className="space-y-1.5 overflow-y-auto text-[11px]">
                {alarms.slice(0, 4).map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                    <div className="font-semibold text-white">{a.title}</div>
                    <div className="text-slate-400">{a.stationName} • {a.timestampWib}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <Radio className="h-4 w-4" /> 6. Log WA/SMS & Eskalasi SLA
              </div>
              <div className="space-y-1.5 overflow-y-auto text-[11px]">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-emerald-400">{n.channel} • {n.recipient}</span>
                      <span className="text-amber-300">{n.deliveryStatus}</span>
                    </div>
                    <div className="mt-0.5 truncate text-slate-400">{n.message}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> 7. Progres SOP BWS–BPBD–Pemda
              </div>
              <div className="mb-2 text-lg font-bold tabular-nums text-white">
                {completedSop} / {sopSteps.length} Tindakan Selesai
              </div>
              <div className="space-y-1 overflow-y-auto text-[11px]">
                {sopSteps.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center gap-2 rounded bg-slate-900 px-2 py-1">
                    <span className={s.completed ? 'text-emerald-400' : 'text-amber-400'}>
                      {s.completed ? '✓' : '○'}
                    </span>
                    <span className="font-bold text-sky-300">{s.agency}</span>
                    <span className="truncate text-slate-300">{s.task}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 p-2.5">
              <div className="mb-2 text-xs font-bold text-rose-400">8. Penduduk Terdampak Zona Kritis</div>
              <div className="space-y-1.5 text-xs">
                {EVACUATION_ZONES.map((ez) => (
                  <div key={ez.id} className="rounded-lg bg-slate-900 p-2">
                    <div className="flex justify-between font-semibold">
                      <span>Kel. {ez.kelurahan}</span>
                      <span className="text-rose-400 tabular-nums">{ez.populationAtRisk.toLocaleString('id-ID')} jiwa</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Titik Kumpul: {ez.assemblyPoint}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
