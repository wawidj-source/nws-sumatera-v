export type SiagaLevel = 'normal' | 'siaga4' | 'siaga3' | 'siaga2' | 'siaga1' | 'offline';
export type StationType = 'AWLR' | 'ARR' | 'AWS' | 'TIDE';
export type TelemetryProtocol = 'Modbus TCP/IP' | 'Modbus RTU' | 'MQTT' | 'REST API' | 'Adaptor BMKG';
export type UserRole = 'Operator' | 'Pimpinan' | 'BPBD' | 'Petugas' | 'Surveyor' | 'Admin';

export interface StationThresholds {
  siaga4: number;
  siaga3: number;
  siaga2: number;
  siaga1: number;
  rainExtremeMmH: number;
}

export interface QaQcStatus {
  outOfRange: boolean;
  frozenData: boolean;
  missingGap: boolean;
  lastCheckedWib: string;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  type: StationType;
  ws: string; // Wilayah Sungai
  das: string;
  subDas: string;
  kelurahan: string;
  kabKota: string;
  lat: number;
  lon: number;
  mapX: number; // 0-1000 SVG coordinate
  mapY: number; // 0-760 SVG coordinate
  elevationMdpl: number; // Zero gauge elevation +mdpl
  waterLevelM: number;
  fluctuationCmH: number;
  rainfallMmH: number;
  rainfall24hMm: number;
  batteryV: number;
  signalDbm: number;
  vpnLatencyMs: number;
  protocol: TelemetryProtocol;
  pollingIntervalMin: number;
  status: SiagaLevel;
  commOnline: boolean;
  hasCctv: boolean;
  upstreamId?: string;
  downstreamId?: string;
  travelTimeMin?: number;
  thresholds: StationThresholds;
  qaqc: QaQcStatus;
  escalationEtaText?: string;
  escalationUncertaintyText?: string;
  lastUpdateWib: string;
}

export interface TimeSeriesPoint {
  timestamp: string; // HH:mm WIB or ISO-like label
  stationId: string;
  waterLevelM: number;
  waterLevelMdpl: number;
  rainfallMm: number;
  dischargeM3s: number;
  forecastWaterLevelM?: number;
  uncertaintyPlusMinusM?: number;
}

export interface AlarmEvent {
  id: string;
  timestampWib: string;
  stationId: string;
  stationName: string;
  das: string;
  category: 'Hidrologi' | 'Teknis Pos' | 'Cuaca Ekstrem' | 'Koinsidensi Muara';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail: string;
  status: 'Aktif' | 'Diakui' | 'Selesai';
  acknowledgedBy?: string;
}

export interface NotificationLog {
  id: string;
  timestampWib: string;
  channel: 'WhatsApp' | 'SMS';
  zone: string;
  roleTarget: string;
  recipient: string;
  phone: string;
  siagaLevel: SiagaLevel;
  message: string;
  deliveryStatus: 'Terkirim' | 'Dibaca' | 'Menunggu Baca' | 'Dieskalasi';
  readAtWib?: string;
  escalatedTo?: string;
  slaTimeoutSec: number;
}

export interface AuditEntry {
  id: string;
  timestampWib: string;
  actor: string;
  role: UserRole;
  module: string;
  action: string;
  detail: string;
}

export interface CrossSectionPoint {
  distanceM: number;
  elev2024: number;
  elev2025: number;
  elev2026: number;
}

export interface SurveyVersion {
  id: string;
  stationId: string;
  stationName: string;
  surveyDate: string;
  surveyor: string;
  fileType: 'Cross-Section CSV' | 'Topografi DXF' | 'Drone Orthophoto GeoTIFF';
  crs: 'WGS84 (EPSG:4326)' | 'UTM Zona 47S (EPSG:32747)';
  coordValid: boolean;
  sedimentChangeCm: number;
  ratingA: number;
  ratingH0: number;
  ratingB: number;
  note: string;
}

export interface ForecastHour {
  hourOffset: number; // 0..143 (144 jam = 6 hari)
  labelWib: string;
  rainSatelliteMmH: number;
  rainBmkgMmH: number;
  nowcastCorrectedMmH: number;
  windSpeedMs: number;
  windDirDeg: number;
  tempC: number;
  dewPointC: number;
  rhPct: number;
  pressureHpa: number;
  cloudPct: number;
  solarWm2: number;
  tideHeightM: number;
  cycloneRisk: 'Rendah' | 'Sedang' | 'Tinggi';
}

export interface SubDasSoilMoisture {
  subDas: string;
  das: string;
  vwcPct: number;
  m3m3: number;
  saturationClass: 'Kering' | 'Lembap' | 'Jenuh Tinggi' | 'Kritis Jenuh';
  nowcastRmse: number;
  nowcastCsi: number;
}

export interface SopStep {
  id: string;
  siagaLevel: 'Siaga IV' | 'Siaga III' | 'Siaga II' | 'Siaga I';
  agency: 'BWS' | 'BPBD' | 'Pemda';
  pic: string;
  task: string;
  completed: boolean;
  completedBy?: string;
  completedAtWib?: string;
}

export interface EvacuationZone {
  id: string;
  kelurahan: string;
  kecamatan: string;
  das: string;
  triggerStatus: 'Siaga III' | 'Siaga II' | 'Siaga I';
  populationAtRisk: number;
  vulnerablePeople: number;
  vitalFacilities: string[];
  assemblyPoint: string;
  routeSummary: string;
  lat: number;
  lon: number;
  assemblyLat: number;
  assemblyLon: number;
}

export interface FieldReport {
  id: string;
  timestampWib: string;
  stationId: string;
  stationName: string;
  officerName: string;
  manualStaffGaugeM: number;
  gpsCoord: string;
  photoLabel: string;
  notes: string;
  synced: boolean;
  sopConfirmed: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  nipOrId: string;
  role: UserRole;
  unit: string;
  phone: string;
  active: boolean;
  lastLoginWib: string;
}

export interface VpnTunnel {
  id: string;
  stationCode: string;
  stationName: string;
  endpointIp: string;
  tunnelType: 'WireGuard' | 'IPSec IKEv2';
  status: 'Terhubung' | 'Degradasi' | 'Terputus';
  latencyMs: number;
  packetLossPct: number;
  uptimePct: number;
}

export interface ThirdPartyCsvRow {
  timestamp: string;
  stationId: string;
  waterLevelM: number;
  rainfallMm: number;
  sourceApp: string;
}
