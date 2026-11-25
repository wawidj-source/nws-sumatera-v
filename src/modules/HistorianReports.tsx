import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Upload } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { generateStationSeries } from '../data/mockData';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';
import { ModalDialog } from '../components/ModalDialog';
import { TimeSeriesPoint } from '../types/sda';

type PeriodMode = 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan';
type TrendMode = '5-Menitan' | 'Jam (Rata-rata)' | 'Jam (Puncak)';

export const HistorianReports: React.FC = () => {
  const { stations, selectedStationId, setSelectedStationId, importedCsvRows, importCsvRows } = useApp();
  const [periodMode, setPeriodMode] = useState<PeriodMode>('Harian');
  const [trendMode, setTrendMode] = useState<TrendMode>('5-Menitan');
  const [startDate, setStartDate] = useState('2026-11-24');
  const [endDate, setEndDate] = useState('2026-11-25');
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState(
    'timestamp,stationId,waterLevelM,rainfallMm,sourceApp\n16:55,pos-kuranji-gn,2.89,22.4,Logger-Eksisting-V1\n17:00,pos-kuranji-gn,2.94,25.0,Logger-Eksisting-V1'
  );
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const station = stations.find((s) => s.id === selectedStationId) ?? stations[0];
  const baseSeries = useMemo(() => generateStationSeries(station).filter((p) => p.forecastWaterLevelM === undefined), [station]);

  const displaySeries = useMemo(() => {
    const merged: TimeSeriesPoint[] = [
      ...baseSeries,
      ...importedCsvRows
        .filter((r) => r.stationId === station.id)
        .map((r) => ({
          timestamp: `${r.timestamp} (CSV)`,
          stationId: r.stationId,
          waterLevelM: r.waterLevelM,
          waterLevelMdpl: Number((station.elevationMdpl + r.waterLevelM).toFixed(2)),
          rainfallMm: r.rainfallMm,
          dischargeM3s: Number((12.5 * Math.pow(Math.max(0.2, r.waterLevelM - 0.3), 1.65)).toFixed(1)),
        })),
    ];

    if (trendMode === '5-Menitan') return merged;
    const grouped = new Map<string, TimeSeriesPoint[]>();
    for (const pt of merged) {
      const hr = pt.timestamp.slice(0, 2) + ':00';
      grouped.set(hr, [...(grouped.get(hr) ?? []), pt]);
    }
    return Array.from(grouped.entries()).map(([hr, list]) => {
      const avgWl = list.reduce((a, b) => a + b.waterLevelM, 0) / list.length;
      const peakWl = Math.max(...list.map((b) => b.waterLevelM));
      const wl = trendMode === 'Jam (Puncak)' ? peakWl : avgWl;
      const rain = list.reduce((a, b) => a + b.rainfallMm, 0) / list.length;
      return {
        timestamp: hr,
        stationId: station.id,
        waterLevelM: Number(wl.toFixed(2)),
        waterLevelMdpl: Number((station.elevationMdpl + wl).toFixed(2)),
        rainfallMm: Number(rain.toFixed(1)),
        dischargeM3s: Number((12.5 * Math.pow(Math.max(0.2, wl - 0.3), 1.65)).toFixed(1)),
      };
    });
  }, [baseSeries, importedCsvRows, station, trendMode]);

  const max24h = Math.max(...displaySeries.map((d) => d.waterLevelM));
  const min24h = Math.min(...displaySeries.map((d) => d.waterLevelM));
  const avg24h = displaySeries.reduce((a, b) => a + b.waterLevelM, 0) / Math.max(1, displaySeries.length);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setStatusFeedback(`Berkas ${filename} berhasil diekspor.`);
  };

  const handleExportCsv = () => {
    const header = 'timestamp_wib,station_code,water_level_m,elev_mdpl,rainfall_mm_h,discharge_m3s\n';
    const body = displaySeries
      .map((r) => `${r.timestamp},${station.code},${r.waterLevelM},${r.waterLevelMdpl},${r.rainfallMm},${r.dischargeM3s}`)
      .join('\n');
    downloadFile(header + body, `historian-${station.code}-${periodMode.toLowerCase()}.csv`, 'text/csv;charset=utf-8');
  };

  const handleExportExcel = () => {
    const rowsHtml = displaySeries
      .map(
        (r) =>
          `<tr><td>${r.timestamp}</td><td>${station.code}</td><td>${r.waterLevelM}</td><td>${r.waterLevelMdpl}</td><td>${r.rainfallMm}</td><td>${r.dischargeM3s}</td></tr>`
      )
      .join('');
    const html = `<html><head><meta charset="utf-8"/></head><body><h3>Laporan ${periodMode} BWS Sumatera V - ${station.name}</h3><table border="1"><tr><th>Waktu WIB</th><th>Kode Pos</th><th>TMA (m)</th><th>Elevasi (+mdpl)</th><th>Hujan (mm/j)</th><th>Debit (m3/s)</th></tr>${rowsHtml}</table></body></html>`;
    downloadFile(html, `laporan-${periodMode.toLowerCase()}-${station.code}.xls`, 'application/vnd.ms-excel');
  };

  const handleExportCalibration = () => {
    const payload = {
      stationCode: station.code,
      stationName: station.name,
      das: station.das,
      period: `${startDate} s.d. ${endDate}`,
      ratingCurve: { formula: 'Q = a * (H - H0)^b', a: 12.5, h0: 0.3, b: 1.65 },
      timeSeries5Min: displaySeries,
    };
    downloadFile(JSON.stringify(payload, null, 2), `kalibrasi-model-${station.code}.json`, 'application/json');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines
      .slice(1)
      .map((line) => {
        const [timestamp, stationId, wl, rain, sourceApp] = line.split(',');
        return {
          timestamp: timestamp?.trim() || '17:00',
          stationId: stationId?.trim() || station.id,
          waterLevelM: Number(wl) || 2.5,
          rainfallMm: Number(rain) || 10,
          sourceApp: sourceApp?.trim() || 'Pihak Ketiga',
        };
      })
      .filter((r) => !Number.isNaN(r.waterLevelM));

    importCsvRows(parsed);
    setImportOpen(false);
    setStatusFeedback(`Berhasil mengimpor ${parsed.length} baris CSV dari aplikasi pihak ketiga ke Historian.`);
  };

  const columns: TableColumn<TimeSeriesPoint>[] = [
    { key: 'timestamp', label: 'Waktu (WIB)', isRowHeader: true, render: (r) => <span className="tabular-nums">{r.timestamp}</span> },
    { key: 'wl', label: 'Muka Air (m)', align: 'right', render: (r) => <span className="font-bold tabular-nums">{r.waterLevelM.toFixed(2)} m</span> },
    { key: 'mdpl', label: 'Elevasi (+mdpl)', align: 'right', render: (r) => <span className="tabular-nums text-[var(--brand-accent)]">+{r.waterLevelMdpl.toFixed(2)}</span> },
    { key: 'rain', label: 'Curah Hujan', align: 'right', render: (r) => <span className="tabular-nums text-sky-400">{r.rainfallMm.toFixed(1)} mm/j</span> },
    { key: 'q', label: 'Debit (Rating Curve)', align: 'right', render: (r) => <span className="tabular-nums">{r.dischargeM3s.toFixed(1)} m³/s</span> },
  ];

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1">
            <label className="text-xs">
              <span className="block mb-1 font-semibold text-[var(--text-secondary)]">Pilih Pos Hidrologi</span>
              <select
                value={station.id}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)]"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="block mb-1 font-semibold text-[var(--text-secondary)]">Periode Laporan</span>
              <select
                value={periodMode}
                onChange={(e) => setPeriodMode(e.target.value as PeriodMode)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)]"
              >
                {(['Harian', 'Mingguan', 'Bulanan', 'Tahunan'] as PeriodMode[]).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="block mb-1 font-semibold text-[var(--text-secondary)]">Resolusi &amp; Tren</span>
              <select
                value={trendMode}
                onChange={(e) => setTrendMode(e.target.value as TrendMode)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)]"
              >
                <option value="5-Menitan">Historian 5-Menitan (Arsip Permanen)</option>
                <option value="Jam (Rata-rata)">Tren Jam (Rata-rata)</option>
                <option value="Jam (Puncak)">Tren Jam (Puncak)</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label>
                <span className="block mb-1 font-semibold text-[var(--text-secondary)]">Dari</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-2 text-xs"
                />
              </label>
              <label>
                <span className="block mb-1 font-semibold text-[var(--text-secondary)]">Sampai</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-2 text-xs"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Ekspor Excel (.xls)
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
            >
              <FileText className="h-3.5 w-3.5" /> Cetak / Ekspor PDF
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> Ekspor CSV Mentah
            </button>
            <button
              type="button"
              onClick={handleExportCalibration}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/20"
            >
              <Download className="h-3.5 w-3.5" /> Ekspor Kalibrasi Model (JSON)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-accent)] px-3 py-1.5 text-xs font-bold text-slate-950"
          >
            <Upload className="h-3.5 w-3.5" /> Impor CSV Pihak Ketiga
          </button>
        </div>

        {statusFeedback && (
          <div className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
            {statusFeedback}
          </div>
        )}
      </div>

      {/* 24h Min/Max/Avg Summary */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="text-xs text-[var(--text-secondary)]">Nilai Maksimum per 24 Jam</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-rose-400">{max24h.toFixed(2)} m</div>
          <div className="text-[11px] text-[var(--text-secondary)]">+{(station.elevationMdpl + max24h).toFixed(2)} mdpl</div>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="text-xs text-[var(--text-secondary)]">Nilai Minimum per 24 Jam</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-400">{min24h.toFixed(2)} m</div>
          <div className="text-[11px] text-[var(--text-secondary)]">+{(station.elevationMdpl + min24h).toFixed(2)} mdpl</div>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="text-xs text-[var(--text-secondary)]">Rata-Rata Periode ({periodMode})</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-sky-400">{avg24h.toFixed(2)} m</div>
          <div className="text-[11px] text-[var(--text-secondary)]">Arsip Permanen TimescaleDB 5-Menit</div>
        </div>
      </section>

      <ResponsiveTable
        caption={`Tabel Data Historian ${trendMode} — ${station.name} (${startDate} s.d. ${endDate})`}
        columns={columns}
        rows={displaySeries}
        rowKey={(r) => r.timestamp}
      />

      {/* Native Modal Dialog for CSV Import */}
      <ModalDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Impor CSV dari Aplikasi Pihak Ketiga"
        subtitle="Format: timestamp,stationId,waterLevelM,rainfallMm,sourceApp"
      >
        <form onSubmit={handleImportSubmit} className="space-y-3 text-xs">
          <p className="text-[var(--text-secondary)]">
            Tempelkan data CSV dari logger pihak ketiga atau unduhan aplikasi eksternal. Sistem otomatis menormalisasi zona waktu ke WIB dan mengonversi elevasi +mdpl.
          </p>
          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 font-mono text-xs text-[var(--text-primary)]"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--brand-accent)] px-4 py-1.5 font-bold text-slate-950"
            >
              Validasi &amp; Impor ke Historian
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
