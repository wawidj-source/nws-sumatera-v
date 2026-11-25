import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  AlarmEvent,
  AuditEntry,
  FieldReport,
  NotificationLog,
  SopStep,
  Station,
  StationThresholds,
  SurveyVersion,
  TelemetryProtocol,
  ThirdPartyCsvRow,
  UserAccount,
  UserRole,
  VpnTunnel,
} from '../types/sda';
import {
  computeSiagaStatus,
  INITIAL_ALARMS,
  INITIAL_AUDITS,
  INITIAL_FIELD_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SOP_STEPS,
  INITIAL_STATIONS,
  INITIAL_SURVEYS,
  INITIAL_USERS,
  INITIAL_VPN_TUNNELS,
} from '../data/mockData';

export type ModuleId =
  | 'master'
  | 'flood'
  | 'historian'
  | 'forecast'
  | 'surveyor'
  | 'disaster'
  | 'alarms'
  | 'telemetry'
  | 'settings';

export type ThemeMode = 'dark' | 'light' | 'system';

interface AppContextValue {
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  videowallMode: boolean;
  setVideowallMode: (v: boolean) => void;
  videowallPreset: 'normal' | 'siaga';
  setVideowallPreset: (p: 'normal' | 'siaga') => void;
  themeMode: ThemeMode;
  setThemeMode: (t: ThemeMode) => void;
  liveStreamActive: boolean;
  setLiveStreamActive: (v: boolean) => void;
  currentRole: UserRole;
  currentUserName: string;
  switchRole: (role: UserRole) => void;
  stations: Station[];
  selectedStationId: string;
  setSelectedStationId: (id: string) => void;
  alarms: AlarmEvent[];
  notifications: NotificationLog[];
  audits: AuditEntry[];
  surveys: SurveyVersion[];
  sopSteps: SopStep[];
  fieldReports: FieldReport[];
  users: UserAccount[];
  vpnTunnels: VpnTunnel[];
  importedCsvRows: ThirdPartyCsvRow[];
  waSlaTimeoutSec: number;
  setWaSlaTimeoutSec: (sec: number) => void;
  triggerExtremeFloodSimulation: () => void;
  resetNormalSimulation: () => void;
  updateStationThresholds: (stationId: string, thresholds: StationThresholds, intervalMin: number) => void;
  registerNewStation: (input: {
    code: string;
    name: string;
    type: Station['type'];
    das: string;
    ws: string;
    kabKota: string;
    protocol: TelemetryProtocol;
    lat?: number;
    lon?: number;
    elevationMdpl: number;
    siaga4: number;
    siaga3: number;
    siaga2: number;
    siaga1: number;
  }) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  resolveAlarm: (alarmId: string) => void;
  sendTestNotification: (zone: string, roleTarget: string, channel: 'WhatsApp' | 'SMS', message: string) => void;
  simulateSlaEscalation: (notifId: string) => void;
  toggleSopStep: (stepId: string) => void;
  submitFieldReport: (report: Omit<FieldReport, 'id' | 'timestampWib'>) => void;
  syncOfflineFieldReports: () => void;
  addSurveyVersion: (survey: Omit<SurveyVersion, 'id'>) => void;
  importCsvRows: (rows: ThirdPartyCsvRow[]) => void;
  toggleUserActive: (userId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function nowWib(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss} WIB`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModuleState] = useState<ModuleId>('master');
  const [videowallMode, setVideowallMode] = useState(false);
  const [videowallPreset, setVideowallPreset] = useState<'normal' | 'siaga'>('normal');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [liveStreamActive, setLiveStreamActive] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('Operator');
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>(INITIAL_STATIONS[0].id);
  const [alarms, setAlarms] = useState<AlarmEvent[]>(INITIAL_ALARMS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);
  const [audits, setAudits] = useState<AuditEntry[]>(INITIAL_AUDITS);
  const [surveys, setSurveys] = useState<SurveyVersion[]>(INITIAL_SURVEYS);
  const [sopSteps, setSopSteps] = useState<SopStep[]>(INITIAL_SOP_STEPS);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>(INITIAL_FIELD_REPORTS);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [vpnTunnels] = useState<VpnTunnel[]>(INITIAL_VPN_TUNNELS);
  const [importedCsvRows, setImportedCsvRows] = useState<ThirdPartyCsvRow[]>([]);
  const [waSlaTimeoutSec, setWaSlaTimeoutSec] = useState(300);

  const currentUserName =
    users.find((u) => u.role === currentRole)?.name ?? `${currentRole} BWS Sumatera V`;

  const addAudit = useCallback(
    (module: string, action: string, detail: string, actorOverride?: string, roleOverride?: UserRole) => {
      setAudits((prev) => [
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestampWib: nowWib(),
          actor: actorOverride ?? currentUserName,
          role: roleOverride ?? currentRole,
          module,
          action,
          detail,
        },
        ...prev.slice(0, 49),
      ]);
    },
    [currentRole, currentUserName]
  );

  const setActiveModule = useCallback(
    (m: ModuleId) => {
      setActiveModuleState(m);
    },
    []
  );

  // Apply theme to <html> element per dark-mode guidance
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themeMode);
    }
  }, [themeMode]);

  // Live 5-second telemetry simulation tick
  useEffect(() => {
    if (!liveStreamActive) return;
    const timer = window.setInterval(() => {
      const tWib = nowWib();
      setStations((prev) =>
        prev.map((st) => {
          if (!st.commOnline) return st;
          const deltaWl = st.type === 'ARR' || st.type === 'AWS' ? 0 : (Math.random() - 0.44) * 0.04;
          const nextWl = Number(Math.max(0.2, st.waterLevelM + deltaWl).toFixed(2));
          const deltaRain = Math.max(0, st.rainfallMmH + (Math.random() - 0.48) * 1.4);
          const nextRain = Number(deltaRain.toFixed(1));
          const nextStatus = computeSiagaStatus(nextWl, st.commOnline, st.thresholds, st.type, nextRain);
          return {
            ...st,
            waterLevelM: st.type === 'ARR' ? 0 : nextWl,
            rainfallMmH: nextRain,
            fluctuationCmH: st.type === 'ARR' ? 0 : Math.round(st.fluctuationCmH + (deltaWl * 100) * 0.6),
            vpnLatencyMs: Math.max(12, Math.min(85, st.vpnLatencyMs + Math.round((Math.random() - 0.5) * 6))),
            status: nextStatus,
            lastUpdateWib: tWib,
          };
        })
      );
    }, 5000);
    return () => window.clearInterval(timer);
  }, [liveStreamActive]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const nextUser = users.find((u) => u.role === role)?.name ?? role;
    addAudit('Manajemen Akses', 'Ganti Peran Sesi', `Beralih profil aktif ke ${role} (${nextUser})`, nextUser, role);
  };

  const triggerExtremeFloodSimulation = () => {
    const t = nowWib();
    setStations((prev) =>
      prev.map((st) => {
        if (st.id === 'pos-kuranji-gn') {
          const wl = 4.08;
          return {
            ...st,
            waterLevelM: wl,
            fluctuationCmH: 42,
            rainfallMmH: 44.5,
            rainfall24hMm: 142.0,
            status: 'siaga1',
            escalationEtaText: 'SIAGA I TERCAPAI',
            escalationUncertaintyText: 'Puncak diperkirakan bertahan ± 2 jam',
            lastUpdateWib: t,
          };
        }
        if (st.id === 'pos-arau-kk') {
          const wl = 3.64;
          return {
            ...st,
            waterLevelM: wl,
            fluctuationCmH: 36,
            rainfallMmH: 39.0,
            rainfall24hMm: 136.5,
            status: 'siaga1',
            escalationEtaText: 'SIAGA I + Koinsidensi Pasang',
            escalationUncertaintyText: 'Genangan muara berisiko meluas ± 35 mnt',
            lastUpdateWib: t,
          };
        }
        if (st.id === 'pos-kuranji-pb') {
          return {
            ...st,
            waterLevelM: 3.22,
            fluctuationCmH: 31,
            rainfallMmH: 32.0,
            status: 'siaga2',
            escalationEtaText: 'Siaga I dalam ~28 mnt',
            escalationUncertaintyText: '± 10 menit',
            lastUpdateWib: t,
          };
        }
        return st;
      })
    );

    const newAlarm: AlarmEvent = {
      id: `alm-sim-${Date.now()}`,
      timestampWib: t,
      stationId: 'pos-kuranji-gn',
      stationName: 'Pos Duga Air Gunung Nago',
      das: 'DAS Batang Kuranji',
      category: 'Hidrologi',
      severity: 'critical',
      title: '[SIMULASI] Eskalasi Darurat SIAGA I — Batang Kuranji & Arau',
      detail: 'TMA Gunung Nago 4.08 m & Kampung Koto 3.64 m akibat hujan ekstrem 44.5 mm/jam. Pemicu evakuasi aktif.',
      status: 'Aktif',
    };
    setAlarms((prev) => [newAlarm, ...prev]);

    const newNotif: NotificationLog = {
      id: `ntf-sim-${Date.now()}`,
      timestampWib: t,
      channel: 'WhatsApp',
      zone: 'DAS Batang Kuranji & Batang Arau',
      roleTarget: 'Pimpinan BWS, BPBD & Pemda',
      recipient: 'Grup Komando Siaga I Sumbar',
      phone: '+62 811-6601-112',
      siagaLevel: 'siaga1',
      message: '[DARURAT SIAGA I] Gunung Nago 4.08m & Kampung Koto 3.64m. Aktifkan SOP Evakuasi Wajib Kel. Kuranji & Lubuk Begalung.',
      deliveryStatus: 'Menunggu Baca',
      slaTimeoutSec: waSlaTimeoutSec,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setVideowallPreset('siaga');
    addAudit('Simulasi Banjir Ekstrem', 'Pemicu Skenario Siaga I', 'Menaikkan pos Batang Kuranji & Batang Arau ke Siaga I dan memicu alarm/WA otomatis.');
  };

  const resetNormalSimulation = () => {
    setStations(INITIAL_STATIONS);
    setAlarms(INITIAL_ALARMS);
    setVideowallPreset('normal');
    addAudit('Simulasi Banjir Ekstrem', 'Reset Kondisi Dasar', 'Mengembalikan parameter pos dan alarm ke kondisi baseline.');
  };

  const updateStationThresholds = (stationId: string, thresholds: StationThresholds, intervalMin: number) => {
    const target = stations.find((s) => s.id === stationId);
    setStations((prev) =>
      prev.map((st) => {
        if (st.id !== stationId) return st;
        const nextStatus = computeSiagaStatus(st.waterLevelM, st.commOnline, thresholds, st.type, st.rainfallMmH);
        return { ...st, thresholds, pollingIntervalMin: intervalMin, status: nextStatus };
      })
    );
    if (target) {
      addAudit(
        'Alarm & Ambang Daring',
        'Ubah Ambang & Interval',
        `${target.name}: Siaga IV–I [${thresholds.siaga4}/${thresholds.siaga3}/${thresholds.siaga2}/${thresholds.siaga1} m], interval ${intervalMin} mnt.`
      );
    }
  };

  const registerNewStation: AppContextValue['registerNewStation'] = (input) => {
    const newId = `pos-custom-${Date.now()}`;
    const newStation: Station = {
      id: newId,
      code: input.code,
      name: input.name,
      type: input.type,
      ws: input.ws,
      das: input.das,
      subDas: `${input.das} (Baru)`,
      kelurahan: 'Terdaftar No-Code',
      kabKota: input.kabKota,
      lat: input.lat ?? -0.548,
      lon: input.lon ?? 100.335,
      mapX: 410,
      mapY: 340,
      elevationMdpl: input.elevationMdpl,
      waterLevelM: input.type === 'ARR' ? 0 : 1.35,
      fluctuationCmH: 3,
      rainfallMmH: 6.4,
      rainfall24hMm: 28.0,
      batteryV: 13.5,
      signalDbm: -66,
      vpnLatencyMs: 24,
      protocol: input.protocol,
      pollingIntervalMin: 5,
      status: 'normal',
      commOnline: true,
      hasCctv: false,
      thresholds: {
        siaga4: input.siaga4,
        siaga3: input.siaga3,
        siaga2: input.siaga2,
        siaga1: input.siaga1,
        rainExtremeMmH: 25,
      },
      qaqc: {
        outOfRange: false,
        frozenData: false,
        missingGap: false,
        lastCheckedWib: nowWib(),
      },
      lastUpdateWib: nowWib(),
    };
    setStations((prev) => [newStation, ...prev]);
    setSelectedStationId(newId);
    addAudit(
      'Integrasi Telemetri (No-Code)',
      'Pendaftaran Pos Baru',
      `Pos ${input.code} (${input.name}) didaftarkan via ${input.protocol} tanpa perubahan kode.`
    );
  };

  const acknowledgeAlarm = (alarmId: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, status: 'Diakui', acknowledgedBy: currentUserName } : a))
    );
    addAudit('Alarm Engine', 'Acknowledge Alarm', `Alarm ${alarmId} diakui oleh ${currentUserName}.`);
  };

  const resolveAlarm = (alarmId: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarmId ? { ...a, status: 'Selesai', acknowledgedBy: currentUserName } : a))
    );
    addAudit('Alarm Engine', 'Selesaikan Alarm', `Alarm ${alarmId} ditandai selesai.`);
  };

  const sendTestNotification = (
    zone: string,
    roleTarget: string,
    channel: 'WhatsApp' | 'SMS',
    message: string
  ) => {
    const item: NotificationLog = {
      id: `ntf-${Date.now()}`,
      timestampWib: nowWib(),
      channel,
      zone,
      roleTarget,
      recipient: `Penerima ${roleTarget} (${zone})`,
      phone: '+62 811-6601-999',
      siagaLevel: 'siaga3',
      message,
      deliveryStatus: 'Menunggu Baca',
      slaTimeoutSec: waSlaTimeoutSec,
    };
    setNotifications((prev) => [item, ...prev]);
    addAudit('Gateway WA/SMS', `Kirim ${channel}`, `Mengirim pesan berjenjang ke ${roleTarget} zona ${zone}.`);
  };

  const simulateSlaEscalation = (notifId: string) => {
    const t = nowWib();
    let targetMsg = '';
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === notifId);
      targetMsg = target?.message ?? '';
      const updated = prev.map((n) =>
        n.id === notifId
          ? {
              ...n,
              deliveryStatus: 'Dieskalasi' as const,
              escalatedTo: 'Kepala Balai BWS V & Kalaksa BPBD (SMS Backup)',
            }
          : n
      );
      const escalatedItem: NotificationLog = {
        id: `ntf-esc-${Date.now()}`,
        timestampWib: t,
        channel: 'SMS',
        zone: target?.zone ?? 'DAS Kritis',
        roleTarget: 'Pimpinan BWS & Kalaksa BPBD',
        recipient: 'Ir. Hendra Wijaya (Eskalasi SLA)',
        phone: '+62 812-6700-441',
        siagaLevel: target?.siagaLevel ?? 'siaga2',
        message: `[ESKALASI SLA TIDAK DIBACA] ${targetMsg}`,
        deliveryStatus: 'Terkirim',
        slaTimeoutSec: 180,
      };
      return [escalatedItem, ...updated];
    });
    addAudit('Gateway WA/SMS', 'Eskalasi Otomatis SLA', `Notifikasi ${notifId} tidak dibaca melewati SLA; dieskalasi ke Pimpinan via SMS.`);
  };

  const toggleSopStep = (stepId: string) => {
    const t = nowWib();
    setSopSteps((prev) =>
      prev.map((s) => {
        if (s.id !== stepId) return s;
        const nextCompleted = !s.completed;
        return {
          ...s,
          completed: nextCompleted,
          completedBy: nextCompleted ? currentUserName : undefined,
          completedAtWib: nextCompleted ? t : undefined,
        };
      })
    );
    addAudit('SOP Mitigasi Digital', 'Perbarui Checklist SOP', `Mengubah status pelaksanaan item SOP ${stepId}.`);
  };

  const submitFieldReport = (report: Omit<FieldReport, 'id' | 'timestampWib'>) => {
    const newReport: FieldReport = {
      ...report,
      id: `fr-${Date.now()}`,
      timestampWib: nowWib(),
    };
    setFieldReports((prev) => [newReport, ...prev]);
    addAudit(
      'Aplikasi Android MVP',
      report.synced ? 'Kirim Laporan Lapangan' : 'Simpan Antrean Offline',
      `Petugas ${report.officerName} mencatat mistar ${report.manualStaffGaugeM} m di ${report.stationName}.`
    );
  };

  const syncOfflineFieldReports = () => {
    const offlineCount = fieldReports.filter((r) => !r.synced).length;
    if (offlineCount === 0) return;
    setFieldReports((prev) => prev.map((r) => ({ ...r, synced: true })));
    addAudit('Aplikasi Android MVP', 'Sinkronisasi Data Offline', `${offlineCount} laporan lapangan tertunda berhasil disinkronkan ke server pusat.`);
  };

  const addSurveyVersion = (survey: Omit<SurveyVersion, 'id'>) => {
    const newSurvey: SurveyVersion = { ...survey, id: `srv-${Date.now()}` };
    setSurveys((prev) => [newSurvey, ...prev]);
    addAudit(
      'Pembaruan Badan Sungai',
      'Unggah Data Survei',
      `${survey.stationName} (${survey.fileType}, ${survey.crs}), rating curve a=${survey.ratingA}, b=${survey.ratingB}.`
    );
  };

  const importCsvRows = (rows: ThirdPartyCsvRow[]) => {
    setImportedCsvRows((prev) => [...rows, ...prev]);
    addAudit('Historian & Laporan', 'Impor CSV Pihak Ketiga', `Mengimpor ${rows.length} baris data time-series pihak ketiga ke historian.`);
  };

  const toggleUserActive = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)));
    addAudit('Manajemen Pengguna', 'Ubah Status Akun', `Mengubah status aktif akun ${userId}.`);
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        videowallMode,
        setVideowallMode,
        videowallPreset,
        setVideowallPreset,
        themeMode,
        setThemeMode,
        liveStreamActive,
        setLiveStreamActive,
        currentRole,
        currentUserName,
        switchRole,
        stations,
        selectedStationId,
        setSelectedStationId,
        alarms,
        notifications,
        audits,
        surveys,
        sopSteps,
        fieldReports,
        users,
        vpnTunnels,
        importedCsvRows,
        waSlaTimeoutSec,
        setWaSlaTimeoutSec,
        triggerExtremeFloodSimulation,
        resetNormalSimulation,
        updateStationThresholds,
        registerNewStation,
        acknowledgeAlarm,
        resolveAlarm,
        sendTestNotification,
        simulateSlaEscalation,
        toggleSopStep,
        submitFieldReport,
        syncOfflineFieldReports,
        addSurveyVersion,
        importCsvRows,
        toggleUserActive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
