import React from 'react';
import { Award, BookOpen, Settings, Users } from 'lucide-react';
import { ThemeMode, useApp } from '../store/AppContext';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';
import { AuditEntry, UserAccount, UserRole } from '../types/sda';

export const SettingsUsersModule: React.FC = () => {
  const {
    users,
    toggleUserActive,
    currentRole,
    switchRole,
    audits,
    themeMode,
    setThemeMode,
    waSlaTimeoutSec,
    setWaSlaTimeoutSec,
    liveStreamActive,
    setLiveStreamActive,
  } = useApp();

  const userColumns: TableColumn<UserAccount>[] = [
    { key: 'name', label: 'Nama Pengguna', isRowHeader: true, render: (r) => r.name },
    { key: 'nip', label: 'ID / NIP', render: (r) => <span className="font-mono text-[11px]">{r.nipOrId}</span> },
    { key: 'role', label: 'Peran RBAC', render: (r) => <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[11px] font-bold text-sky-400">{r.role}</span> },
    { key: 'unit', label: 'Instansi / Unit Kerja', render: (r) => r.unit },
    { key: 'phone', label: 'No. WA/SMS', render: (r) => <span className="tabular-nums">{r.phone}</span> },
    { key: 'last', label: 'Login Terakhir', render: (r) => <span className="tabular-nums">{r.lastLoginWib}</span> },
    {
      key: 'act',
      label: 'Status / Aksi',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleUserActive(r.id)}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              r.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
            }`}
          >
            {r.active ? 'Aktif' : 'Nonaktif'}
          </button>
          <button
            type="button"
            onClick={() => switchRole(r.role)}
            className="rounded border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] font-semibold hover:bg-[var(--surface-elevated)]"
          >
            Simulasi Peran
          </button>
        </div>
      ),
    },
  ];

  const auditColumns: TableColumn<AuditEntry>[] = [
    { key: 'time', label: 'Waktu', isRowHeader: true, render: (r) => <span className="tabular-nums">{r.timestampWib}</span> },
    { key: 'actor', label: 'Aktor (Peran)', render: (r) => `${r.actor} (${r.role})` },
    { key: 'mod', label: 'Modul', render: (r) => r.module },
    { key: 'act', label: 'Aksi', render: (r) => <span className="font-semibold text-[var(--brand-accent)]">{r.action}</span> },
    { key: 'det', label: 'Detail', render: (r) => r.detail },
  ];

  return (
    <div className="space-y-5">
      {/* System Preferences & Role Impersonation */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Settings className="h-4 w-4 text-sky-400" /> Pengaturan Global Platform &amp; Tampilan
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <label>
              <span className="block mb-1 font-semibold text-[var(--text-secondary)]">Tema Antarmuka</span>
              <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2"
              >
                <option value="dark">Mode Gelap (Ruang Kendali)</option>
                <option value="light">Mode Terang (Siang / Cetak)</option>
                <option value="system">Ikuti Sistem Operasi</option>
              </select>
            </label>

            <label>
              <span className="block mb-1 font-semibold text-[var(--text-secondary)]">Batas SLA Baca WA/SMS</span>
              <select
                value={waSlaTimeoutSec}
                onChange={(e) => setWaSlaTimeoutSec(Number(e.target.value))}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2"
              >
                <option value={180}>180 detik (3 Menit)</option>
                <option value={300}>300 detik (5 Menit — Default)</option>
                <option value={600}>600 detik (10 Menit)</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--surface-muted)] p-3 text-xs">
            <div>
              <div className="font-semibold text-[var(--text-primary)]">Aliran Simulasi Telemetri 5-Detikan</div>
              <div className="text-[11px] text-[var(--text-secondary)]">Zona waktu baku: Asia/Jakarta (WIB / UTC+7)</div>
            </div>
            <button
              type="button"
              onClick={() => setLiveStreamActive(!liveStreamActive)}
              className={`rounded-lg px-3 py-1.5 font-bold ${
                liveStreamActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              {liveStreamActive ? 'Aktif (Berjalan)' : 'Dijeda'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Users className="h-4 w-4 text-emerald-400" /> Kontrol Hak Akses (RBAC) — Profil Aktif: {currentRole}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Pilih peran di bawah untuk menguji tampilan dan pencatatan jejak audit berdasarkan peran pengguna (Operator, Pimpinan, BPBD, Petugas, Surveyor, Admin).
          </p>
          <div className="flex flex-wrap gap-2">
            {(['Operator', 'Pimpinan', 'BPBD', 'Petugas', 'Surveyor', 'Admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => switchRole(role)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  currentRole === role
                    ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-slate-950'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Governance: FGD, TOT & Purnajual Summary */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-xs">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <BookOpen className="h-4 w-4 text-sky-400" /> Tata Kelola Lokakarya / FGD Tenaga Ahli (3 Kali)
          </h3>
          <ul className="space-y-1.5 text-[var(--text-secondary)]">
            <li>• <strong className="text-[var(--text-primary)]">FGD 1:</strong> Penetapan Ambang Siaga IV–I &amp; Rating Curve (5 Ahli • Notulensi Tersedia)</li>
            <li>• <strong className="text-[var(--text-primary)]">FGD 2:</strong> Validasi SOP Mitigasi Bencana BWS–BPBD–Pemda (5 Ahli • Disahkan)</li>
            <li>• <strong className="text-[var(--text-primary)]">FGD 3:</strong> Pola &amp; Jalur Evakuasi serta Skenario Muara Padang (5 Ahli)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-xs">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Award className="h-4 w-4 text-amber-400" /> Commissioning, Pelatihan TOT &amp; Garansi Purnajual
          </h3>
          <ul className="space-y-1.5 text-[var(--text-secondary)]">
            <li>• <strong className="text-[var(--text-primary)]">Metode TOT:</strong> Calon instruktur internal, operator pusat kendali &amp; petugas pos</li>
            <li>• <strong className="text-[var(--text-primary)]">Dokumentasi:</strong> Spesifikasi pabrikan/brosur, dokumen As-Built, Manual Book O&amp;P</li>
            <li>• <strong className="text-[var(--text-primary)]">Keluaran:</strong> Sertifikat Instruktur Perangkat &amp; Sistem + Garansi Resmi Purnajual</li>
          </ul>
        </div>
      </section>

      <ResponsiveTable
        caption="Manajemen Pengguna & Hak Akses RBAC Platform BWS Sumatera V"
        columns={userColumns}
        rows={users}
        rowKey={(r) => r.id}
      />

      <ResponsiveTable
        caption="Log Akses Pengguna & Jejak Audit Sistem"
        columns={auditColumns}
        rows={audits}
        rowKey={(r) => r.id}
      />
    </div>
  );
};
