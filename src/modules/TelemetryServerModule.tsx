import React, { useState } from 'react';
import { Cpu, Database, Lock, Plus, Server, ShieldCheck, Wifi } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';
import { ModalDialog } from '../components/ModalDialog';
import { Station, TelemetryProtocol, VpnTunnel } from '../types/sda';

export const TelemetryServerModule: React.FC = () => {
  const { stations, vpnTunnels, registerNewStation } = useApp();
  const [wizardOpen, setWizardOpen] = useState(false);

  const [code, setCode] = useState('AWLR-ANAI-03');
  const [name, setName] = useState('Pos Duga Air Kayu Tanam');
  const [type, setType] = useState<Station['type']>('AWLR');
  const [das, setDas] = useState('DAS Batang Anai');
  const [ws, setWs] = useState('WS Silaut - Tarusan / Padang');
  const [kabKota, setKabKota] = useState('Kab. Padang Pariaman');
  const [protocol, setProtocol] = useState<TelemetryProtocol>('Modbus TCP/IP');
  const [lat, setLat] = useState(-0.548);
  const [lon, setLon] = useState(100.335);
  const [elevationMdpl, setElevationMdpl] = useState(118.5);
  const [siaga4, setSiaga4] = useState(2.1);
  const [siaga3, setSiaga3] = useState(2.6);
  const [siaga2, setSiaga2] = useState(3.2);
  const [siaga1, setSiaga1] = useState(3.8);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerNewStation({
      code,
      name,
      type,
      das,
      ws,
      kabKota,
      protocol,
      lat,
      lon,
      elevationMdpl,
      siaga4,
      siaga3,
      siaga2,
      siaga1,
    });
    setWizardOpen(false);
    setFeedback(`Pos baru ${code} (${name}) berhasil didaftarkan tanpa mengubah kode via konektor ${protocol}. Cek Peta Master Dashboard!`);
  };

  const connectorStats = [
    { name: 'Modbus TCP/IP Listener', port: 'TCP :502 / VPN', activePos: stations.filter((s) => s.protocol === 'Modbus TCP/IP').length, health: 'Sehat • 142 pkt/mnt' },
    { name: 'Modbus RTU Gateway', port: 'RS-485 → IP Concentrator', activePos: stations.filter((s) => s.protocol === 'Modbus RTU').length, health: 'Sehat • 48 pkt/mnt' },
    { name: 'MQTT Broker (TLS 1.3)', port: 'MQTTS :8883', activePos: stations.filter((s) => s.protocol === 'MQTT').length, health: 'Sehat • 96 msg/mnt' },
    { name: 'REST API & Adaptor BMKG', port: 'HTTPS Webhook + XML/JSON', activePos: stations.filter((s) => s.protocol === 'REST API' || s.protocol === 'Adaptor BMKG').length, health: 'Sinkron 2×/hari & 5m' },
  ];

  const vpnColumns: TableColumn<VpnTunnel>[] = [
    { key: 'code', label: 'Kode Pos', isRowHeader: true, render: (r) => <span className="font-mono">{r.stationCode}</span> },
    { key: 'name', label: 'Nama Stasiun', render: (r) => r.stationName },
    { key: 'ip', label: 'IP Tunnel VPN', render: (r) => <span className="font-mono">{r.endpointIp}</span> },
    { key: 'type', label: 'Protokol VPN', render: (r) => r.tunnelType },
    {
      key: 'status',
      label: 'Status Komunikasi',
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            r.status === 'Terhubung'
              ? 'bg-emerald-500/15 text-emerald-400'
              : r.status === 'Degradasi'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    { key: 'lat', label: 'Latensi / Loss', align: 'right', render: (r) => <span className="tabular-nums">{r.latencyMs} ms ({r.packetLossPct}%)</span> },
    { key: 'up', label: 'Uptime 30h', align: 'right', render: (r) => <span className="tabular-nums font-semibold">{r.uptimePct}%</span> },
  ];

  const qaqcColumns: TableColumn<Station>[] = [
    { key: 'code', label: 'Pos', isRowHeader: true, render: (r) => `${r.code} (${r.protocol})` },
    { key: 'tz', label: 'Normalisasi Zona & Satuan', render: () => 'UTC+7 (WIB) • m / +mdpl / mm' },
    {
      key: 'oor',
      label: 'Out-of-Range',
      render: (r) => (r.qaqc.outOfRange ? <span className="text-rose-400 font-bold">Anomali</span> : <span className="text-emerald-400">Normal</span>),
    },
    {
      key: 'frz',
      label: 'Data Beku',
      render: (r) => (r.qaqc.frozenData ? <span className="text-rose-400 font-bold">Beku (&gt;30m)</span> : <span className="text-emerald-400">Dinamis</span>),
    },
    {
      key: 'gap',
      label: 'Data Hilang',
      render: (r) => (r.qaqc.missingGap ? <span className="text-amber-400 font-bold">Gap Terdeteksi</span> : <span className="text-emerald-400">Lengkap 5m</span>),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header + No-Code Onboarding CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Integrasi Telemetri Alat, QA/QC Otomatis, VPN Pusat–Lapangan &amp; Infrastruktur Server
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Konektor Modbus TCP/IP, Modbus RTU, MQTT, REST API, Adaptor BMKG, pendaftaran pos baru tanpa mengubah kode, dan monitoring klaster historian 5-menitan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-accent)] px-3.5 py-2 text-xs font-bold text-slate-950"
        >
          <Plus className="h-4 w-4" /> Daftar Pos Baru (No-Code)
        </button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
          {feedback}
        </div>
      )}

      {/* Protocol Connectors */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {connectorStats.map((c) => (
          <div key={c.name} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-primary)]">{c.name}</span>
              <Wifi className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-1 font-mono text-[11px] text-[var(--text-secondary)]">{c.port}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-sky-400 tabular-nums">{c.activePos} Pos Terhubung</span>
              <span className="text-[11px] text-emerald-400">{c.health}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Server Cluster & VAPT Security Cards */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Server className="h-4 w-4 text-sky-400" /> Kesehatan Klaster Server Pusat &amp; Historian 5-Menitan
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-lg bg-[var(--surface-muted)] p-3">
              <div className="flex items-center gap-1 text-[var(--text-secondary)]"><Cpu className="h-3.5 w-3.5" /> CPU Klaster</div>
              <div className="mt-1 text-lg font-bold tabular-nums text-emerald-400">28%</div>
              <div className="text-[10px] text-[var(--text-secondary)]">16 vCPU Linux HA</div>
            </div>
            <div className="rounded-lg bg-[var(--surface-muted)] p-3">
              <div className="flex items-center gap-1 text-[var(--text-secondary)]"><Server className="h-3.5 w-3.5" /> Memori RAM</div>
              <div className="mt-1 text-lg font-bold tabular-nums text-sky-400">42%</div>
              <div className="text-[10px] text-[var(--text-secondary)]">26.8 / 64 GB ECC</div>
            </div>
            <div className="rounded-lg bg-[var(--surface-muted)] p-3">
              <div className="flex items-center gap-1 text-[var(--text-secondary)]"><Database className="h-3.5 w-3.5" /> TimescaleDB</div>
              <div className="mt-1 text-lg font-bold tabular-nums text-amber-400">1.4 TB</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Arsip Permanen 5m</div>
            </div>
            <div className="rounded-lg bg-[var(--surface-muted)] p-3">
              <div className="flex items-center gap-1 text-[var(--text-secondary)]"><Lock className="h-3.5 w-3.5" /> Uptime SLA</div>
              <div className="mt-1 text-lg font-bold tabular-nums text-emerald-400">99.94%</div>
              <div className="text-[10px] text-[var(--text-secondary)]">Replikasi Multi-Node</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Status Uji Keamanan Independen (Web &amp; Android)
          </h3>
          <ul className="space-y-1.5 text-[var(--text-secondary)]">
            <li>✓ <strong className="text-[var(--text-primary)]">Uji Penetrasi (VAPT) Independen:</strong> Web &amp; Android MVP — 0 Temuan Kritis/Tinggi</li>
            <li>✓ <strong className="text-[var(--text-primary)]">Uji Beban (Load Test):</strong> 1.500 req/dtk &amp; 500 pengguna bersamaan — Lolos</li>
            <li>✓ <strong className="text-[var(--text-primary)]">Perbaikan &amp; Uji Ulang:</strong> Terverifikasi &amp; siap Commissioning/SAT</li>
          </ul>
        </div>
      </section>

      <ResponsiveTable
        caption="Status Terowongan VPN Pusat–Lapangan & Heartbeat Komunikasi"
        columns={vpnColumns}
        rows={vpnTunnels}
        rowKey={(r) => r.id}
      />

      <ResponsiveTable
        caption="Pipeline Normalisasi Satuan/WIB & Kendali Mutu Data Otomatis (QA/QC)"
        columns={qaqcColumns}
        rows={stations.slice(0, 6)}
        rowKey={(r) => r.id}
      />

      {/* No-Code Station Registration Modal */}
      <ModalDialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Pendaftaran Pos Telemetri Baru (Tanpa Mengubah Kode)"
        subtitle="Konfigurasi metadata pos, konektor protokol, dan ambang Siaga IV–I secara instan."
      >
        <form onSubmit={handleRegister} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className="font-semibold">Kode Pos</span>
              <input required value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5" />
            </label>
            <label>
              <span className="font-semibold">Nama Pos</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5" />
            </label>
            <label>
              <span className="font-semibold">Tipe Sensor</span>
              <select value={type} onChange={(e) => setType(e.target.value as Station['type'])} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5">
                <option value="AWLR">AWLR (Pos Duga Air)</option>
                <option value="ARR">ARR (Pos Hujan)</option>
                <option value="AWS">AWS (Stasiun Cuaca)</option>
                <option value="TIDE">TIDE (Pasang Surut)</option>
              </select>
            </label>
            <label>
              <span className="font-semibold">Protokol Akuisisi</span>
              <select value={protocol} onChange={(e) => setProtocol(e.target.value as TelemetryProtocol)} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5">
                <option value="Modbus TCP/IP">Modbus TCP/IP</option>
                <option value="Modbus RTU">Modbus RTU</option>
                <option value="MQTT">MQTT</option>
                <option value="REST API">REST API</option>
                <option value="Adaptor BMKG">Adaptor BMKG</option>
              </select>
            </label>
            <label>
              <span className="font-semibold">DAS</span>
              <input value={das} onChange={(e) => setDas(e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5" />
            </label>
            <label>
              <span className="font-semibold">Wilayah Sungai (WS)</span>
              <input value={ws} onChange={(e) => setWs(e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5" />
            </label>
            <label>
              <span className="font-semibold">Kabupaten/Kota</span>
              <input value={kabKota} onChange={(e) => setKabKota(e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5" />
            </label>
            <label>
              <span className="font-semibold">Elevasi Nol Mistar (+mdpl)</span>
              <input type="number" step="0.1" value={elevationMdpl} onChange={(e) => setElevationMdpl(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 tabular-nums" />
            </label>
            <label>
              <span className="font-semibold">Lintang (Latitude WGS84)</span>
              <input type="number" step="0.0001" value={lat} onChange={(e) => setLat(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 tabular-nums" />
            </label>
            <label>
              <span className="font-semibold">Bujur (Longitude WGS84)</span>
              <input type="number" step="0.0001" value={lon} onChange={(e) => setLon(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 tabular-nums" />
            </label>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1">
            <label>
              <span className="text-[11px]">Siaga IV (m)</span>
              <input type="number" step="0.1" value={siaga4} onChange={(e) => setSiaga4(Number(e.target.value))} className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 tabular-nums" />
            </label>
            <label>
              <span className="text-[11px]">Siaga III (m)</span>
              <input type="number" step="0.1" value={siaga3} onChange={(e) => setSiaga3(Number(e.target.value))} className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 tabular-nums" />
            </label>
            <label>
              <span className="text-[11px]">Siaga II (m)</span>
              <input type="number" step="0.1" value={siaga2} onChange={(e) => setSiaga2(Number(e.target.value))} className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 tabular-nums" />
            </label>
            <label>
              <span className="text-[11px]">Siaga I (m)</span>
              <input type="number" step="0.1" value={siaga1} onChange={(e) => setSiaga1(Number(e.target.value))} className="mt-1 w-full rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-1 tabular-nums" />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setWizardOpen(false)} className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 font-semibold">
              Batal
            </button>
            <button type="submit" className="rounded-lg bg-[var(--brand-accent)] px-4 py-1.5 font-bold text-slate-950">
              Daftarkan &amp; Aktifkan Pos
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
