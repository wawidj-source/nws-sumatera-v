import React, { useState } from 'react';
import {
  Camera,
  CheckSquare,
  ClipboardCheck,
  MapPinned,
  Printer,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EVACUATION_ZONES } from '../data/mockData';
import { SumbarMap } from '../components/SumbarMap';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';
import { EvacuationZone } from '../types/sda';
import { StatusBadge } from '../components/StatusBadge';

export const DisasterFieldModule: React.FC = () => {
  const {
    stations,
    selectedStationId,
    setSelectedStationId,
    sopSteps,
    toggleSopStep,
    fieldReports,
    submitFieldReport,
    syncOfflineFieldReports,
  } = useApp();

  const [tab, setTab] = useState<'sop' | 'evacuation' | 'actions' | 'android'>('sop');
  const [agencyFilter, setAgencyFilter] = useState<'ALL' | 'BWS' | 'BPBD' | 'Pemda'>('ALL');
  const [postEvalNote, setPostEvalNote] = useState(
    'Evaluasi sementara: Pintu penguras Kampung Koto merespons cepat; perlu pembersihan sedimen hulu jembatan.'
  );
  const [evalSaved, setEvalSaved] = useState(false);

  // Android MVP Simulator State
  const [androidOffline, setAndroidOffline] = useState(false);
  const [androidStationId, setAndroidStationId] = useState(stations[0].id);
  const [manualGauge, setManualGauge] = useState('2.88');
  const [manualNote, setManualNote] = useState('Mistar duga terbaca jelas, aliran membawa material ranting.');
  const [confirmSopTap, setConfirmSopTap] = useState(true);
  const [photoCaptured, setPhotoCaptured] = useState(true);

  const filteredSop = sopSteps.filter((s) => agencyFilter === 'ALL' || s.agency === agencyFilter);
  const pendingOfflineCount = fieldReports.filter((r) => !r.synced).length;
  const androidStation = stations.find((s) => s.id === androidStationId) ?? stations[0];

  const evacColumns: TableColumn<EvacuationZone>[] = [
    { key: 'kel', label: 'Kelurahan / Kec.', isRowHeader: true, render: (r) => `${r.kelurahan} (${r.kecamatan})` },
    { key: 'das', label: 'DAS & Pemicu', render: (r) => `${r.das} • ${r.triggerStatus}` },
    { key: 'pop', label: 'Penduduk Terdampak', align: 'right', render: (r) => <span className="font-bold tabular-nums">{r.populationAtRisk.toLocaleString('id-ID')} jiwa (Rentan: {r.vulnerablePeople})</span> },
    { key: 'fac', label: 'Fasilitas Vital (BPBD/Pemda)', render: (r) => r.vitalFacilities.join(', ') },
    { key: 'point', label: 'Titik Kumpul & Rute', render: (r) => `${r.assemblyPoint} — ${r.routeSummary}` },
  ];

  const handleAndroidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFieldReport({
      stationId: androidStation.id,
      stationName: androidStation.name,
      officerName: 'Budi Santoso (Petugas Pos)',
      manualStaffGaugeM: Number(manualGauge) || androidStation.waterLevelM,
      gpsCoord: `${androidStation.lat.toFixed(4)}, ${androidStation.lon.toFixed(4)}`,
      photoLabel: photoCaptured ? `Foto_${androidStation.code}_${Date.now().toString().slice(-4)}.jpg` : 'Tanpa Foto',
      notes: manualNote,
      synced: !androidOffline,
      sopConfirmed: confirmSopTap,
    });
  };

  return (
    <div className="space-y-5">
      {/* Module Header & Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Modul Respons Bencana &amp; Aplikasi Lapangan Android (MVP)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            SOP Mitigasi Digital (BWS–BPBD–Pemda), WebGIS Jalur Evakuasi, Saran Tindakan Pra/Saat/Pasca, serta Simulator Aplikasi Android Petugas Pos.
          </p>
        </div>

        <div className="inline-flex flex-wrap rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1 text-xs">
          {[
            { id: 'sop', label: '1. SOP Mitigasi Digital' },
            { id: 'evacuation', label: '2. Pola & Jalur Evakuasi' },
            { id: 'actions', label: '3. Saran Pra/Saat/Pasca' },
            { id: 'android', label: '4. Aplikasi Android MVP' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as typeof tab)}
              className={`rounded-md px-3 py-1.5 font-semibold transition ${
                tab === t.id ? 'bg-[var(--brand-accent)] text-slate-950' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SOP Digital */}
      {tab === 'sop' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="font-bold text-[var(--text-primary)]">
                  Versi SOP Disahkan: <span className="text-emerald-400">SOP-BWS5-EWS v2.4 (Disahkan Pimpinan 25/11/2026)</span>
                </div>
                <div className="text-[var(--text-secondary)]">
                  Setiap klik daftar periksa otomatis mencatat jejak pelaksanaan (siapa, kapan, apa).
                </div>
              </div>
            </div>
            <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-0.5">
              {(['ALL', 'BWS', 'BPBD', 'Pemda'] as const).map((ag) => (
                <button
                  key={ag}
                  type="button"
                  onClick={() => setAgencyFilter(ag)}
                  className={`rounded-md px-2.5 py-1 font-semibold ${
                    agencyFilter === ag ? 'bg-[var(--brand-accent)] text-slate-950' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {ag === 'ALL' ? 'Semua Instansi' : ag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredSop.map((step) => (
              <label
                key={step.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                  step.completed
                    ? 'border-emerald-500/35 bg-emerald-500/5'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-muted)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => toggleSopStep(step.id)}
                  className="mt-1 h-4 w-4"
                />
                <div className="flex-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[var(--surface-elevated)] px-2 py-0.5 font-bold">{step.siagaLevel}</span>
                    <span className="rounded bg-sky-500/15 px-2 py-0.5 font-bold text-sky-400">{step.agency}</span>
                    <span className="text-[var(--text-secondary)]">PIC: {step.pic}</span>
                  </div>
                  <p className={`mt-1.5 font-medium ${step.completed ? 'line-through opacity-75' : 'text-[var(--text-primary)]'}`}>
                    {step.task}
                  </p>
                  {step.completed && (
                    <div className="mt-1 text-[11px] text-emerald-400">
                      ✓ Dilaksanakan oleh <strong>{step.completedBy}</strong> pada {step.completedAtWib}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Pola & Jalur Evakuasi */}
      {tab === 'evacuation' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5">
            <div className="flex items-center gap-2 text-xs">
              <MapPinned className="h-4 w-4 text-rose-400" />
              <span>
                WebGIS Zona Terdampak, Jalur Evakuasi, Titik Kumpul Aman &amp; Data Penduduk/Fasilitas (Sumber: BPBD &amp; Pemda Sumbar)
              </span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
            >
              <Printer className="h-3.5 w-3.5" /> Cetak Peta Evakuasi per Kelurahan
            </button>
          </div>

          <SumbarMap
            stations={stations}
            selectedStationId={selectedStationId}
            onSelectStation={setSelectedStationId}
            evacuationZones={EVACUATION_ZONES}
          />

          <ResponsiveTable
            caption="Data Zona Terdampak, Titik Kumpul, Penduduk Rentan & Fasilitas Vital per Kelurahan"
            columns={evacColumns}
            rows={EVACUATION_ZONES}
            rowKey={(r) => r.id}
          />
        </div>
      )}

      {/* TAB 3: Saran & Tindakan Pra, Saat, Pasca */}
      {tab === 'actions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                phase: 'PRA-BENCANA (Normal – Siaga IV)',
                color: 'border-sky-500/40 bg-sky-500/5',
                items: [
                  'Verifikasi pembacaan pos AWLR/ARR & bersihkan saringan penakar hujan.',
                  'Pantau peta soil moisture 100×100 m & prakiraan satelit 6 hari.',
                  'Uji kesiapan sirine lokal dan jalur komunikasi WA/SMS BPBD–Kelurahan.',
                ],
              },
              {
                phase: 'SAAT BENCANA (Siaga III – Siaga I)',
                color: 'border-rose-500/40 bg-rose-500/5',
                items: [
                  'Aktifkan preset Videowall Siaga & kirim pesan berjenjang ke zona terdampak.',
                  'Operasikan pintu bendung/penguras sesuai elevasi aman & pantau pasang muara.',
                  'Buka titik kumpul kelurahan & evakuasi kelompok rentan sebelum puncak banjir.',
                ],
              },
              {
                phase: 'PASCA-BENCANA (Surut & Pemulihan)',
                color: 'border-emerald-500/40 bg-emerald-500/5',
                items: [
                  'Kirim tim surveyor ukur perubahan penampang akibat sedimentasi/gerusan.',
                  'Ekspor laporan per kejadian (PDF/Excel) & evaluasi pasca kejadian.',
                  'Kalibrasi ulang ambang Siaga dan lengkung debit berdasarkan puncak kejadian.',
                ],
              },
            ].map((card) => (
              <div key={card.phase} className={`rounded-xl border p-4 ${card.color}`}>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">{card.phase}</h3>
                <ul className="mt-2.5 space-y-2 text-xs text-[var(--text-secondary)]">
                  {card.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand-accent)]" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <ClipboardCheck className="h-4 w-4 text-emerald-400" /> Formulir Evaluasi Pasca Kejadian
            </h3>
            <textarea
              rows={3}
              value={postEvalNote}
              onChange={(e) => {
                setPostEvalNote(e.target.value);
                setEvalSaved(false);
              }}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-xs"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-emerald-400">
                {evalSaved ? '✓ Evaluasi pasca kejadian tersimpan ke log operasional.' : ''}
              </span>
              <button
                type="button"
                onClick={() => setEvalSaved(true)}
                className="rounded-lg bg-[var(--brand-accent)] px-4 py-1.5 text-xs font-bold text-slate-950"
              >
                Simpan Evaluasi Pasca Kejadian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Aplikasi Android Petugas Pos Hidrologi (MVP) */}
      {tab === 'android' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Phone Simulator */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[350px] rounded-[2rem] border-4 border-slate-700 bg-slate-950 p-3 text-slate-100 shadow-2xl">
              {/* Status bar */}
              <div className="flex items-center justify-between px-3 py-1 text-[11px] text-slate-300">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Smartphone className="h-3.5 w-3.5 text-sky-400" /> BWS5 Field MVP
                </span>
                <button
                  type="button"
                  onClick={() => setAndroidOffline((o) => !o)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    androidOffline ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {androidOffline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                  {androidOffline ? 'Mode Offline' : 'Online 4G'}
                </button>
              </div>

              {/* Alert banner inside app */}
              <div className="mt-2 rounded-xl border border-rose-500/40 bg-rose-500/15 p-2.5 text-[11px]">
                <div className="font-bold text-rose-300">Notifikasi Siaga Aktif</div>
                <div className="text-slate-200">
                  {androidStation.name}: {androidStation.waterLevelM.toFixed(2)} m ({androidStation.status.toUpperCase()})
                </div>
              </div>

              {/* Form inside app */}
              <form onSubmit={handleAndroidSubmit} className="mt-3 space-y-2.5 text-xs">
                <label className="block">
                  <span className="text-[10px] text-slate-400">Pos Tugas Lapangan</span>
                  <select
                    value={androidStationId}
                    onChange={(e) => setAndroidStationId(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs"
                  >
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label>
                    <span className="text-[10px] text-slate-400">Bacaan Mistar Manual (m)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={manualGauge}
                      onChange={(e) => setManualGauge(e.target.value)}
                      className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs tabular-nums"
                    />
                  </label>
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-1.5">
                    <div className="text-[10px] text-slate-400">Tag GPS Otomatis</div>
                    <div className="mt-0.5 font-mono text-[10px] text-sky-300">
                      {androidStation.lat.toFixed(4)}, {androidStation.lon.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px]">
                    <Camera className="h-4 w-4 text-sky-400" />
                    {photoCaptured ? 'Foto Mistar Terlampir ✓' : 'Belum ada foto'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPhotoCaptured((v) => !v)}
                    className="rounded bg-slate-800 px-2 py-1 text-[10px] font-semibold text-sky-300"
                  >
                    {photoCaptured ? 'Ambil Ulang' : 'Ambil Foto'}
                  </button>
                </div>

                <label className="block">
                  <span className="text-[10px] text-slate-400">Catatan Kondisi Lapangan</span>
                  <textarea
                    rows={2}
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs"
                  />
                </label>

                <label className="flex items-center gap-2 text-[11px] text-emerald-300">
                  <input
                    type="checkbox"
                    checked={confirmSopTap}
                    onChange={(e) => setConfirmSopTap(e.target.checked)}
                  />
                  Konfirmasi tindakan SOP lapangan selesai
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-500 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400"
                >
                  {androidOffline ? 'Simpan ke Antrean Offline' : 'Kirim & Sinkronkan ke Pusat'}
                </button>
              </form>
            </div>
          </div>

          {/* Sync Queue & Received Field Reports */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Laporan Petugas Lapangan &amp; Antrean Sinkronisasi Offline
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Aktifkan &ldquo;Mode Offline&rdquo; di simulator ponsel untuk menguji penyimpanan lokal sebelum sinkronisasi ke pusat.
                </p>
              </div>
              <button
                type="button"
                disabled={pendingOfflineCount === 0}
                onClick={syncOfflineFieldReports}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Sinkronkan Antrean ({pendingOfflineCount})
              </button>
            </div>

            <div className="space-y-2.5">
              {fieldReports.map((fr) => (
                <div key={fr.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-[var(--text-primary)]">
                      {fr.stationName} — <span className="text-[var(--brand-accent)]">Mistar Manual: {fr.manualStaffGaugeM.toFixed(2)} m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={fr.synced ? 'normal' : 'siaga3'} />
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {fr.synced ? 'Tersinkron ke Pusat' : 'Menunggu Sinkron (Offline)'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[var(--text-secondary)]">{fr.notes}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[var(--text-secondary)]">
                    <span>Petugas: {fr.officerName}</span>
                    <span>GPS: {fr.gpsCoord}</span>
                    <span>Foto: {fr.photoLabel}</span>
                    <span>SOP: {fr.sopConfirmed ? 'Terkonfirmasi ✓' : 'Belum'}</span>
                    <span>Waktu: {fr.timestampWib}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
