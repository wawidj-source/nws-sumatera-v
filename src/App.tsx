import React, { useEffect, useState } from 'react';
import {
  Activity,
  BellRing,
  ClipboardCheck,
  CloudRainWind,
  Compass,
  Database,
  Flame,
  LayoutDashboard,
  Menu,
  Monitor,
  Moon,
  Pause,
  Play,
  Radio,
  Server,
  Settings,
  ShieldAlert,
  Sun,
  Waves,
  X,
} from 'lucide-react';
import { AppProvider, ModuleId, useApp } from './store/AppContext';
import { MasterDashboard } from './modules/MasterDashboard';
import { FloodDashboard } from './modules/FloodDashboard';
import { HistorianReports } from './modules/HistorianReports';
import { ForecastNowcast } from './modules/ForecastNowcast';
import { SurveyorModule } from './modules/SurveyorModule';
import { DisasterFieldModule } from './modules/DisasterFieldModule';
import { AlarmNotificationModule } from './modules/AlarmNotificationModule';
import { TelemetryServerModule } from './modules/TelemetryServerModule';
import { ComplianceMatrixModule } from './modules/ComplianceMatrixModule';
import { SettingsUsersModule } from './modules/SettingsUsersModule';
import { VideowallView } from './components/VideowallView';
import { UserRole } from './types/sda';

const NAV_ITEMS: { id: ModuleId; label: string; short: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'master', label: 'Master Dashboard SDA', short: 'Master SDA', icon: LayoutDashboard },
  { id: 'flood', label: 'Dashboard Banjir (Siaga)', short: 'Banjir', icon: Waves },
  { id: 'historian', label: 'Historian 5m & Laporan', short: 'Historian', icon: Database },
  { id: 'forecast', label: 'Satelit LEO & Nowcasting', short: 'Prakiraan', icon: CloudRainWind },
  { id: 'surveyor', label: 'Survei Badan Sungai', short: 'Surveyor', icon: Compass },
  { id: 'disaster', label: 'Respons & Android MVP', short: 'Bencana', icon: ShieldAlert },
  { id: 'alarms', label: 'Alarm & Gateway WA/SMS', short: 'Alarm/WA', icon: BellRing },
  { id: 'telemetry', label: 'Telemetri, VPN & Server', short: 'Telemetri', icon: Server },
  { id: 'compliance', label: 'Matriks Kepatuhan (27)', short: 'Kepatuhan', icon: ClipboardCheck },
  { id: 'settings', label: 'Pengaturan & RBAC', short: 'Pengaturan', icon: Settings },
];

const AppShell: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    videowallMode,
    setVideowallMode,
    themeMode,
    setThemeMode,
    liveStreamActive,
    setLiveStreamActive,
    currentRole,
    switchRole,
    alarms,
    notifications,
    triggerExtremeFloodSimulation,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clockWib, setClockWib] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setClockWib(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} WIB`
      );
    };
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, []);

  const activeAlarmCount = alarms.filter((a) => a.status === 'Aktif').length;
  const unreadNotifCount = notifications.filter((n) => n.deliveryStatus === 'Menunggu Baca').length;

  const renderModule = () => {
    switch (activeModule) {
      case 'master':
        return <MasterDashboard />;
      case 'flood':
        return <FloodDashboard />;
      case 'historian':
        return <HistorianReports />;
      case 'forecast':
        return <ForecastNowcast />;
      case 'surveyor':
        return <SurveyorModule />;
      case 'disaster':
        return <DisasterFieldModule />;
      case 'alarms':
        return <AlarmNotificationModule />;
      case 'telemetry':
        return <TelemetryServerModule />;
      case 'compliance':
        return <ComplianceMatrixModule />;
      case 'settings':
        return <SettingsUsersModule />;
    }
  };

  if (videowallMode) {
    return <VideowallView />;
  }

  return (
    <div className="flex min-h-dvh bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Sidebar Desktop */}
      <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-card)] lg:flex">
        <div className="border-b border-[var(--border-subtle)] px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-[var(--text-primary)]">
                SIH3 BWS Sumatera V
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">Tata Air &amp; EWS Sumbar</div>
            </div>
          </div>
          <div className="mt-2.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-[10.5px] leading-snug text-sky-300">
            Demo untuk <strong>BWS Sumatera V</strong>
            <div className="text-[10px] text-[var(--text-secondary)]">
              oleh <strong className="text-[var(--text-primary)]">Fortuna Argatech</strong>
            </div>
          </div>
        </div>

        <nav className="scroller flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navigasi Modul Utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModule(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                  active
                    ? 'bg-[var(--brand-accent)] text-slate-950 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'alarms' && activeAlarmCount > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      active ? 'bg-slate-950 text-rose-300' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {activeAlarmCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-3 space-y-2">
          <button
            type="button"
            onClick={() => setVideowallMode(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/20"
          >
            <Monitor className="h-4 w-4" /> Buka Mode Videowall 4×2
          </button>
          <button
            type="button"
            onClick={() => {
              triggerExtremeFloodSimulation();
              setActiveModule('flood');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600/90 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500"
          >
            <Flame className="h-4 w-4" /> Simulasi Siaga I
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-50 flex w-64 flex-col bg-[var(--surface-card)] border-r border-[var(--border-subtle)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <span className="text-sm font-bold">SIH3 BWS Sumatera V</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Tutup menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveModule(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                      active ? 'bg-[var(--brand-accent)] text-slate-950' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]/95 px-4 py-2.5 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu navigasi"
              className="rounded-lg border border-[var(--border-subtle)] p-1.5 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-[var(--text-primary)]">
                {NAV_ITEMS.find((i) => i.id === activeModule)?.label}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <Radio className={`h-3 w-3 ${liveStreamActive ? 'animate-pulse' : ''}`} />
                  {liveStreamActive ? 'Telemetri Live' : 'Stream Dijeda'}
                </span>
                <span>•</span>
                <span className="tabular-nums font-mono">{clockWib}</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400">
                  Demo BWS Sumatera V • Fortuna Argatech
                </span>
                {unreadNotifCount > 0 && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setActiveModule('alarms')}
                      className="text-amber-400 font-semibold hover:underline"
                    >
                      {unreadNotifCount} WA Menunggu Baca
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Play/Pause */}
            <button
              type="button"
              onClick={() => setLiveStreamActive(!liveStreamActive)}
              title={liveStreamActive ? 'Jeda pembaruan live' : 'Lanjutkan pembaruan live'}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-xs font-semibold hover:bg-[var(--surface-elevated)]"
            >
              {liveStreamActive ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{liveStreamActive ? 'Jeda Live' : 'Mulai Live'}</span>
            </button>

            {/* Quick Role Selector */}
            <select
              aria-label="Peran Pengguna Aktif"
              value={currentRole}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
            >
              {(['Operator', 'Pimpinan', 'BPBD', 'Petugas', 'Surveyor', 'Admin'] as UserRole[]).map((r) => (
                <option key={r} value={r}>Peran: {r}</option>
              ))}
            </select>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              aria-label="Ganti mode terang atau gelap"
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1.5 hover:bg-[var(--surface-elevated)]"
            >
              {themeMode === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-sky-600" />}
            </button>

            {/* Mobile Videowall button */}
            <button
              type="button"
              onClick={() => setVideowallMode(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand-accent)] px-2.5 py-1.5 text-xs font-bold text-slate-950 lg:hidden"
            >
              <Monitor className="h-3.5 w-3.5" /> 4×2
            </button>
          </div>
        </header>

        {/* Active Module Workspace */}
        <main className="flex-1 p-4 md:p-5">{renderModule()}</main>

        {/* Footer Attribution */}
        <footer className="no-print border-t border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2.5 text-[11px] text-[var(--text-secondary)] flex flex-wrap items-center justify-between gap-2">
          <span>
            Demo Platform Pemantauan Data SDA, Prakiraan Satelit &amp; EWS Banjir — Ditujukan untuk{' '}
            <strong className="text-[var(--text-primary)]">Balai Wilayah Sungai (BWS) Sumatera V</strong>
          </span>
          <span>
            Dikembangkan oleh <strong className="text-[var(--brand-accent)]">Fortuna Argatech</strong>
          </span>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
