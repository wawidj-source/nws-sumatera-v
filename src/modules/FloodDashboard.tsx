import React, { useMemo, useState } from 'react';
import { ArrowRight, Clock, Flame, RotateCcw, ShieldAlert } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { HydrographChart } from '../components/HydroCharts';
import { generateStationSeries } from '../data/mockData';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';
import { AuditEntry } from '../types/sda';

export const FloodDashboard: React.FC = () => {
  const {
    stations,
    audits,
    triggerExtremeFloodSimulation,
    resetNormalSimulation,
    selectedStationId,
    setSelectedStationId,
  } = useApp();

  const [selectedDas, setSelectedDas] = useState<'DAS Batang Kuranji' | 'DAS Batang Arau'>('DAS Batang Kuranji');

  const awlrStations = useMemo(
    () => stations.filter((s) => s.type === 'AWLR' || s.type === 'TIDE'),
    [stations]
  );

  const activeFocusStation =
    stations.find((s) => s.id === selectedStationId && s.type !== 'ARR') ??
    stations.find((s) => s.das === selectedDas && s.type === 'AWLR') ??
    awlrStations[0];

  const series = useMemo(() => generateStationSeries(activeFocusStation), [activeFocusStation]);

  const dasChain = useMemo(() => {
    if (selectedDas === 'DAS Batang Kuranji') {
      return [
        stations.find((s) => s.id === 'pos-kuranji-lm'),
        stations.find((s) => s.id === 'pos-kuranji-gn'),
        stations.find((s) => s.id === 'pos-kuranji-pb'),
        stations.find((s) => s.id === 'pos-tide-tb'),
      ].filter(Boolean);
    }
    return [
      stations.find((s) => s.id === 'pos-arau-lp'),
      stations.find((s) => s.id === 'pos-arau-kk'),
      stations.find((s) => s.id === 'pos-tide-tb'),
    ].filter(Boolean);
  }, [stations, selectedDas]);

  const auditColumns: TableColumn<AuditEntry>[] = [
    { key: 'time', label: 'Waktu (WIB)', isRowHeader: true, render: (r) => <span className="tabular-nums">{r.timestampWib}</span> },
    { key: 'actor', label: 'Aktor / Peran', render: (r) => `${r.actor} (${r.role})` },
    { key: 'action', label: 'Aksi', render: (r) => <span className="font-semibold text-[var(--brand-accent)]">{r.action}</span> },
    { key: 'detail', label: 'Rincian Perubahan Status / Ambang', render: (r) => r.detail },
  ];

  return (
    <div className="space-y-5">
      {/* Header Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Dashboard Banjir &amp; Peringatan Dini Berjenjang (Siaga IV–I)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Kenaikan status otomatis dari ambang batas, skema propagasi hulu–hilir, serta prediksi waktu eskalasi dengan rentang ketidakpastian.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerExtremeFloodSimulation}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-rose-500"
          >
            <Flame className="h-4 w-4" /> Simulasi Banjir Ekstrem (Siaga I)
          </button>
          <button
            type="button"
            onClick={resetNormalSimulation}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:opacity-90"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* Siaga IV-I Station Cards */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {awlrStations.slice(0, 4).map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setSelectedStationId(st.id)}
            className={`rounded-xl border p-4 text-left transition ${
              activeFocusStation.id === st.id
                ? 'border-[var(--brand-accent)] bg-sky-500/10'
                : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-muted)]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{st.name}</span>
              <StatusBadge status={st.status} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {st.waterLevelM.toFixed(2)} m
              </span>
              <span className="text-xs font-semibold text-sky-400 tabular-nums">
                +{(st.elevationMdpl + st.waterLevelM).toFixed(2)} mdpl
              </span>
            </div>
            {/* Threshold progress bar */}
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-elevated)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((st.waterLevelM / st.thresholds.siaga1) * 100))}%`,
                  backgroundColor:
                    st.status === 'siaga1'
                      ? '#f43f5e'
                      : st.status === 'siaga2'
                        ? '#fb923c'
                        : st.status === 'siaga3'
                          ? '#facc15'
                          : '#38bdf8',
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-[var(--text-secondary)]">
              <span>S4: {st.thresholds.siaga4}m</span>
              <span>S3: {st.thresholds.siaga3}m</span>
              <span>S2: {st.thresholds.siaga2}m</span>
              <span>S1: {st.thresholds.siaga1}m</span>
            </div>
            {st.escalationEtaText && (
              <div className="mt-2 flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-400">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{st.escalationEtaText}</span>
              </div>
            )}
          </button>
        ))}
      </section>

      {/* Hulu-Hilir Schematic + Combined Hydrograph */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Skema DAS Hulu → Hilir → Muara</h3>
            <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-0.5 text-xs">
              {(['DAS Batang Kuranji', 'DAS Batang Arau'] as const).map((das) => (
                <button
                  key={das}
                  type="button"
                  onClick={() => setSelectedDas(das)}
                  className={`rounded-md px-2.5 py-1 font-medium ${
                    selectedDas === das ? 'bg-[var(--brand-accent)] text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {das.replace('DAS ', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {dasChain.map((node, idx) => {
              if (!node) return null;
              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setSelectedStationId(node.id)}
                    className="cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 transition hover:border-[var(--brand-accent)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[var(--brand-accent)]">
                          {idx === 0 ? 'HULU (PEMICU)' : idx === dasChain.length - 1 ? 'MUARA / HILIR' : 'TENGAH'} • {node.code}
                        </span>
                        <div className="text-xs font-bold text-[var(--text-primary)]">{node.name}</div>
                      </div>
                      <StatusBadge status={node.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
                      <span>
                        {node.type === 'ARR'
                          ? `Hujan: ${node.rainfallMmH.toFixed(1)} mm/jam (24j: ${node.rainfall24hMm} mm)`
                          : `TMA: ${node.waterLevelM.toFixed(2)} m (+${(node.elevationMdpl + node.waterLevelM).toFixed(2)} mdpl)`}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        Elevasi Pos: +{node.elevationMdpl} mdpl
                      </span>
                    </div>
                  </div>
                  {idx < dasChain.length - 1 && (
                    <div className="flex items-center justify-center gap-2 text-[11px] text-sky-400">
                      <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                      <span>Waktu tempuh gelombang banjir: ± {node.travelTimeMin ?? 30} menit</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Grafik Muka Air, Hujan Terukur &amp; Prediksi Eskalasi — {activeFocusStation.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Garis hijau: TMA aktual • Garis oranye putus-putus: proyeksi eskalasi • Batang biru atas: curah hujan terukur
              </p>
            </div>
            <StatusBadge status={activeFocusStation.status} size="md" />
          </div>

          <HydrographChart station={activeFocusStation} series={series} height={270} />

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <ShieldAlert className="h-4 w-4" /> Prediksi Waktu Eskalasi
              </div>
              <div className="mt-1 font-bold text-[var(--text-primary)]">
                {activeFocusStation.escalationEtaText ?? 'Stabil di bawah ambang Siaga IV'}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                Ketidakpastian: {activeFocusStation.escalationUncertaintyText ?? '± 15 menit (Model B.5)'}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-xs">
              <div className="text-[var(--text-secondary)]">Laju Kenaikan Muka Air</div>
              <div className="mt-1 text-lg font-bold tabular-nums text-[var(--text-primary)]">
                {activeFocusStation.fluctuationCmH >= 0 ? `+${activeFocusStation.fluctuationCmH}` : activeFocusStation.fluctuationCmH} cm/jam
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">Interval baca: {activeFocusStation.pollingIntervalMin} menit</div>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-xs">
              <div className="text-[var(--text-secondary)]">Akumulasi Hujan 24 Jam</div>
              <div className="mt-1 text-lg font-bold tabular-nums text-sky-400">
                {activeFocusStation.rainfall24hMm.toFixed(1)} mm
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">Intensitas terkini: {activeFocusStation.rainfallMmH.toFixed(1)} mm/jam</div>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Trail */}
      <ResponsiveTable
        caption="Jejak Audit Perubahan Status Siaga & Ambang Batas (Immutable Log)"
        columns={auditColumns}
        rows={audits.slice(0, 8)}
        rowKey={(r) => r.id}
      />
    </div>
  );
};
