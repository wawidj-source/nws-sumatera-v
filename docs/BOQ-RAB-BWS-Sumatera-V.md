# Bill of Quantities (BOQ) & Rencana Anggaran Biaya (RAB)
## Platform Pemantauan Data SDA, Prakiraan Cuaca Satelit, EWS Banjir & Respons Bencana — BWS Sumatera V

| Atribut Dokumen | Keterangan |
| :--- | :--- |
| **Paket Pekerjaan** | Pengadaan & Pengembangan Platform Pemantauan Data SDA, Prakiraan Cuaca Satelit (12 Bln), EWS Banjir, Aplikasi Lapangan & Gateway WA/SMS BWS Sumatera V |
| **Lokasi / Cakupan** | Wilayah Kerja BWS Sumatera V (Provinsi Sumatera Barat) |
| **Durasi Implementasi & Layanan** | 6 Bulan Pengembangan/Implementasi + 12 Bulan Operasi/Langganan Data Satelit, Server & Gateway WA/SMS |
| **Sumber Spesifikasi Acuan** | Dokumen Spesifikasi Teknis BWS Sumatera V (Bagian A & Bagian B Item 1–8) |
| **Sifat Estimasi** | Estimasi Anggaran Indikatif (Referensi Penyusunan HPS / RAB Pengadaan) |

> [!IMPORTANT]
> **Catatan Lingkup Harga:** Nilai pada BOQ ini disusun mengacu pada tarif standar pasar konsultansi TI/hidrologi/GIS Indonesia (referensi pedoman INKINDO & layanan cloud/API komersial) untuk seluruh komponen perangkat lunak, integrasi telemetri eksisting, langganan data satelit & WA/SMS 12 bulan, uji keamanan independen, 3× FGD ahli, serta commissioning/TOT. **Pengadaan fisik perangkat keras lapangan** (sensor AWLR/ARR/CCTV baru, konstruksi sipil pos, dan layar videowall fisik 4×2) berada di luar paket ini kecuali ditambahkan sebagai addendum perangkat keras.

---

## 1. Rekapitulasi Anggaran per Kelompok Pekerjaan

| No | Kelompok Pekerjaan (Sesuai PDF BWS Sumatera V) | Jumlah Biaya (Rp) | Bobot (%) |
| :---: | :--- | ---: | ---: |
| **1** | Platform Pemantauan dan Data SDA | Rp 862.000.000 | 32.9% |
| **2** | Modul Prakiraan dan Peringatan Dini | Rp 350.000.000 | 13.4% |
| **3** | Langganan Data Prakiraan Cuaca Satelit 12 Bulan | Rp 525.000.000 | 20.1% |
| **4** | Modul Respons Bencana dan Aplikasi Lapangan | Rp 350.000.000 | 13.4% |
| **5** | Layanan Notifikasi WA/SMS 12 Bulan | Rp 109.000.000 | 4.2% |
| **6** | Uji Keamanan Independen Web dan Android | Rp 100.000.000 | 3.8% |
| **7** | Lokakarya / FGD Tenaga Ahli (3 Kali) | Rp 121.500.000 | 4.6% |
| **8** | Implementasi, Pelatihan, Pendampingan dan Serah Terima | Rp 200.000.000 | 7.6% |
| | **JUMLAH TOTAL (DPP / Sebelum PPN)** | **Rp 2.617.500.000** | **100.0%** |
| | **PPN (11%)** | **Rp 287.925.000** | |
| | **TOTAL ANGGARAN (Termasuk PPN 11%)** | **Rp 2.905.425.000** | |

**Terbilang:** *Dua Miliar Sembilan Ratus Lima Juta Empat Ratus Dua Puluh Lima Ribu Rupiah*

---

## 2. Rincian Bill of Quantities (BOQ) Lengkap

### Kelompok 1: Platform Pemantauan dan Data SDA *(Subtotal: Rp 862.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi Teknis Minimum | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 1.1 | **Antarmuka Web GUI, Data Real-Time, Historis & Pelaporan** | Web GUI Windows/Linux; real-time (m, +mdpl, fluktuasi, hujan); historis harian/mingguan/bulanan/tahunan, tren jam (rata-rata/puncak), min/max 24j; ekspor Excel/PDF/CSV & impor CSV pihak ketiga | 1 | Paket | Rp 145.000.000 | Rp 145.000.000 |
| 1.2 | **Master Dashboard Tata Air SDA BWS Sumatera V** | WebGIS seluruh pos & aset warna status; ringkasan per DAS & WS; panel CCTV & grafik ringkas; manajemen pengguna & RBAC (operator, pimpinan, BPBD, petugas); Videowall 4x2 (preset normal & siaga); pencarian & log akses | 1 | Paket | Rp 135.000.000 | Rp 135.000.000 |
| 1.3 | **Dashboard Banjir (Peringatan Dini Berjenjang)** | Status Siaga IV-I otomatis dari ambang; skema DAS hulu-hilir; grafik muka air & hujan; tampilan prediksi waktu eskalasi; jejak audit perubahan status & ambang | 1 | Paket | Rp 95.000.000 | Rp 95.000.000 |
| 1.4 | **Kerangka Integrasi Data SDA Eksisting & Komunikasi** | Konektor Modbus TCP/IP, Modbus RTU, MQTT, REST API untuk pos baru & eksisting; adaptor BMKG; VPN pusat-lapangan; cek status komunikasi otomatis; normalisasi satuan & WIB; QA/QC otomatis (out-of-range, data beku); pendaftaran pos baru no-code | 1 | Paket | Rp 160.000.000 | Rp 160.000.000 |
| 1.5 | **Historian, Alarm dan Report Engine** | Basis data time-series 5-menitan arsip permanen; alarm ambang daring, pos mati, data hilang, baterai rendah; laporan harian, bulanan & per kejadian (PDF/Excel); ekspor data kalibrasi model | 1 | Paket | Rp 110.000.000 | Rp 110.000.000 |
| 1.6 | **Modul Pembaruan Data Badan Sungai dari Surveyor** | Unggah penampang, topografi & foto udara drone; validasi format & koordinat (WGS84/UTM 47S); riwayat versi per pos & tanggal; perbandingan perubahan alur; pembaruan ambang & lengkung debit (rating curve) | 1 | Paket | Rp 115.000.000 | Rp 115.000.000 |
| 1.7 | **Infrastruktur Server Pusat, Database & VPN Hub (12 Bulan)** | Server Cloud/On-Premise HA (16 vCPU, 64 GB RAM, SSD NVMe RAID, TimescaleDB backup otomatis, SSL/TLS, VPN Concentrator) | 12 | Bulan | Rp 8.500.000 | Rp 102.000.000 |

### Kelompok 2: Modul Prakiraan dan Peringatan Dini *(Subtotal: Rp 350.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi Teknis Minimum | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 2.1 | **Modul Prakiraan Cuaca Satelit Orbit Rendah (Dev & Ops 12 Bln)** | Prakiraan hujan, angin, tekanan & siklon per jam min. 72 jam; agregasi per sub-DAS; peta prakiraan & animasi; perbandingan prakiraan BMKG; penyimpanan hasil olahan untuk model | 1 | Paket | Rp 140.000.000 | Rp 140.000.000 |
| 2.2 | **Modul Nowcasting (0-6 Jam)** | Koreksi bias prakiraan 0-6 jam dengan data ARR/AWS setiap jam; peta nowcast per sub-DAS; skor akurasi prakiraan terhadap data terukur (RMSE, MAE, CSI) | 1 | Paket | Rp 115.000.000 | Rp 115.000.000 |
| 2.3 | **Modul Integrasi Prakiraan & Pola Operasional Banjir** | Aturan peringatan berjenjang (outlook internal s.d. Siaga I); prediksi waktu eskalasi status dengan rentang ketidakpastian; analisis koinsidensi hujan & pasang di muara | 1 | Paket | Rp 95.000.000 | Rp 95.000.000 |

### Kelompok 3: Langganan Data Prakiraan Cuaca Satelit 12 Bulan *(Subtotal: Rp 525.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi Teknis Minimum | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 3.1 | **Langganan High-Resolution Forecast (Satelit LEO + GNSS-RO)** | Grid 3x3 km (±3 km); per jam; horizon 6 hari (144 jam); pembaruan 2x/hari; 42 parameter meteorologis lintas ketinggian atmosfer; cakupan Prov. Sumatera Barat; format JSON/CSV/peta + akses historis kontrak | 12 | Bulan | Rp 27.500.000 | Rp 330.000.000 |
| 3.2 | **Langganan Soil Moisture Insight Harian (100x100 m)** | Kelembapan tanah harian resolusi 100x100 m; satuan m³/m³ atau % VWC; cakupan seluruh wilayah kerja BWS Sumatera V | 12 | Bulan | Rp 12.500.000 | Rp 150.000.000 |
| 3.3 | **Onboarding, Integrasi REST API & Pemicu Cuaca Ekstrem** | Integrasi REST API terjadwal otomatis ke platform; konfigurasi pemicu alarm cuaca ekstrem (hujan tinggi, angin kencang); dukungan teknis selama masa kontrak 12 bulan | 1 | Paket | Rp 45.000.000 | Rp 45.000.000 |

### Kelompok 4: Modul Respons Bencana dan Aplikasi Lapangan *(Subtotal: Rp 350.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi Teknis Minimum | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 4.1 | **Modul SOP Mitigasi Bencana Digital** | SOP digital per tingkat status; daftar periksa & penanggung jawab (PIC); pembagian peran BWS-BPBD-Pemda; jejak pelaksanaan (siapa, kapan, apa); manajemen versi SOP yang disahkan | 1 | Paket | Rp 75.000.000 | Rp 75.000.000 |
| 4.2 | **Modul Pola dan Jalur Evakuasi Bencana** | WebGIS jalur evakuasi & titik kumpul; zona terdampak per status; integrasi data penduduk & fasilitas dari BPBD/Pemda; fitur cetak peta evakuasi per kelurahan | 1 | Paket | Rp 85.000.000 | Rp 85.000.000 |
| 4.3 | **Modul Saran & Tindakan Pra, Saat, dan Pasca Bencana** | Rekomendasi tindakan berbasis status & prakiraan; templat tindakan pra, saat, pasca; log pelaksanaan; formulir evaluasi pasca kejadian | 1 | Paket | Rp 55.000.000 | Rp 55.000.000 |
| 4.4 | **Aplikasi Android Petugas Pos Hidrologi (MVP)** | Data pos real-time; input pembacaan manual, foto & lokasi GPS; notifikasi siaga (FCM); mode offline & sinkronisasi otomatis; konfirmasi tindakan SOP dari lapangan | 1 | Paket | Rp 135.000.000 | Rp 135.000.000 |

### Kelompok 5: Layanan Notifikasi WA/SMS 12 Bulan *(Subtotal: Rp 109.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi Teknis Minimum | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 5.1 | **Integrasi Gateway Notifikasi Berjenjang & Eskalasi SLA** | Mesin pesan berjenjang berbasis zona & peran; templat pesan per status; pelacakan tanda terima baca (webhook); eskalasi otomatis bila pesan tidak dibaca | 1 | Paket | Rp 55.000.000 | Rp 55.000.000 |
| 5.2 | **Langganan WhatsApp Business API (WABA) & SMS Gateway (12 Bln)** | Sewa nomor resmi/BSP WABA terverifikasi + kuota pesan WA & SMS fallback operator nasional selama 12 bulan operasional | 12 | Bulan | Rp 4.500.000 | Rp 54.000.000 |

### Kelompok 6: Uji Keamanan Independen Web dan Android *(Subtotal: Rp 100.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi Teknis Minimum | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 6.1 | **Uji Penetrasi (VAPT) Aplikasi Web & Android Independen** | Pengujian penetrasi (OWASP Top 10 & MASVS) oleh penguji keamanan independen bersertifikat beserta laporan temuan resmi | 1 | Paket | Rp 65.000.000 | Rp 65.000.000 |
| 6.2 | **Uji Beban (Load Test), Perbaikan Temuan & Uji Ulang** | Simulasi beban pengguna & trafik telemetri puncak, remediasi celah keamanan oleh tim pengembang, serta verifikasi uji ulang (retest) | 1 | Paket | Rp 35.000.000 | Rp 35.000.000 |

### Kelompok 7: Lokakarya / FGD Tenaga Ahli (3 Kali) *(Subtotal: Rp 121.500.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi Teknis Minimum | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 7.1 | **Penyelenggaraan Lokakarya/FGD (Ambang, SOP, Pola Evakuasi)** | Pelaksanaan 3 kali FGD lintas BWS-BPBD-Pemda (sewa ruang/perangkat, materi, dokumentasi, notulensi & rekomendasi tertulis) | 3 | Sesi | Rp 18.000.000 | Rp 54.000.000 |
| 7.2 | **Honorarium Narasumber Tenaga Ahli (5 Ahli x 3 Sesi)** | 5 narasumber ahli per sesi (Hidrologi, Hidrolika Sungai, Meteorologi, Kebencanaan/BPBD, Sistem Informasi/TI) selama 3 kali sesi | 15 | Orang-Sesi | Rp 4.500.000 | Rp 67.500.000 |

### Kelompok 8: Implementasi, Pelatihan, Pendampingan dan Serah Terima *(Subtotal: Rp 200.000.000)*

| Kode | Uraian Item / Pekerjaan | Spesifikasi Teknis Minimum | Vol | Sat | Harga Satuan (Rp) | Jumlah Harga (Rp) |
| :---: | :--- | :--- | :---: | :---: | ---: | ---: |
| 8.1 | **Commissioning, SAT Platform & Mobilisasi Tim Lapangan** | Pengujian menyeluruh (Site Acceptance Test) platform, koneksi pos eksisting, videowall 4x2, Android, API satelit & gateway WA/SMS | 1 | Paket | Rp 85.000.000 | Rp 85.000.000 |
| 8.2 | **Pelatihan Metode Training of Trainer (TOT) & Sertifikasi** | Pelatihan calon instruktur, operator pusat kendali & petugas pos (pengoperasian & pemeliharaan HW/SW) + penerbitan sertifikat instruktur | 1 | Paket | Rp 60.000.000 | Rp 60.000.000 |
| 8.3 | **Dokumentasi As-Built, Manual O&P, Pendampingan & Garansi Purnajual** | Penyerahan brosur/spesifikasi pabrikan, dokumen as-built, manual book O&P, pendampingan operasional pasca-implementasi & garansi resmi purnajual 12 bulan | 1 | Paket | Rp 55.000.000 | Rp 55.000.000 |

---

## 3. Struktur Kebutuhan Tim Pelaksana (Referensi Man-Month)

Komponen jasa pengembangan perangkat lunak, integrasi telemetri, pemodelan hidrologi, dan pendampingan pada Kelompok 1, 2, 4, 5, dan 8 ditopang oleh komposisi tim berikut selama masa pelaksanaan 6 bulan:

| Peran Tenaga Ahli / Pendukung | Kualifikasi Minimum | Jumlah | Durasi (OB) | Peran Utama |
| :--- | :--- | :---: | :---: | :--- |
| Team Leader / Ahli Hidrologi & EWS | S2 Teknik Sipil/SDA, min. 8 thn | 1 | 6 OB | Arsitektur model banjir, kalibrasi Siaga IV–I, nowcasting & FGD |
| Ahli Sistem Informasi / Lead Architect | S1/S2 Informatika, min. 7 thn | 1 | 6 OB | Desain arsitektur backend, TimescaleDB, RBAC & keamanan |
| Senior Full-Stack Web & GIS Developer | S1 Informatika/Geodesi, min. 5 thn | 2 | 12 OB | Master Dashboard, WebGIS Leaflet, Videowall 4×2 & modul surveyor |
| Telemetry, IoT & Network Engineer | S1 Elektro/Komputer, min. 5 thn | 1 | 5 OB | Konektor Modbus/MQTT/API, adaptor BMKG, VPN pusat–lapangan |
| Mobile Android Engineer (MVP) | S1 Informatika, min. 4 thn | 1 | 4 OB | Aplikasi Android petugas pos (offline sync, GPS, kamera, FCM) |
| Data Scientist / Hydrometeorology Specialist | S1/S2 Sains Atmosfer/Geofisika | 1 | 4 OB | Integrasi satelit LEO 42-parameter, bias correction & koinsidensi muara |
| QA, Technical Writer & Trainer (TOT) | S1 Teknik/Informatika, min. 3 thn | 1 | 4 OB | Uji SAT, dokumentasi As-Built, Manual O&P, pelatihan TOT |

---

## 4. Opsi Skenario Anggaran (Alternatif Penyesuaian Pagu)

Apabila pagu DIPA tahun berjalan memerlukan penahapan atau penyesuaian lingkup tanpa menghilangkan item wajib kontrak, tersedia tiga skenario konfigurasi berikut:

| Skenario Paket | Karakteristik Lingkup | Estimasi DPP (Rp) | Total + PPN 11% (Rp) |
| :--- | :--- | ---: | ---: |
| **Paket A — Efisien (Core + SaaS)** | Menggunakan infrastruktur *cloud* standar, 200 GB arsip awal, kuota WA/SMS dasar, integrasi hingga 15 pos eksisting | Rp 2.094.000.000 | Rp 2.324.340.000 |
| **Paket B — Standar Spesifikasi (Rekomendasi)** | **100% sesuai BOQ di atas** (HA server 12 bln, satelit 3×3 km + soil moisture 100 m 12 bln, Android MVP, VAPT, 3× FGD, TOT) | **Rp 2.617.500.000** | **Rp 2.905.425.000** |
| **Paket C — Enterprise (+ Add-on Hardware)** | Paket B ditambah pengadaan fisik *controller* Videowall 4×2 (8 layar LFD 55") & *edge gateway* industri di 10 pos prioritas | Rp 3.271.875.000 | Rp 3.631.781.250 |

---

## 5. Asumsi Perhitungan & Daftar Pengecualian (*Exclusions*)

1. **Pajak & Biaya Administrasi:** Seluruh harga satuan merupakan harga sebelum PPN; PPN dihitung sebesar **11%** sesuai ketentuan perpajakan berlaku. Biaya PPh final/pasal 23 sudah melekat pada tarif jasa masing-masing item.
2. **Komponen Langganan 12 Bulan:** Biaya langganan **Satelit Orbit Rendah + GNSS-RO + Soil Moisture** (Kelompok 3), **Gateway WA/SMS** (Kelompok 5.2), dan **Infrastruktur Server/VPN** (Kelompok 1.7) mencakup masa aktif operasional **12 bulan** terhitung sejak tanggal *Go-Live / SAT*. Perpanjangan tahun ke-2 dan seterusnya dianggarkan sebagai biaya OPEX pemeliharaan tahunan.
3. **Daftar Pengecualian (*Exclusions*):**
   - Pengadaan atau penggantian sensor lapangan fisik (radar/ultrasonik AWLR, *tipping bucket* ARR, kamera CCTV IP fisik, panel surya, baterai, dan tiang/rumah pos sipil).
   - Pengadaan perangkat keras layar videowall fisik 4×2 (8 monitor LFD, *bracket*, dan *matrix controller* ruang operasi).
   - Biaya sewa jaringan fiber optik/VSAT/paket data kartu SIM M2M di masing-masing pos lapangan eksisting (diasumsikan menggunakan kontrak konektivitas eksisting BWS Sumatera V).
4. **Garansi Purnajual:** Penyedia wajib memberikan garansi perbaikan *bug* perangkat lunak (*warranty support*) selama **12 bulan** pasca-serah terima resmi tanpa biaya tambahan.
