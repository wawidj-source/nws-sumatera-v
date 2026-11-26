# SIH3 & EWS BWS Sumatera V — Demo oleh Fortuna Argatech

Demo platform web interaktif dan dokumentasi spesifikasi yang ditujukan untuk **Balai Wilayah Sungai (BWS) Sumatera V (Provinsi Sumatera Barat)**, dikembangkan oleh **Fortuna Argatech**, mencakup pemantauan data sumber daya air (SDA), prakiraan cuaca satelit orbit rendah (LEO + GNSS-RO), nowcasting, peringatan dini banjir (Siaga IV–I), survei badan sungai, respons bencana, aplikasi Android petugas pos (MVP), serta matriks kesesuaian permintaan KAK (Compliance Matrix) 27 butir.

- **Live Demo (Firebase Hosting):** https://bws-sumatera-v-demo.web.app

## Dokumen Resmi (`docs/`)

- [PRD-BWS-Sumatera-V.md](docs/PRD-BWS-Sumatera-V.md) — Product Requirements Document lengkap (Markdown)
- [PRD-BWS-Sumatera-V.pdf](docs/PRD-BWS-Sumatera-V.pdf) — Versi PDF resmi lengkap dengan diagram arsitektur
- [Audit-Compliance-Report-BWS-Sumatera-V.pdf](docs/Audit-Compliance-Report-BWS-Sumatera-V.pdf) — Laporan Audit Kepatuhan 27 Butir Spesifikasi, Matriks Sudah/Simulasi/Belum, Analisis Kendala & 13 Screenshot Aktual
- [BOQ-RAB-BWS-Sumatera-V.md](docs/BOQ-RAB-BWS-Sumatera-V.md) / [CSV](docs/BOQ-RAB-BWS-Sumatera-V.csv) / [PDF](docs/BOQ-RAB-BWS-Sumatera-V.pdf) — BOQ & RAB Paket Standar
- [BOQ-RAB-BWS-Sumatera-V-Under1M.md](docs/BOQ-RAB-BWS-Sumatera-V-Under1M.md) / [CSV](docs/BOQ-RAB-BWS-Sumatera-V-Under1M.csv) / [PDF](docs/BOQ-RAB-BWS-Sumatera-V-Under1M.pdf) — BOQ & RAB Opsi Pagu `< Rp 1 Miliar` (Incl. PPN 11%)

## Modul yang Tersedia di Demo Web App

1. **Master Dashboard Tata Air SDA** — WebGIS Leaflet (*Google Hybrid, Google Terrain, Satelit Esri, Dark SCADA*), ringkasan DAS & WS, CCTV pos fotorealistik + PTZ/IR/AI-CV, pencarian pos, log akses, serta **Videowall 4×2** (*Preset Normal & Siaga*).
2. **Dashboard Banjir** — Status Siaga IV–I otomatis, skema propagasi hulu–hilir, grafik hujan & TMA, prediksi waktu eskalasi beserta rentang ketidakpastian, dan simulasi banjir ekstrem.
3. **Historian 5-Menitan & Pelaporan** — Analisis periode, tren jam (rata-rata & puncak), min/max 24 jam, ekspor Excel (`.xls`)/PDF/CSV/JSON kalibrasi model, serta impor CSV pihak ketiga.
4. **Satelit LEO & Nowcasting** — Timeline prakiraan 144 jam (6 hari), *Soil Moisture* 100×100 m (`% VWC` & `m³/m³`), perbandingan BMKG & koreksi bias 0–6 jam, serta analisis koinsidensi hujan–pasang muara.
5. **Survei Badan Sungai** — Perbandingan penampang 2024–2026, editor *Rating Curve*, serta *Split-Swipe GIS Inspector* Orthophoto RGB vs DEM Hillshade.
6. **Respons Bencana & Aplikasi Android MVP** — SOP digital BWS–BPBD–Pemda, WebGIS jalur & titik kumpul evakuasi, saran Pra/Saat/Pasca, serta simulator ponsel Android petugas pos (mode offline & sinkronisasi).
7. **Alarm & Gateway WA/SMS** — Antrean alarm hidrologi/teknis/cuaca ekstrem, editor ambang & interval daring, serta simulasi eskalasi SLA otomatis.
8. **Telemetri, VPN & Server** — Konektor Modbus TCP/IP, Modbus RTU, MQTT, REST API, BMKG, pendaftaran pos baru *no-code*, monitor VPN pusat–lapangan, QA/QC otomatis, dan status VAPT.
9. **Pengaturan & RBAC** — Pergantian 6 peran pengguna (`Operator`, `Pimpinan`, `BPBD`, `Petugas`, `Surveyor`, `Admin`), tema Gelap/Terang, tata kelola FGD/TOT, dan jejak audit.

## Cara Menjalankan Secara Lokal

```bash
git clone https://github.com/wawidj-source/nws-sumatera-v.git
cd nws-sumatera-v
npm install
npm run dev
```

Buka `http://localhost:5173` pada browser.

## Lisensi

Proyek ini menggunakan lisensi GNU sebagaimana tercantum pada berkas [LICENSE](LICENSE).
