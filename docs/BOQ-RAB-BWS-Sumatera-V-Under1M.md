# BOQ & RAB — Opsi Pagu di Bawah Rp 1 Miliar (Termasuk PPN 11%)
## Platform Pemantauan Data SDA, Prakiraan Cuaca Satelit, EWS Banjir & Respons Bencana — BWS Sumatera V

| Atribut Dokumen | Keterangan |
| :--- | :--- |
| **Skenario Anggaran** | **Opsi Efisien — Pagu Maksimal < Rp 1.000.000.000 (Termasuk PPN 11%)** |
| **Kelengkapan Item PDF** | **100% Seluruh 8 Kelompok Pekerjaan (26 Sub-Item) Tetap Terpenuhi** |
| **Cakupan Wilayah & Masa Layanan** | Wilayah Kerja BWS Sumatera V (Sumatera Barat) • Operasi/Langganan 12 Bulan |
| **Selisih Penghematan vs Paket Standar** | Hemat **Rp 1.925.295.000** (~66,3% lebih efisien dari Paket Standar Rp 2,905 M) |

> [!IMPORTANT]
> **Bagaimana Opsi < Rp 1 Miliar Tetap Memenuhi 100% Spesifikasi PDF?**
> Penghematan dicapai **tanpa membuang satu pun dari 8 item PDF** melalui 5 strategi rekayasa biaya: (1) pemanfaatan fondasi kode *open-source* & modul web yang sudah dirintis; (2) penggunaan aplikasi Android MVP berbasis *hybrid code-sharing* (Capacitor/React Native); (3) penggunaan VPS standar / server eksisting BWS; (4) penyelenggaraan 3× FGD & pelatihan TOT di **Aula/Ruang Rapat BWS Sumatera V** bersama akademisi/ahli daerah; serta (5) negosiasi **tarif khusus instansi pemerintah (non-komersial)** untuk langganan data satelit LEO 12 bulan.

---

## 1. Rekapitulasi Anggaran per Kelompok Pekerjaan (< Rp 1 Miliar)

| No | Kelompok Pekerjaan (Sesuai PDF BWS Sumatera V) | Jumlah Biaya (Rp) | Bobot (%) |
| :---: | :--- | ---: | ---: |
| **1** | Platform Pemantauan dan Data SDA | Rp 252.000.000 | 28.5% |
| **2** | Modul Prakiraan dan Peringatan Dini | Rp 100.000.000 | 11.3% |
| **3** | Langganan Data Prakiraan Cuaca Satelit 12 Bulan | Rp 234.000.000 | 26.5% |
| **4** | Modul Respons Bencana dan Aplikasi Lapangan | Rp 104.000.000 | 11.8% |
| **5** | Layanan Notifikasi WA/SMS 12 Bulan | Rp 35.000.000 | 4.0% |
| **6** | Uji Keamanan Independen Web dan Android | Rp 38.000.000 | 4.3% |
| **7** | Lokakarya / FGD Tenaga Ahli (3 Kali) | Rp 48.000.000 | 5.4% |
| **8** | Implementasi, Pelatihan, Pendampingan dan Serah Terima | Rp 72.000.000 | 8.2% |
| | **JUMLAH TOTAL (DPP / Sebelum PPN)** | **Rp 883.000.000** | **100.0%** |
| | **PPN (11%)** | **Rp 97.130.000** | |
| | **GRAND TOTAL (Termasuk PPN 11%)** | **Rp 980.130.000** | |

**Terbilang:** *Sembilan Ratus Delapan Puluh Juta Seratus Tiga Puluh Ribu Rupiah*

---

## 2. Rincian Bill of Quantities (BOQ) Opsi < Rp 1 Miliar

### Kelompok 1: Platform Pemantauan dan Data SDA *(Subtotal: Rp 252.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi & Strategi Efisiensi | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 1.1 | **Antarmuka Web GUI, Data Real-Time, Historis & Pelaporan** | Web GUI open-source stack (Windows/Linux); real-time (m, +mdpl, fluktuasi, hujan); historis harian/mingguan/bulanan/tahunan, tren jam, min/max 24j; ekspor Excel/PDF/CSV & impor CSV pihak ketiga *(Reuse modul UI teruji + FastAPI/Node backend)* | 1 | Paket | Rp 42.000.000 | Rp 42.000.000 |
| 1.2 | **Master Dashboard Tata Air SDA BWS Sumatera V** | WebGIS Leaflet (OSM/Esri/Terrain) seluruh pos & aset warna status; ringkasan DAS/WS; panel CCTV & grafik ringkas; RBAC; Videowall 4x2 (preset normal & siaga); pencarian & log akses *(Basemap open-tile / free tier tanpa biaya lisensi GIS)* | 1 | Paket | Rp 42.000.000 | Rp 42.000.000 |
| 1.3 | **Dashboard Banjir (Peringatan Dini Berjenjang)** | Status Siaga IV-I otomatis dari ambang; skema DAS hulu-hilir; grafik muka air & hujan; prediksi waktu eskalasi; jejak audit perubahan status & ambang *(Rule engine terintegrasi)* | 1 | Paket | Rp 32.000.000 | Rp 32.000.000 |
| 1.4 | **Kerangka Integrasi Data SDA Eksisting & Komunikasi** | Konektor Modbus TCP/IP, RTU, MQTT, REST API pos baru & eksisting (hingga 15 pos prioritas); adaptor BMKG; VPN pusat-lapangan WireGuard; QA/QC otomatis; daftar pos baru no-code *(Open-source WireGuard + EMQX/Telegraf worker)* | 1 | Paket | Rp 50.000.000 | Rp 50.000.000 |
| 1.5 | **Historian, Alarm dan Report Engine** | Basis data time-series 5-menitan (TimescaleDB Community); alarm ambang daring, pos mati, data hilang, baterai rendah; laporan PDF/Excel & ekspor kalibrasi model *(PostgreSQL + TimescaleDB open-source)* | 1 | Paket | Rp 32.000.000 | Rp 32.000.000 |
| 1.6 | **Modul Pembaruan Data Badan Sungai dari Surveyor** | Unggah penampang CSV, topografi DXF & foto udara drone; validasi koordinat WGS84/UTM 47S; riwayat versi; perbandingan perubahan alur; rating curve & ambang *(Parser GDAL/ezdxf open-source)* | 1 | Paket | Rp 30.000.000 | Rp 30.000.000 |
| 1.7 | **Infrastruktur VPS / Cloud Server & VPN Hub (12 Bulan)** | Managed VPS Linux HA (8 vCPU, 32 GB RAM, 500 GB NVMe SSD, TimescaleDB auto-backup, Let’s Encrypt SSL, WireGuard VPN Concentrator) *(Efisiensi VPS standar atau co-location server BWS)* | 12 | Bulan | Rp 2.000.000 | Rp 24.000.000 |

### Kelompok 2: Modul Prakiraan dan Peringatan Dini *(Subtotal: Rp 100.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi & Strategi Efisiensi | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 2.1 | **Modul Prakiraan Cuaca Satelit Orbit Rendah (Dev & Ops 12 Bln)** | Prakiraan hujan, angin, tekanan & siklon per jam min. 72 jam; agregasi per sub-DAS; peta prakiraan & animasi; perbandingan prakiraan BMKG; penyimpanan olahan untuk model *(Pipeline ETL Python terjadwal)* | 1 | Paket | Rp 40.000.000 | Rp 40.000.000 |
| 2.2 | **Modul Nowcasting (0-6 Jam)** | Koreksi bias prakiraan 0-6 jam dengan data ARR/AWS setiap jam; peta nowcast per sub-DAS; skor akurasi terhadap data terukur *(Algoritma bias correction & metrik CSI/RMSE)* | 1 | Paket | Rp 32.000.000 | Rp 32.000.000 |
| 2.3 | **Modul Integrasi Prakiraan & Pola Operasional Banjir** | Aturan peringatan berjenjang (outlook internal s.d. Siaga I); prediksi waktu eskalasi dengan rentang ketidakpastian; analisis koinsidensi hujan & pasang di muara *(Korelasi debit hulu & pasang surut muara)* | 1 | Paket | Rp 28.000.000 | Rp 28.000.000 |

### Kelompok 3: Langganan Data Prakiraan Cuaca Satelit 12 Bulan *(Subtotal: Rp 234.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi & Strategi Efisiensi | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 3.1 | **Langganan High-Resolution Forecast (LEO + GNSS-RO — Gov Tier)** | Grid 3x3 km; per jam; horizon 6 hari (144 jam); update 2x/hari; 42 parameter atmosfer; cakupan wilayah kerja BWS Sumatera V; JSON/CSV/peta + arsip historis kontrak 12 bulan *(Negosiasi tarif khusus instansi pemerintah/non-komersial)* | 12 | Bulan | Rp 12.500.000 | Rp 150.000.000 |
| 3.2 | **Langganan Soil Moisture Insight Harian (100x100 m)** | Kelembapan tanah harian resolusi 100x100 m; satuan m³/m³ atau % VWC; cakupan DAS prioritas BWS Sumatera V selama 12 bulan *(Bundling bersama langganan LEO (kuota 1 tahun))* | 12 | Bulan | Rp 5.500.000 | Rp 66.000.000 |
| 3.3 | **Onboarding, Integrasi REST API & Pemicu Cuaca Ekstrem** | Integrasi REST API otomatis ke platform; pemicu alarm cuaca ekstrem (hujan tinggi, angin kencang) & dukungan teknis selama masa kontrak *(Setup konektor & pemeliharaan API 12 bln)* | 1 | Paket | Rp 18.000.000 | Rp 18.000.000 |

### Kelompok 4: Modul Respons Bencana dan Aplikasi Lapangan *(Subtotal: Rp 104.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi & Strategi Efisiensi | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 4.1 | **Modul SOP Mitigasi Bencana Digital** | SOP digital per status; daftar periksa & PIC; pembagian peran BWS-BPBD-Pemda; jejak pelaksanaan (siapa, kapan, apa); versi SOP disahkan *(Engine checklist lintas instansi)* | 1 | Paket | Rp 20.000.000 | Rp 20.000.000 |
| 4.2 | **Modul Pola dan Jalur Evakuasi Bencana** | WebGIS jalur & titik kumpul; zona terdampak per status; data penduduk & fasilitas BPBD/Pemda; cetak peta evakuasi per kelurahan *(Peta evakuasi berbasis Leaflet print-layout)* | 1 | Paket | Rp 24.000.000 | Rp 24.000.000 |
| 4.3 | **Modul Saran & Tindakan Pra, Saat, dan Pasca Bencana** | Rekomendasi tindakan berbasis status & prakiraan; templat tindakan pra, saat, pasca; log pelaksanaan; evaluasi pasca kejadian *(Modul templat & evaluasi pasca banjir)* | 1 | Paket | Rp 15.000.000 | Rp 15.000.000 |
| 4.4 | **Aplikasi Android Petugas Pos Hidrologi (MVP)** | Data pos real-time; input manual, foto & GPS; notifikasi siaga; mode offline & sinkronisasi; konfirmasi SOP lapangan (dibangun via React Native/Capacitor) *(Pendekatan hybrid MVP (code-sharing dgn web))* | 1 | Paket | Rp 45.000.000 | Rp 45.000.000 |

### Kelompok 5: Layanan Notifikasi WA/SMS 12 Bulan *(Subtotal: Rp 35.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi & Strategi Efisiensi | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 5.1 | **Integrasi Gateway Notifikasi Berjenjang & Eskalasi SLA** | Pesan berjenjang berbasis zona & peran; templat per status; tanda terima pesan; eskalasi otomatis bila pesan tidak dibaca *(Webhook listener & scheduler SLA)* | 1 | Paket | Rp 17.000.000 | Rp 17.000.000 |
| 5.2 | **Langganan WhatsApp Business API & Kuota SMS Gateway (12 Bln)** | Paket langganan BSP WA resmi (tier dasar) + kuota SMS gateway fallback untuk grup operator, pimpinan, BPBD & petugas pos selama 12 bulan *(Cukup untuk ~15.000 pesan peringatan/tahun)* | 12 | Bulan | Rp 1.500.000 | Rp 18.000.000 |

### Kelompok 6: Uji Keamanan Independen Web dan Android *(Subtotal: Rp 38.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi & Strategi Efisiensi | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 6.1 | **Uji Penetrasi (VAPT) Aplikasi Web & Android Independen** | Uji penetrasi grey-box aplikasi web & Android MVP oleh auditor keamanan independen bersertifikat *(Cakupan endpoint inti, RBAC, upload & APK)* | 1 | Paket | Rp 26.000.000 | Rp 26.000.000 |
| 6.2 | **Uji Beban (Load Test), Remediasi & Uji Ulang** | Uji beban otomatis (k6/JMeter), perbaikan temuan kritis/tinggi, dan uji ulang (retest) verifikasi *(Laporan final bebas temuan kritis/tinggi)* | 1 | Paket | Rp 12.000.000 | Rp 12.000.000 |

### Kelompok 7: Lokakarya / FGD Tenaga Ahli (3 Kali) *(Subtotal: Rp 48.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi & Strategi Efisiensi | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 7.1 | **Penyelenggaraan 3× Lokakarya/FGD (Di Aula Kantor BWS V)** | 3 sesi FGD (ambang, SOP, pola evakuasi) memanfaatkan ruang/aula BWS Sumatera V; konsumsi, materi cetak, notulensi & rekomendasi tertulis *(Hemat sewa hotel karena menggunakan fasilitas BWS)* | 3 | Sesi | Rp 6.000.000 | Rp 18.000.000 |
| 7.2 | **Honorarium Narasumber Tenaga Ahli (5 Ahli × 3 Sesi)** | 5 narasumber ahli per sesi × 3 sesi (acuan standar biaya masukan / tenaga ahli lokal & akademisi Unand/PNP) *(Rp 2 jt / orang-sesi sesuai SBM lokal)* | 15 | Orang-Sesi | Rp 2.000.000 | Rp 30.000.000 |

### Kelompok 8: Implementasi, Pelatihan, Pendampingan dan Serah Terima *(Subtotal: Rp 72.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi & Strategi Efisiensi | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 8.1 | **Commissioning, SAT Platform & Integrasi Pos Lapangan** | Commissioning dan Site Acceptance Test (SAT) platform serta mobilisasi tim kecil integrasi pos eksisting di Sumbar *(Tim implementasi terpadu)* | 1 | Paket | Rp 30.000.000 | Rp 30.000.000 |
| 8.2 | **Pelatihan Metode TOT (Di Ruang Rapat BWS) & Sertifikat** | Pelatihan TOT bagi calon instruktur, operator & petugas pos (HW/SW) bertempat di kantor BWS + penerbitan sertifikat instruktur *(Pelatihan luring + modul video rekaman)* | 1 | Paket | Rp 22.000.000 | Rp 22.000.000 |
| 8.3 | **Dokumentasi As-Built, Manual O&P, Pendampingan & Garansi** | Brosur/spesifikasi pabrikan, dokumen as-built, manual book O&P, pendampingan operasional jarak jauh & garansi purnajual 12 bulan *(Dukungan purnajual SLA 12 bulan)* | 1 | Paket | Rp 20.000.000 | Rp 20.000.000 |

---

## 3. Catatan Pengendalian Risiko pada Pagu < Rp 1 Miliar

1. **Risiko Terbesar ada di Kelompok 3 (Langganan Satelit LEO 12 Bulan = 26,5% dari total anggaran):** Penyedia data satelit orbit rendah komersial (dengan 42 parameter grid 3×3 km + GNSS-RO + soil moisture 100×100 m) umumnya mematok tarif berdenominasi USD. Pada pagu Rp 234 juta/tahun, tim pengadaan perlu mengunci skema **Government/Academic Non-Commercial Basin License** atau membatasi *bounding box* area API ketat pada poligon batas DAS wilayah kerja BWS Sumatera V saja.
2. **Batasan Integrasi Awal Pos Eksisting:** Pada angka integrasi ini, cakupan *commissioning* awal difokuskan hingga **15 pos prioritas** (AWLR/ARR/AWS/Tide); penambahan pos ke-16 dan seterusnya dilakukan mandiri oleh operator BWS menggunakan fitur **Pendaftaran Pos Baru (No-Code)** yang sudah tersedia di platform.
3. **Tempat FGD & Pelatihan TOT:** Biaya sewa hotel/ballroom ditiadakan dengan asumsi seluruh **3× FGD Tenaga Ahli** dan **Pelatihan TOT** diselenggarakan menggunakan fasilitas ruang rapat/aula Kantor BWS Sumatera V di Padang, serta melibatkan tenaga ahli hidrologi/kebencanaan lokal/regional.
4. **Pengecualian Fisik Tetap Berlaku:** Pengadaan fisik sensor AWLR/ARR/CCTV baru, konstruksi sipil pos, layar fisik monitor Videowall 4×2, serta biaya paket data kartu SIM M2M pos eksisting berada di luar angka Rp 980.130.000 ini.
