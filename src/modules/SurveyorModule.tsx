import React, { useState } from 'react';
import { CheckCircle2, Compass, Layers, Upload } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CROSS_SECTION_DATA } from '../data/mockData';
import { CrossSectionChart, RatingCurveChart } from '../components/HydroCharts';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';
import { ModalDialog } from '../components/ModalDialog';
import { DroneOrthoViewer } from '../components/DroneOrthoViewer';
import { SurveyVersion } from '../types/sda';

export const SurveyorModule: React.FC = () => {
  const { stations, surveys, addSurveyVersion, updateStationThresholds } = useApp();
  const [selectedSurveyStationId, setSelectedSurveyStationId] = useState(stations[0].id);
  const [ratingA, setRatingA] = useState(12.5);
  const [ratingH0, setRatingH0] = useState(0.3);
  const [ratingB, setRatingB] = useState(1.65);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileType, setFileType] = useState<SurveyVersion['fileType']>('Cross-Section CSV');
  const [crs, setCrs] = useState<SurveyVersion['crs']>('UTM Zona 47S (EPSG:32747)');
  const [note, setNote] = useState('Pengukuran penampang melintang baru pasca banjir.');
  const [feedback, setFeedback] = useState<string | null>(null);

  const station = stations.find((s) => s.id === selectedSurveyStationId) ?? stations[0];

  const columns: TableColumn<SurveyVersion>[] = [
    { key: 'date', label: 'Tanggal Survei', isRowHeader: true, render: (r) => <span className="tabular-nums">{r.surveyDate}</span> },
    { key: 'station', label: 'Pos Sungai', render: (r) => r.stationName },
    { key: 'type', label: 'Jenis Berkas', render: (r) => r.fileType },
    {
      key: 'crs',
      label: 'Validasi Koordinat',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" /> {r.crs}
        </span>
      ),
    },
    {
      key: 'sediment',
      label: 'Perubahan Alur',
      align: 'right',
      render: (r) => (
        <span className={`font-bold tabular-nums ${r.sedimentChangeCm >= 0 ? 'text-amber-400' : 'text-sky-400'}`}>
          {r.sedimentChangeCm >= 0 ? `+${r.sedimentChangeCm} cm (Sedimentasi)` : `${r.sedimentChangeCm} cm (Gerusan)`}
        </span>
      ),
    },
    {
      key: 'rc',
      label: 'Rating Curve',
      render: (r) => (
        <span className="font-mono text-[11px] tabular-nums">
          a={r.ratingA}, H0={r.ratingH0}, b={r.ratingB}
        </span>
      ),
    },
  ];

  const handleUploadSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    addSurveyVersion({
      stationId: station.id,
      stationName: station.name,
      surveyDate: '2026-11-25',
      surveyor: 'Tim Survei Hidrometri BWS V',
      fileType,
      crs,
      coordValid: true,
      sedimentChangeCm: 14,
      ratingA,
      ratingH0,
      ratingB,
      note,
    });
    setUploadOpen(false);
    setFeedback(`Data ${fileType} untuk ${station.name} berhasil divalidasi (${crs}) & disimpan ke riwayat versi.`);
  };

  const handleSyncThresholds = () => {
    updateStationThresholds(station.id, station.thresholds, station.pollingIntervalMin);
    setFeedback(`Parameter Lengkung Debit (a=${ratingA}, H0=${ratingH0}, b=${ratingB}) dan ambang Siaga ${station.name} disinkronkan.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Modul Pembaruan Data Badan Sungai dari Surveyor
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Unggah penampang melintang, topografi, dan foto udara drone dengan validasi koordinat WGS84 / UTM 47S, perbandingan alur antar-tahun, serta kalibrasi Lengkung Debit.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Pilih Pos Survei"
            value={selectedSurveyStationId}
            onChange={(e) => setSelectedSurveyStationId(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs"
          >
            {stations.filter((s) => s.type === 'AWLR').map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-accent)] px-3.5 py-2 text-xs font-bold text-slate-950"
          >
            <Upload className="h-4 w-4" /> Unggah Data Survei &amp; Drone
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
          {feedback}
        </div>
      )}

      {/* Charts: Cross Section Comparison + Rating Curve Editor */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-primary)]">
              <Layers className="h-4 w-4 text-amber-400" /> Perbandingan Perubahan Alur Sungai (2024 vs 2025 vs 2026)
            </h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-400">— 2024</span>
              <span className="text-sky-400">— 2025</span>
              <span className="text-amber-400 font-bold">— 2026 (+18 cm sedimentasi)</span>
            </div>
          </div>
          <CrossSectionChart data={CROSS_SECTION_DATA} />
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Deteksi otomatis: dasar alur pada jarak 18–30 m mengalami kenaikan elevasi dasar (+18 cm hingga +45 cm dibanding 2024) yang mengurangi kapasitas penampang basah.
          </p>
        </div>

        <div className="xl:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Pembaruan Lengkung Debit (Rating Curve): Q = a·(H − H₀)ᵇ
          </h3>
          <RatingCurveChart a={ratingA} h0={ratingH0} b={ratingB} />
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <label>
              <span className="block text-[10px] text-[var(--text-secondary)]">Koefisien a</span>
              <input
                type="number"
                step="0.1"
                value={ratingA}
                onChange={(e) => setRatingA(Number(e.target.value))}
                className="w-full rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 tabular-nums"
              />
            </label>
            <label>
              <span className="block text-[10px] text-[var(--text-secondary)]">Elevasi Nol H₀ (m)</span>
              <input
                type="number"
                step="0.05"
                value={ratingH0}
                onChange={(e) => setRatingH0(Number(e.target.value))}
                className="w-full rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 tabular-nums"
              />
            </label>
            <label>
              <span className="block text-[10px] text-[var(--text-secondary)]">Eksponen b</span>
              <input
                type="number"
                step="0.01"
                value={ratingB}
                onChange={(e) => setRatingB(Number(e.target.value))}
                className="w-full rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 tabular-nums"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleSyncThresholds}
            className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
          >
            Terapkan Rating Curve &amp; Sinkronkan Ambang Pos
          </button>
        </div>
      </section>

      {/* Drone Orthophoto & DEM GIS Inspector */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <DroneOrthoViewer
            station={station}
            sedimentChangeCm={surveys.find((sv) => sv.stationId === station.id)?.sedimentChangeCm ?? 18}
            surveyDate={surveys.find((sv) => sv.stationId === station.id)?.surveyDate ?? '2026-11-10'}
          />
        </div>
        <div className="xl:col-span-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <Compass className="h-4 w-4" /> Validasi Format &amp; Koordinat Otomatis
              </span>
              <span className="text-[11px] text-emerald-400">100% Lolos Verifikasi</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <li>✓ Format diterima: <strong className="text-[var(--text-primary)]">CSV Penampang, DXF/DWG Topografi, GeoTIFF Orthophoto &amp; DEM</strong></li>
              <li>✓ Proyeksi diperiksa: <strong className="text-[var(--text-primary)]">WGS84 (EPSG:4326) &amp; UTM Zona 47S (EPSG:32747)</strong></li>
              <li>✓ Ketelitian fotogrametri RTK: <strong className="text-[var(--text-primary)]">GSD 3.2 cm/px (RMSE H 1.8 cm / V 2.4 cm)</strong></li>
              <li>✓ Riwayat versi tersimpan permanen per pos dan per tanggal survei</li>
            </ul>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
            <div className="font-bold text-amber-300">Ringkasan Perubahan Morfologi Alur</div>
            <p className="mt-1 text-[var(--text-secondary)]">
              Teridentifikasi akumulasi gosong pasir tengah alur (+18 cm, estimasi volume ±412 m³) dan gerusan lokal di tebing kanan hilir. Disarankan pemutakhiran nilai ambang Siaga IV.
            </p>
          </div>
        </div>
      </section>

      <ResponsiveTable
        caption="Riwayat Versi Survei Badan Sungai per Pos & Tanggal"
        columns={columns}
        rows={surveys}
        rowKey={(r) => r.id}
      />

      <ModalDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Unggah Hasil Survei Badan Sungai"
        subtitle={`Pos Target: ${station.name} (${station.code})`}
      >
        <form onSubmit={handleUploadSurvey} className="space-y-3 text-xs">
          <label className="block">
            <span className="mb-1 block font-semibold">Jenis Berkas Survei</span>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as SurveyVersion['fileType'])}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2"
            >
              <option value="Cross-Section CSV">Cross-Section CSV</option>
              <option value="Topografi DXF">Topografi DXF</option>
              <option value="Drone Orthophoto GeoTIFF">Drone Orthophoto GeoTIFF</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">Sistem Koordinat (Validasi CRS)</span>
            <select
              value={crs}
              onChange={(e) => setCrs(e.target.value as SurveyVersion['crs'])}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2"
            >
              <option value="UTM Zona 47S (EPSG:32747)">UTM Zona 47S (EPSG:32747)</option>
              <option value="WGS84 (EPSG:4326)">WGS84 (EPSG:4326)</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">Catatan Perubahan Alur</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setUploadOpen(false)} className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 font-semibold">
              Batal
            </button>
            <button type="submit" className="rounded-lg bg-[var(--brand-accent)] px-4 py-1.5 font-bold text-slate-950">
              Validasi Koordinat &amp; Simpan Versi
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
