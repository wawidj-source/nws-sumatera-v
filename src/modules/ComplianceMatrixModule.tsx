import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Layers,
  Printer,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ModuleId, useApp } from '../store/AppContext';
import { ResponsiveTable, TableColumn } from '../components/ResponsiveTable';

type DemoComplianceStatus = 'sudah' | 'simulasi' | 'belum';

interface ComplianceItem {
  no: number;
  group: string;
  item: string;
  specDetail: string;
  prdStatus: 'Sudah';
  demoStatus: DemoComplianceStatus;
  demoLabel: string;
  notes: string;
  targetModule: ModuleId;
  targetModuleLabel: string;
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    no: 1,
    group: 'Item 1 — Platform SDA',
    item: 'Antarmuka Web GUI (Windows/Linux)',
    specDetail: 'Tampilan daring real-time format tabular, grafis, dan skema/peta lintas OS.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah Penuh',
    notes: 'Berjalan di browser modern Windows/Linux/macOS; lengkap tabel responsif, grafik SVG, skema sungai, dan WebGIS Leaflet.',
    targetModule: 'master',
    targetModuleLabel: 'Master SDA',
  },
  {
    no: 2,
    group: 'Item 1 — Platform SDA',
    item: 'Data Real-Time Pos',
    specDetail: 'Status komunikasi pos, muka air (m & +mdpl), fluktuasi muka air, curah hujan terukur.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Simulasi Live',
    notes: 'Ticker live 5-detikan memperbarui TMA (m & +mdpl), fluktuasi (cm/j), hujan, baterai, dan sinyal; produksi butuh koneksi RTU lapangan.',
    targetModule: 'master',
    targetModuleLabel: 'Master SDA',
  },
  {
    no: 3,
    group: 'Item 1 — Platform SDA',
    item: 'Data Historis',
    specDetail: 'Pilih periode; laporan harian/mingguan/bulanan/tahunan; tren jam (rata-rata, puncak); min/max 24 jam.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Parsial / Simulasi',
    notes: 'Pemilih periode, tren jam rata-rata/puncak, dan kartu min/max 24j aktif; data masih simulasi 3j + CSV (produksi butuh TimescaleDB tahunan).',
    targetModule: 'historian',
    targetModuleLabel: 'Historian 5m',
  },
  {
    no: 4,
    group: 'Item 1 — Platform SDA',
    item: 'Pelaporan dan Ekspor / Impor CSV',
    specDetail: 'Ekspor laporan Excel/PDF, data ke CSV, serta impor CSV dari aplikasi pihak ketiga.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah (Parsial Format)',
    notes: 'Ekspor .xls, CSV, JSON kalibrasi, cetak PDF, dan modal impor CSV pihak ketiga berfungsi; produksi ditambah generator .xlsx/PDF server-side.',
    targetModule: 'historian',
    targetModuleLabel: 'Historian 5m',
  },
  {
    no: 5,
    group: 'Item 1 — Platform SDA',
    item: 'Alarm & Perubahan Ambang Daring',
    specDetail: 'Alarm ambang per parameter; perubahan interval dan nilai ambang secara daring.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Sudah (Simulasi)',
    notes: 'Editor ambang Siaga IV–I, hujan ekstrem & interval baca daring langsung memicu evaluasi status pos dan jejak audit.',
    targetModule: 'alarms',
    targetModuleLabel: 'Alarm & WA',
  },
  {
    no: 6,
    group: 'Item 1 — Platform SDA',
    item: 'Komunikasi & Status VPN',
    specDetail: 'Modbus TCP/IP, Modbus RTU, MQTT, REST API; dukungan VPN pusat–lapangan; cek status otomatis.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Simulasi',
    notes: 'Monitor konektor, terowongan WireGuard/IPSec, latensi & packet loss tersedia di UI; produksi butuh daemon listener & VPN server.',
    targetModule: 'telemetry',
    targetModuleLabel: 'Telemetri & VPN',
  },
  {
    no: 7,
    group: 'Item 1 — Platform SDA',
    item: 'Master Dashboard Tata Air SDA BWS Sumatera V',
    specDetail: 'Peta warna status, ringkasan DAS & WS, CCTV & grafik ringkas, RBAC, Videowall 4×2 (normal & siaga), pencarian & log akses.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah Penuh',
    notes: 'WebGIS Leaflet Google Hybrid/Terrain/Esri/Dark SCADA, CCTV fotorealistik + PTZ/IR/AI-CV, Videowall 4×2 2-preset, pencarian, dan RBAC 6 peran.',
    targetModule: 'master',
    targetModuleLabel: 'Master SDA',
  },
  {
    no: 8,
    group: 'Item 1 — Platform SDA',
    item: 'Dashboard Banjir',
    specDetail: 'Status Siaga IV–I otomatis dari ambang, skema DAS hulu–hilir, grafik muka air & hujan, prediksi eskalasi, jejak audit.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah Penuh',
    notes: 'Kenaikan status otomatis dari ambang, skema propagasi hulu–hilir, hidrograf+hietograf, prediksi eskalasi ± ketidakpastian, dan simulasi Siaga I.',
    targetModule: 'flood',
    targetModuleLabel: 'Dashboard Banjir',
  },
  {
    no: 9,
    group: 'Item 1 — Platform SDA',
    item: 'Kerangka Integrasi Data SDA Eksisting',
    specDetail: 'Konektor API/MQTT/Modbus, adaptor BMKG, normalisasi satuan & WIB, QA/QC otomatis, daftar pos baru tanpa ubah kode.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Simulasi (No-Code Aktif)',
    notes: 'Wizard Daftar Pos Baru (No-Code) langsung menambah pos ke peta Leaflet & tabel; monitor QA/QC memantau out-of-range/data beku/data hilang.',
    targetModule: 'telemetry',
    targetModuleLabel: 'Telemetri & VPN',
  },
  {
    no: 10,
    group: 'Item 1 — Platform SDA',
    item: 'Historian, Alarm dan Report Engine',
    specDetail: 'Time-series 5-menitan arsip permanen; alarm pos mati/hilang/baterai rendah; laporan harian/bulanan/kejadian; ekspor kalibrasi.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Parsial / Simulasi',
    notes: 'Alarm teknis (Pos Sijunjung Offline & Baterai 10.9V) dan ekspor kalibrasi JSON aktif; produksi butuh TimescaleDB + job scheduler 24/7.',
    targetModule: 'alarms',
    targetModuleLabel: 'Alarm & WA',
  },
  {
    no: 11,
    group: 'Item 1 — Platform SDA',
    item: 'Modul Pembaruan Data Badan Sungai dari Surveyor',
    specDetail: 'Unggah penampang, topografi, foto drone; validasi format & koordinat; riwayat versi; perubahan alur; ambang & rating curve.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah (Parsial Parser)',
    notes: 'Grafik penampang 2024–2026, editor Rating Curve, dan inspektor split-swipe Orthophoto RGB vs DEM Hillshade aktif; butuh GDAL/DXF parser di server.',
    targetModule: 'surveyor',
    targetModuleLabel: 'Survei Sungai',
  },
  {
    no: 12,
    group: 'Item 2 — Prakiraan & EWS',
    item: 'Modul Prakiraan Cuaca Satelit Orbit Rendah (12 Bln)',
    specDetail: 'Hujan, angin, tekanan, siklon per jam min. 72j; agregasi sub-DAS; peta & animasi; banding BMKG; simpan hasil olahan model.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Parsial / Simulasi',
    notes: 'Timeline 144 jam & grafik perbandingan BMKG aktif; gap: animasi raster spasial 3×3 km langsung di peta & koneksi API satelit komersial.',
    targetModule: 'forecast',
    targetModuleLabel: 'Satelit & Nowcast',
  },
  {
    no: 13,
    group: 'Item 2 — Prakiraan & EWS',
    item: 'Modul Nowcasting (0–6 Jam)',
    specDetail: 'Koreksi bias prakiraan 0–6 jam dengan data ARR/AWS tiap jam; peta nowcast per sub-DAS; skor akurasi terhadap data terukur.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Parsial / Simulasi',
    notes: 'Kurva nowcast 0–6j terkoreksi & skor akurasi CSI/RMSE per sub-DAS tersedia; produksi butuh engine asimilasi per jam & layer peta nowcast.',
    targetModule: 'forecast',
    targetModuleLabel: 'Satelit & Nowcast',
  },
  {
    no: 14,
    group: 'Item 2 — Prakiraan & EWS',
    item: 'Integrasi Prakiraan & Pola Operasional Banjir',
    specDetail: 'Aturan peringatan berjenjang (outlook s.d. Siaga I); prediksi eskalasi ± ketidakpastian; koinsidensi hujan & pasang muara.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah (Simulasi)',
    notes: 'Analisis zona koinsidensi hujan hulu + pasang Teluk Bayur serta kartu prediksi waktu eskalasi ± rentang ketidakpastian tersedia.',
    targetModule: 'forecast',
    targetModuleLabel: 'Satelit & Nowcast',
  },
  {
    no: 15,
    group: 'Item 3 — Langganan Satelit',
    item: 'Layanan High-Res Forecast + Soil Moisture (12 Bulan)',
    specDetail: 'Konstelasi satelit LEO + GNSS-RO (radio occultation); akses API & dashboard web; masa berlangganan 1 tahun.',
    prdStatus: 'Sudah',
    demoStatus: 'belum',
    demoLabel: 'Belum (Kontrak Vendor)',
    notes: 'Memerlukan kontrak pengadaan langganan data komersial/non-komersial 12 bulan dengan penyedia satelit LEO + GNSS-RO.',
    targetModule: 'forecast',
    targetModuleLabel: 'Satelit & Nowcast',
  },
  {
    no: 16,
    group: 'Item 3 — Langganan Satelit',
    item: 'Prakiraan Cuaca Grid 3×3 km (144 Jam / 42 Parameter)',
    specDetail: 'Grid 3×3 km; per jam; horizon 6 hari (144 jam); update 2×/hari; 42 parameter meteorologis lintas ketinggian atmosfer.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Parsial / Simulasi',
    notes: 'Timeline scrubber 144 jam aktif; gap UI: saat ini menampilkan 8 parameter ringkas (produksi perlu explorer 42 parameter lintas ketinggian).',
    targetModule: 'forecast',
    targetModuleLabel: 'Satelit & Nowcast',
  },
  {
    no: 17,
    group: 'Item 3 — Langganan Satelit',
    item: 'Parameter Utama Meteorologi',
    specDetail: 'Hujan 1j & harian; suhu udara, titik embun & permukaan tanah; angin (m/s & 0–360°); RH; radiasi matahari; tekanan; tutupan awan.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Parsial / Simulasi',
    notes: 'Hujan 1j, suhu/embun, angin, RH, tekanan, radiasi, & awan tampil; gap kecil: suhu permukaan tanah & hujan harian perlu kartu terpisah.',
    targetModule: 'forecast',
    targetModuleLabel: 'Satelit & Nowcast',
  },
  {
    no: 18,
    group: 'Item 3 — Langganan Satelit',
    item: 'Kelembapan Tanah (Soil Moisture 100×100 m)',
    specDetail: 'Harian; resolusi 100×100 m; satuan m³/m³ atau % VWC; cakupan wilayah kerja BWS Sumatera V.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Sudah (Simulasi)',
    notes: 'Tabel % VWC & m³/m³ per sub-DAS serta overlay poligon 100×100 m pada WebGIS Leaflet tersedia; butuh raster API harian nyata.',
    targetModule: 'forecast',
    targetModuleLabel: 'Satelit & Nowcast',
  },
  {
    no: 19,
    group: 'Item 3 — Langganan Satelit',
    item: 'Integrasi REST API & Pemicu Cuaca Ekstrem',
    specDetail: 'Pembaruan otomatis sesuai jadwal penyedia data; dapat dikonfigurasi sebagai pemicu alarm cuaca ekstrem.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Simulasi',
    notes: 'Pemicu alarm hujan ekstrem tersedia di Alarm Engine; produksi memerlukan cron/webhook fetcher REST API satelit di server.',
    targetModule: 'alarms',
    targetModuleLabel: 'Alarm & WA',
  },
  {
    no: 20,
    group: 'Item 4 — Respons & Field',
    item: 'Modul SOP Mitigasi Bencana Digital',
    specDetail: 'SOP digital per status; daftar periksa & PIC; pembagian peran BWS–BPBD–Pemda; jejak pelaksanaan; versi SOP disahkan.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah Penuh',
    notes: 'Checklist interaktif dengan filter instansi BWS/BPBD/Pemda, versi SOP disahkan (v2.4), serta jejak otomatis siapa/kapan/apa.',
    targetModule: 'disaster',
    targetModuleLabel: 'Respons Bencana',
  },
  {
    no: 21,
    group: 'Item 4 — Respons & Field',
    item: 'Modul Pola dan Jalur Evakuasi Bencana',
    specDetail: 'WebGIS jalur & titik kumpul; zona terdampak per status; data penduduk & fasilitas BPBD/Pemda; cetak peta per kelurahan.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah Penuh',
    notes: 'WebGIS Leaflet menampilkan zona terdampak, rute evakuasi, titik kumpul aman, tabel penduduk rentan/fasilitas, dan tombol cetak kelurahan.',
    targetModule: 'disaster',
    targetModuleLabel: 'Respons Bencana',
  },
  {
    no: 22,
    group: 'Item 4 — Respons & Field',
    item: 'Modul Saran & Tindakan Pra, Saat, dan Pasca Bencana',
    specDetail: 'Rekomendasi berdasarkan status & prakiraan; templat tindakan pra/saat/pasca; log pelaksanaan; evaluasi pasca kejadian.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah Penuh',
    notes: 'Tiga fase Pra/Saat/Pasca Bencana dan formulir Evaluasi Pasca Kejadian berfungsi interaktif.',
    targetModule: 'disaster',
    targetModuleLabel: 'Respons Bencana',
  },
  {
    no: 23,
    group: 'Item 4 — Respons & Field',
    item: 'Aplikasi Android Petugas Pos Hidrologi (MVP)',
    specDetail: 'Data real-time; input bacaan manual, foto & GPS; notifikasi siaga; mode offline & sinkronisasi; konfirmasi SOP lapangan.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Simulator Web Interaktif',
    notes: 'Simulator smartphone lengkap (mistar manual, foto, GPS, Mode Offline + antrean sinkronisasi, SOP); produksi perlu kompilasi APK native/hybrid.',
    targetModule: 'disaster',
    targetModuleLabel: 'Android MVP',
  },
  {
    no: 24,
    group: 'Item 5 — Gateway WA/SMS',
    item: 'Layanan Notifikasi WA/SMS (12 Bulan)',
    specDetail: 'Pesan berjenjang berbasis zona & peran; templat per status; tanda terima pesan; eskalasi bila pesan tidak dibaca.',
    prdStatus: 'Sudah',
    demoStatus: 'simulasi',
    demoLabel: 'Simulasi Konsol & SLA',
    notes: 'Komposer pesan, log tanda terima baca, dan simulasi Eskalasi Otomatis SLA ke Pimpinan/SMS aktif; produksi butuh langganan WABA & SMS Gateway 12 bln.',
    targetModule: 'alarms',
    targetModuleLabel: 'Alarm & WA',
  },
  {
    no: 25,
    group: 'Item 6 — Uji Keamanan',
    item: 'Uji Keamanan Independen Web dan Android',
    specDetail: 'Uji penetrasi (VAPT) web & Android oleh penguji independen; uji beban; perbaikan temuan & uji ulang.',
    prdStatus: 'Sudah',
    demoStatus: 'belum',
    demoLabel: 'Belum (Tahap Fisik)',
    notes: 'Diatur dalam PRD & panel status Telemetri/Keamanan; pelaksanaan VAPT & load test dilakukan pihak ketiga setelah backend & APK Android jadi.',
    targetModule: 'telemetry',
    targetModuleLabel: 'Telemetri & VPN',
  },
  {
    no: 26,
    group: 'Item 7 — Lokakarya/FGD',
    item: 'Lokakarya / FGD Tenaga Ahli (3 Kali)',
    specDetail: '3 lokakarya (ambang, SOP, pola evakuasi); narasumber 5 ahli per sesi; notulensi dan rekomendasi tertulis.',
    prdStatus: 'Sudah',
    demoStatus: 'belum',
    demoLabel: 'Belum (Tahap Fisik)',
    notes: 'Rencana 3× FGD dengan 5 ahli/sesi tercantum di PRD & Pengaturan; kegiatan tatap muka dilaksanakan saat fase implementasi bersama BWS–BPBD.',
    targetModule: 'settings',
    targetModuleLabel: 'Pengaturan',
  },
  {
    no: 27,
    group: 'Item 8 & Bag. A — Serah Terima',
    item: 'Commissioning/SAT, Pelatihan TOT, Manual & Garansi Purnajual',
    specDetail: 'Commissioning & SAT; pelatihan TOT + sertifikat instruktur; as-built, brosur pabrikan, manual O&P; pendampingan & garansi purnajual.',
    prdStatus: 'Sudah',
    demoStatus: 'sudah',
    demoLabel: 'Sudah di PRD & Roadmap',
    notes: 'Seluruh ketentuan Bagian A & Item 8 (SAT, TOT bersertifikat, dokumentasi O&P, garansi 12 bln) tercantum di PRD dan BOQ/RAB untuk fase serah terima.',
    targetModule: 'settings',
    targetModuleLabel: 'Pengaturan',
  },
];

export const ComplianceMatrixModule: React.FC = () => {
  const { setActiveModule } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | DemoComplianceStatus>('all');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  const groups = useMemo(
    () => ['ALL', ...Array.from(new Set(COMPLIANCE_ITEMS.map((i) => i.group)))],
    []
  );

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPLIANCE_ITEMS.filter((item) => {
      const matchStatus = statusFilter === 'all' || item.demoStatus === statusFilter;
      const matchGroup = groupFilter === 'ALL' || item.group === groupFilter;
      const matchQuery =
        !q ||
        item.item.toLowerCase().includes(q) ||
        item.specDetail.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q);
      return matchStatus && matchGroup && matchQuery;
    });
  }, [statusFilter, groupFilter, query]);

  const countSudah = COMPLIANCE_ITEMS.filter((i) => i.demoStatus === 'sudah').length;
  const countSimulasi = COMPLIANCE_ITEMS.filter((i) => i.demoStatus === 'simulasi').length;
  const countBelum = COMPLIANCE_ITEMS.filter((i) => i.demoStatus === 'belum').length;

  const columns: TableColumn<ComplianceItem>[] = [
    {
      key: 'no',
      label: 'No',
      isRowHeader: true,
      align: 'center',
      render: (r) => <span className="font-mono font-bold tabular-nums">{r.no}</span>,
    },
    {
      key: 'item',
      label: 'Item Spesifikasi & Parameter',
      render: (r) => (
        <div className="min-w-[220px]">
          <div className="text-[10px] font-semibold text-[var(--brand-accent)]">{r.group}</div>
          <div className="font-bold text-[var(--text-primary)]">{r.item}</div>
          <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{r.specDetail}</div>
        </div>
      ),
    },
    {
      key: 'prd',
      label: 'PRD',
      align: 'center',
      render: () => (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
          ✓ Sudah
        </span>
      ),
    },
    {
      key: 'demo',
      label: 'Status Demo Web',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${
            r.demoStatus === 'sudah'
              ? 'border-emerald-500/35 bg-emerald-500/15 text-emerald-400'
              : r.demoStatus === 'simulasi'
                ? 'border-amber-500/35 bg-amber-500/15 text-amber-400'
                : 'border-rose-500/35 bg-rose-500/15 text-rose-400'
          }`}
        >
          {r.demoLabel}
        </span>
      ),
    },
    {
      key: 'notes',
      label: 'Catatan Audit & Gap Produksi',
      render: (r) => <div className="min-w-[240px] text-[11px] text-[var(--text-secondary)]">{r.notes}</div>,
    },
    {
      key: 'action',
      label: 'Uji Fitur',
      render: (r) => (
        <button
          type="button"
          onClick={() => setActiveModule(r.targetModule)}
          className="no-print inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] whitespace-nowrap"
        >
          {r.targetModuleLabel} <ArrowUpRight className="h-3 w-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Attribution & Purpose Banner */}
      <section className="rounded-xl border border-sky-500/35 bg-gradient-to-r from-sky-500/15 via-[var(--surface-card)] to-emerald-500/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 text-[11px] font-bold text-sky-300">
              <Building2 className="h-3.5 w-3.5" />
              DEMO RESMI UNTUK BWS SUMATERA V • DIKEMBANGKAN OLEH FORTUNA ARGATECH
            </div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
              Matriks Kesesuaian Permintaan KAK (Compliance Matrix) — 27 Butir Teknis &amp; Non-Teknis
            </h2>
            <p className="max-w-3xl text-xs text-[var(--text-secondary)]">
              Pemetaan transparan antara spesifikasi permintaan KAK BWS Sumatera V (Bagian A &amp; Bagian B Item 1–8) terhadap cakupan PRD, implementasi pada Demo Web App oleh <strong className="text-[var(--text-primary)]">Fortuna Argatech</strong>, serta catatan gap teknis menuju tahap produksi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-accent)] px-3.5 py-2 text-xs font-bold text-slate-950 hover:opacity-90"
          >
            <Printer className="h-4 w-4" /> Cetak / Simpan PDF
          </button>
        </div>
      </section>

      {/* KPI Summary */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Cakupan Dokumen PRD</span>
            <ClipboardCheck className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            27 / 27 <span className="text-xs font-semibold text-emerald-400">(100%)</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Seluruh Item 1–8 &amp; Bagian A terpetakan</p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Sudah Penuh di Demo</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-emerald-400">
            {countSudah} / 27
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">UI, WebGIS, CCTV, SOP, Evakuasi &amp; Alur Kerja</p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Simulasi / Parsial (Siap UI)</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-amber-400">
            {countSimulasi} / 27
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Butuh integrasi DB/RTU/API Satelit &amp; WABA</p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Tahap Kontrak / Fisik Lapangan</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-rose-400">
            {countBelum} / 27
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">Lisensi Satelit 12 bln, VAPT &amp; 3× FGD Ahli</p>
        </div>
      </section>

      {/* Filters */}
      <section className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: `Semua (${COMPLIANCE_ITEMS.length})` },
            { id: 'sudah', label: `Sudah Penuh (${countSudah})` },
            { id: 'simulasi', label: `Simulasi / Parsial (${countSimulasi})` },
            { id: 'belum', label: `Belum Fisik/Kontrak (${countBelum})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id as typeof statusFilter)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                statusFilter === f.id
                  ? 'bg-[var(--brand-accent)] text-slate-950'
                  : 'border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter Kelompok Pekerjaan"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs"
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g === 'ALL' ? 'Semua Kelompok (Item 1–8)' : g}
              </option>
            ))}
          </select>

          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari item atau kendala..."
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] py-1.5 pr-3 pl-8 text-xs"
            />
          </div>
        </div>
      </section>

      {/* Main 27-Item Matrix Table */}
      <ResponsiveTable
        caption="Matriks Kesesuaian Permintaan KAK (27 Butir) BWS Sumatera V — Demo oleh Fortuna Argatech"
        columns={columns}
        rows={filteredItems}
        rowKey={(r) => String(r.no)}
      />

      {/* Gap Analysis & 4-Phase Roadmap */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-xs">
          <h3 className="mb-2.5 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <ShieldCheck className="h-4 w-4 text-amber-400" /> Kendala Utama Menuju Tahap Produksi
          </h3>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li>• <strong className="text-[var(--text-primary)]">Backend &amp; Historian 5-Menit:</strong> Demo bersifat <em>client-side</em>; produksi memerlukan klaster PostgreSQL/TimescaleDB &amp; daemon akuisisi 24/7.</li>
            <li>• <strong className="text-[var(--text-primary)]">VPN &amp; Telemetri Lapangan:</strong> Integrasi pos eksisting di Bukit Barisan membutuhkan terowongan WireGuard/IPSec &amp; penanganan <em>blank spot</em> GSM.</li>
            <li>• <strong className="text-[var(--text-primary)]">Langganan Satelit LEO + 42 Parameter:</strong> Membutuhkan kontrak 12 bulan penyedia satelit + penambahan <em>explorer</em> 42 parameter &amp; animasi raster 3×3 km di peta.</li>
            <li>• <strong className="text-[var(--text-primary)]">Android APK, Gateway WA/SMS &amp; Parser GDAL:</strong> Perlu kompilasi APK lapangan, kontrak resmi WABA + SMS, serta parser server-side untuk DXF/GeoTIFF drone.</li>
            <li>• <strong className="text-[var(--text-primary)]">Aktivitas Non-Software:</strong> Uji keamanan VAPT independen, 3× FGD 5 ahli, Commissioning/SAT &amp; TOT dilaksanakan pada fase proyek.</li>
          </ul>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-xs">
          <h3 className="mb-2.5 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <Layers className="h-4 w-4 text-sky-400" /> Roadmap Implementasi Fortuna Argatech (6 Bulan)
          </h3>
          <div className="space-y-2">
            {[
              { phase: 'Fase 1 (Bulan 1–2)', desc: 'Setup server Linux HA + TimescaleDB 5-menit, VPN hub WireGuard, serta aktivasi kontrak Satelit LEO & Gateway WA/SMS 12 bulan.' },
              { phase: 'Fase 2 (Bulan 2–4)', desc: 'Implementasi daemon Modbus/MQTT/API/BMKG, QA/QC engine, parser GDAL surveyor, serta explorer 42 parameter & animasi peta nowcast.' },
              { phase: 'Fase 3 (Bulan 4–5)', desc: 'Rilis aplikasi Android Petugas Pos (.apk) dengan offline sync & pelaksanaan 3× Lokakarya/FGD 5 Ahli (Ambang, SOP, Evakuasi).' },
              { phase: 'Fase 4 (Bulan 5–6)', desc: 'Uji keamanan independen VAPT & Load Test, Commissioning/SAT, Pelatihan TOT bersertifikat, serah terima As-Built & garansi 12 bln.' },
            ].map((step) => (
              <div key={step.phase} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5">
                <div className="font-bold text-[var(--brand-accent)]">{step.phase}</div>
                <div className="mt-0.5 text-[var(--text-secondary)]">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
