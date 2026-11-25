import React, { useState } from 'react';
import { BellRing, Check, CheckCheck, MessageSquareWarning, Send, Sliders } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';
import { AlarmEvent, NotificationLog } from '../types/sda';
import { StatusBadge } from '../components/StatusBadge';

export const AlarmNotificationModule: React.FC = () => {
  const {
    stations,
    alarms,
    notifications,
    acknowledgeAlarm,
    resolveAlarm,
    updateStationThresholds,
    sendTestNotification,
    simulateSlaEscalation,
  } = useApp();

  const [editStationId, setEditStationId] = useState(stations[0].id);
  const targetStation = stations.find((s) => s.id === editStationId) ?? stations[0];

  const [s4, setS4] = useState(targetStation.thresholds.siaga4);
  const [s3, setS3] = useState(targetStation.thresholds.siaga3);
  const [s2, setS2] = useState(targetStation.thresholds.siaga2);
  const [s1, setS1] = useState(targetStation.thresholds.siaga1);
  const [rainExt, setRainExt] = useState(targetStation.thresholds.rainExtremeMmH);
  const [intervalMin, setIntervalMin] = useState(targetStation.pollingIntervalMin);
  const [thresholdFeedback, setThresholdFeedback] = useState<string | null>(null);

  // WA/SMS Gateway Form
  const [zone, setZone] = useState('DAS Batang Kuranji (Padang)');
  const [roleTarget, setRoleTarget] = useState('BPBD & Operator Lapangan');
  const [channel, setChannel] = useState<'WhatsApp' | 'SMS'>('WhatsApp');
  const [templateText, setTemplateText] = useState(
    '[PERINGATAN DINI BWS SUMATERA V] Pos Gunung Nago status SIAGA III (TMA 2.85 m, hujan hulu 31.2 mm/j). Mohon konfirmasi baca dalam 5 menit.'
  );

  const handleSelectStation = (id: string) => {
    setEditStationId(id);
    const st = stations.find((s) => s.id === id);
    if (st) {
      setS4(st.thresholds.siaga4);
      setS3(st.thresholds.siaga3);
      setS2(st.thresholds.siaga2);
      setS1(st.thresholds.siaga1);
      setRainExt(st.thresholds.rainExtremeMmH);
      setIntervalMin(st.pollingIntervalMin);
    }
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateStationThresholds(
      editStationId,
      { siaga4: s4, siaga3: s3, siaga2: s2, siaga1: s1, rainExtremeMmH: rainExt },
      intervalMin
    );
    setThresholdFeedback(`Ambang & interval pembacaan (${intervalMin} mnt) untuk ${targetStation.name} berhasil diperbarui daring.`);
  };

  const alarmColumns: TableColumn<AlarmEvent>[] = [
    { key: 'time', label: 'Waktu', isRowHeader: true, render: (r) => <span className="tabular-nums">{r.timestampWib}</span> },
    { key: 'cat', label: 'Kategori', render: (r) => <span className="font-semibold text-sky-400">{r.category}</span> },
    { key: 'pos', label: 'Pos / DAS', render: (r) => `${r.stationName} (${r.das})` },
    { key: 'title', label: 'Kejadian Alarm', render: (r) => <div><div className="font-bold">{r.title}</div><div className="text-[11px] text-[var(--text-secondary)]">{r.detail}</div></div> },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
            r.status === 'Aktif'
              ? 'bg-rose-500/20 text-rose-400'
              : r.status === 'Diakui'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/15 text-emerald-400'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: 'act',
      label: 'Tindakan',
      render: (r) => (
        <div className="flex gap-1.5">
          {r.status === 'Aktif' && (
            <button
              type="button"
              onClick={() => acknowledgeAlarm(r.id)}
              className="inline-flex items-center gap-1 rounded bg-amber-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-500"
            >
              <Check className="h-3 w-3" /> Akui
            </button>
          )}
          {r.status !== 'Selesai' && (
            <button
              type="button"
              onClick={() => resolveAlarm(r.id)}
              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
            >
              <CheckCheck className="h-3 w-3" /> Selesai
            </button>
          )}
        </div>
      ),
    },
  ];

  const notifColumns: TableColumn<NotificationLog>[] = [
    { key: 'time', label: 'Waktu Kirim', isRowHeader: true, render: (r) => <span className="tabular-nums">{r.timestampWib}</span> },
    { key: 'chan', label: 'Kanal', render: (r) => <span className="font-bold text-emerald-400">{r.channel}</span> },
    { key: 'target', label: 'Zona & Peran', render: (r) => <div><div className="font-semibold">{r.recipient}</div><div className="text-[11px] text-[var(--text-secondary)]">{r.zone} • {r.roleTarget}</div></div> },
    { key: 'siaga', label: 'Level', render: (r) => <StatusBadge status={r.siagaLevel} /> },
    {
      key: 'receipt',
      label: 'Tanda Terima / SLA',
      render: (r) => (
        <div>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              r.deliveryStatus === 'Dibaca'
                ? 'bg-emerald-500/15 text-emerald-400'
                : r.deliveryStatus === 'Dieskalasi'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {r.deliveryStatus}
          </span>
          {r.readAtWib && <div className="mt-0.5 text-[10px] text-[var(--text-secondary)]">Dibaca: {r.readAtWib}</div>}
          {r.escalatedTo && <div className="mt-0.5 text-[10px] text-rose-400">→ {r.escalatedTo}</div>}
        </div>
      ),
    },
    {
      key: 'esc',
      label: 'Uji Eskalasi SLA',
      render: (r) =>
        r.deliveryStatus === 'Menunggu Baca' ? (
          <button
            type="button"
            onClick={() => simulateSlaEscalation(r.id)}
            className="rounded bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-500"
          >
            Simulasikan Tidak Dibaca → Eskalasi
          </button>
        ) : (
          <span className="text-[11px] text-[var(--text-secondary)]">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Alarm Engine Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
            <BellRing className="h-4 w-4 text-rose-400" /> Antrean Alarm Hidrologi, Teknis Pos &amp; Cuaca Ekstrem
          </h2>
        </div>
        <ResponsiveTable
          caption="Daftar Alarm Aktif & Riwayat Respons Operator"
          columns={alarmColumns}
          rows={alarms}
          rowKey={(r) => r.id}
        />
      </div>

      {/* Online Threshold Editor + WA/SMS Gateway Composer */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <form
          onSubmit={handleSaveThresholds}
          className="xl:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-3"
        >
          <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Sliders className="h-4 w-4 text-sky-400" /> Konfigurasi Ambang &amp; Interval Secara Daring
          </h3>

          <label className="block text-xs">
            <span className="mb-1 block font-semibold text-[var(--text-secondary)]">Pilih Pos</span>
            <select
              value={editStationId}
              onChange={(e) => handleSelectStation(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-xs"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <label>
              <span className="text-[var(--text-secondary)]">Siaga IV (m)</span>
              <input type="number" step="0.1" value={s4} onChange={(e) => setS4(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 tabular-nums" />
            </label>
            <label>
              <span className="text-[var(--text-secondary)]">Siaga III (m)</span>
              <input type="number" step="0.1" value={s3} onChange={(e) => setS3(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 tabular-nums" />
            </label>
            <label>
              <span className="text-[var(--text-secondary)]">Siaga II (m)</span>
              <input type="number" step="0.1" value={s2} onChange={(e) => setS2(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 tabular-nums" />
            </label>
            <label>
              <span className="text-[var(--text-secondary)]">Siaga I (m)</span>
              <input type="number" step="0.1" value={s1} onChange={(e) => setS1(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 tabular-nums" />
            </label>
            <label>
              <span className="text-[var(--text-secondary)]">Hujan Ekstrem (mm/j)</span>
              <input type="number" step="1" value={rainExt} onChange={(e) => setRainExt(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 tabular-nums" />
            </label>
            <label>
              <span className="text-[var(--text-secondary)]">Interval Akuisisi (Menit)</span>
              <select value={intervalMin} onChange={(e) => setIntervalMin(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5">
                <option value={1}>1 Menit (Siaga)</option>
                <option value={5}>5 Menit (Standar Historian)</option>
                <option value={15}>15 Menit</option>
              </select>
            </label>
          </div>

          {thresholdFeedback && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-xs text-emerald-400">
              {thresholdFeedback}
            </div>
          )}

          <button type="submit" className="w-full rounded-lg bg-[var(--brand-accent)] py-2 text-xs font-bold text-slate-950">
            Simpan Perubahan Ambang &amp; Interval (Tercatat Audit)
          </button>
        </form>

        <div className="xl:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <MessageSquareWarning className="h-4 w-4 text-emerald-400" /> Gateway Notifikasi WA / SMS (Langganan 12 Bulan)
            </h3>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              SLA Eskalasi Otomatis Aktif (300 dtk)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
            <label>
              <span className="text-[var(--text-secondary)]">Zona / DAS Target</span>
              <input value={zone} onChange={(e) => setZone(e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5" />
            </label>
            <label>
              <span className="text-[var(--text-secondary)]">Peran Penerima</span>
              <select value={roleTarget} onChange={(e) => setRoleTarget(e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5">
                <option>BPBD &amp; Operator Lapangan</option>
                <option>Pimpinan BWS Sumatera V</option>
                <option>Petugas Pos &amp; Pemda Kelurahan</option>
              </select>
            </label>
            <label>
              <span className="text-[var(--text-secondary)]">Kanal Utama</span>
              <select value={channel} onChange={(e) => setChannel(e.target.value as 'WhatsApp' | 'SMS')} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5">
                <option value="WhatsApp">WhatsApp Gateway (Read Receipt)</option>
                <option value="SMS">SMS Gateway (Fallback SLA)</option>
              </select>
            </label>
          </div>

          <label className="block text-xs">
            <span className="text-[var(--text-secondary)]">Templat Pesan Per Status</span>
            <textarea
              rows={3}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5 text-xs"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => sendTestNotification(zone, roleTarget, channel, templateText)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Send className="h-3.5 w-3.5" /> Kirim Notifikasi Uji Berjenjang
            </button>
          </div>
        </div>
      </section>

      <ResponsiveTable
        caption="Log Pengiriman WA/SMS, Tanda Terima Baca & Eskalasi Otomatis"
        columns={notifColumns}
        rows={notifications}
        rowKey={(r) => r.id}
      />
    </div>
  );
};
