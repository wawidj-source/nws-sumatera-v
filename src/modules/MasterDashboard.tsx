import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CloudRain,
  MapPin,
  Radio,
  Search,
  Waves,
  Wifi,
  WifiOff,
  History,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { SumbarMap } from '../components/SumbarMap';
import { StatusBadge } from '../components/StatusBadge';
import { CctvFeedCard } from '../components/CctvPanel';
import { HydrographChart } from '../components/HydroCharts';
import { generateStationSeries } from '../data/mockData';

export const MasterDashboard: React.FC = () => {
  const { stations, selectedStationId, setSelectedStationId, alarms, audits, setActiveModule } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [wsFilter, setWsFilter] = useState<string>('ALL');
  const [showAllCctv, setShowAllCctv] = useState(false);

  const selectedStation = stations.find((s) => s.id === selectedStationId) ?? stations[0];
  const selectedSeries = useMemo(() => generateStationSeries(selectedStation), [selectedStation]);

  const wsList = useMemo(() => ['ALL', ...Array.from(new Set(stations.map((s) => s.ws)))], [stations]);

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const matchWs = wsFilter === 'ALL' || s.ws === wsFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.das.toLowerCase().includes(q) ||
        s.kabKota.toLowerCase().includes(q);
      return matchWs && matchQ;
    });
  }, [stations, wsFilter, searchQuery]);

  const dasSummary = useMemo(() => {
    const map = new Map<string, { das: string; ws: string; total: number; siaga: number; offline: number; maxRain: number }>();
    for (const s of stations) {
      const curr = map.get(s.das) ?? { das: s.das, ws: s.ws, total: 0, siaga: 0, offline: 0, maxRain: 0 };
      curr.total += 1;
      if (s.status === 'siaga1' || s.status === 'siaga2' || s.status === 'siaga3' || s.status === 'siaga4') {
        curr.siaga += 1;
      }
      if (!s.commOnline) curr.offline += 1;
      curr.maxRain = Math.max(curr.maxRain, s.rainfallMmH);
      map.set(s.das, curr);
    }
    return Array.from(map.values());
  }, [stations]);

  const onlineCount = stations.filter((s) => s.commOnline).length;
  const siagaCount = stations.filter((s) => ['siaga1', 'siaga2', 'siaga3', 'siaga4'].includes(s.status)).length;
  const activeAlarmsCount = alarms.filter((a) => a.status === 'Aktif').length;
  const maxRainNow = Math.max(...stations.map((s) => s.rainfallMmH));

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Pos Telemetri Terhubung</span>
            <Wifi className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {onlineCount}/{stations.length}
            </span>
            <span className="text-xs text-emerald-400">
              ({Math.round((onlineCount / stations.length) * 100)}% Online)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Akuisisi Modbus, MQTT, REST API &amp; BMKG via VPN
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Pos Status Waspada / Siaga</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-amber-400">{siagaCount} Pos</span>
            <span className="text-xs text-[var(--text-secondary)]">({activeAlarmsCount} alarm aktif)</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModule('flood')}
            className="mt-1 text-[11px] font-semibold text-[var(--brand-accent)] hover:underline"
          >
            Buka Dashboard Banjir →
          </button>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Intensitas Hujan Maksimal</span>
            <CloudRain className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-sky-400">{maxRainNow.toFixed(1)}</span>
            <span className="text-xs text-[var(--text-secondary)]">mm/jam</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
            Terukur di hulu DAS Kuranji &amp; Satelit LEO 3×3 km
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Pos Offline / Anomali QA-QC</span>
            <WifiOff className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-rose-400">
              {stations.length - onlineCount} Pos
            </span>
            <span className="text-xs text-[var(--text-secondary)]">Baterai &lt;11V terpantau</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModule('telemetry')}
            className="mt-1 text-[11px] font-semibold text-[var(--brand-accent)] hover:underline"
          >
            Periksa Konektor &amp; VPN →
          </button>
        </div>
      </section>

      {/* Main Map + Selected Station Inspector */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-3">
          <SumbarMap
            stations={filteredStations}
            selectedStationId={selectedStationId}
            onSelectStation={setSelectedStationId}
            showSatelliteRain
          />

          {/* Search & Station Selector Strip */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--text-secondary)]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama pos, kode, DAS, atau Kab/Kota..."
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] py-1.5 pr-3 pl-9 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                />
              </div>
              <select
                aria-label="Filter Wilayah Sungai"
                value={wsFilter}
                onChange={(e) => setWsFilter(e.target.value)}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              >
                {wsList.map((ws) => (
                  <option key={ws} value={ws}>
                    {ws === 'ALL' ? 'Semua Wilayah Sungai (WS)' : ws}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStations.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStationId(st.id)}
                  className={`flex items-center justify-between rounded-lg border p-2.5 text-left transition ${
                    st.id === selectedStationId
                      ? 'border-[var(--brand-accent)] bg-sky-500/10'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate text-xs font-semibold text-[var(--text-primary)]">{st.name}</div>
                    <div className="truncate text-[10px] text-[var(--text-secondary)]">
                      {st.code} • {st.das}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold tabular-nums text-[var(--text-primary)]">
                      {st.type === 'ARR' ? `${st.rainfallMmH} mm/j` : `${st.waterLevelM.toFixed(2)} m`}
                    </div>
                    <StatusBadge status={st.status} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Inspector: Selected Station Detail + CCTV + Mini Hydrograph */}
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-semibold text-[var(--brand-accent)]">
                  {selectedStation.code} • {selectedStation.protocol}
                </span>
                <h2 className="text-base font-bold text-[var(--text-primary)]">{selectedStation.name}</h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {selectedStation.das} • {selectedStation.kabKota}
                </p>
              </div>
              <StatusBadge status={selectedStation.status} size="md" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                <div className="text-[10px] text-[var(--text-secondary)]">Muka Air (Lokal / +mdpl)</div>
                <div className="mt-0.5 text-base font-bold tabular-nums text-[var(--text-primary)]">
                  {selectedStation.waterLevelM.toFixed(2)} m
                </div>
                <div className="text-[11px] tabular-nums text-[var(--brand-accent)]">
                  +{(selectedStation.elevationMdpl + selectedStation.waterLevelM).toFixed(2)} mdpl
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                <div className="text-[10px] text-[var(--text-secondary)]">Fluktuasi &amp; Hujan</div>
                <div className="mt-0.5 text-base font-bold tabular-nums text-[var(--text-primary)]">
                  {selectedStation.fluctuationCmH >= 0 ? `+${selectedStation.fluctuationCmH}` : selectedStation.fluctuationCmH} cm/j
                </div>
                <div className="text-[11px] tabular-nums text-sky-400">
                  Hujan: {selectedStation.rainfallMmH.toFixed(1)} mm/jam
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                <div className="text-[10px] text-[var(--text-secondary)]">Baterai &amp; Sinyal</div>
                <div className="mt-0.5 font-bold tabular-nums">
                  {selectedStation.batteryV.toFixed(1)} V / {selectedStation.signalDbm} dBm
                </div>
              </div>
              <div className="rounded-lg bg-[var(--surface-muted)] p-2.5">
                <div className="text-[10px] text-[var(--text-secondary)]">Latensi VPN &amp; Update</div>
                <div className="mt-0.5 font-bold tabular-nums">
                  {selectedStation.vpnLatencyMs} ms • {selectedStation.lastUpdateWib}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" /> Grafik Ringkas 3 Jam + Proyeksi
                </span>
                <span>Ambang S1: {selectedStation.thresholds.siaga1.toFixed(1)} m</span>
              </div>
              <HydrographChart station={selectedStation} series={selectedSeries} height={180} />
            </div>
          </div>

          {/* CCTV Panel */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                <Radio className="h-4 w-4 text-rose-400" /> Panel CCTV Pos Prioritas ({stations.filter((s) => s.hasCctv).length} Kamera)
              </h3>
              <button
                type="button"
                onClick={() => setShowAllCctv((v) => !v)}
                className="text-[11px] font-semibold text-[var(--brand-accent)] hover:underline"
              >
                {showAllCctv ? 'Tampilkan 2 Prioritas' : 'Lihat Semua Kamera'}
              </button>
            </div>
            <div className="space-y-2.5">
              {stations
                .filter((s) => s.hasCctv)
                .slice(0, showAllCctv ? 4 : 2)
                .map((st) => (
                  <CctvFeedCard key={st.id} station={st} />
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Ringkasan DAS/WS + Log Akses & Aktivitas */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Waves className="h-4 w-4 text-sky-400" /> Ringkasan Status per DAS &amp; Wilayah Sungai
          </h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {dasSummary.map((d) => (
              <div key={d.das} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">{d.das}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      d.siaga > 0
                        ? 'bg-amber-500/15 text-amber-400'
                        : d.offline > 0
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {d.siaga > 0 ? `${d.siaga} Pos Siaga` : d.offline > 0 ? `${d.offline} Pos Offline` : 'Semua Normal'}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[var(--text-secondary)]">{d.ws}</div>
                <div className="mt-2 flex items-center justify-between text-[11px] tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-sky-400" /> {d.total} Pos Aktif
                  </span>
                  <span className="text-sky-400">Hujan maks: {d.maxRain.toFixed(1)} mm/j</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <History className="h-4 w-4 text-sky-400" /> Log Akses &amp; Kejadian Terkini
          </h3>
          <div className="scroller max-h-64 space-y-2 overflow-y-auto pr-1 text-xs">
            {audits.slice(0, 8).map((a) => (
              <div key={a.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[var(--brand-accent)]">{a.action}</span>
                  <span className="tabular-nums text-[var(--text-secondary)]">{a.timestampWib}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--text-primary)]">{a.detail}</p>
                <div className="mt-1 text-[10px] text-[var(--text-secondary)]">
                  Aktor: {a.actor} ({a.role}) • {a.module}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
