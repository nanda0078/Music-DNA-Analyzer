# 🎵 MUSIC DNA ANALYZER
### Professional Reference Audio Analysis & AI Music Prompt Generator (Suno v3.5/v4 & Udio Expert)

Aplikasi studio profesional untuk menganalisis audio lagu referensi (*Song A*), mengekstrak identitas sonik & *Musical DNA* aslinya, serta menghasilkan prompt AI musik dengan **tepat dua output final** tanpa laporan berlebihan.

---

## ✨ Fitur Utama

### 1. Audio Processing & Waveform Visualization
- **Multi-Format Audio Upload**: Mendukung MP3, WAV, OGG, M4A, FLAC, dan AAC (drag-and-drop & browse).
- **Interactive Audio Waveform**: Render visual gelombang suara real-time berbasis Web Audio API Canvas.
- **Audio Controls**: Play/pause, seek, volume control, mute/unmute, dan reset.
- **Deteksi Header Teknis**: Durasi akurat, ukuran file, sample rate (kHz), dan jumlah kanal (Stereo/Mono).
- **Preservasi Audio**: File audio referensi tidak dimodifikasi dan diproses secara aman.

### 2. Internal 9-Dimensional Musical Intelligence (Gemini AI)
Analisis dilakukan mendalam secara internal tanpa membocorkan laporan parsial:
1. *Genre & Style Intelligence* (Genre utama, subgenre, pengaruh musikal dominan)
2. *Mood & Emotional Intelligence* (Atmosfer emosional, perkembangan suasana)
3. *Instrumentation Intelligence* (Instrumen utama, ritmis, teknik bermain, akustik vs elektrik/sintetis)
4. *Arrangement Intelligence* (Dinamika intro, verse, chorus build-up, transisi antar bagian)
5. *Vocal Intelligence* (Presentasi gender vokal, timbre, artikulasi, dynamic delivery, backing harmony)
6. *Rhythm & Tempo Intelligence* (Groove feel, estimasi BPM, pola ketukan drum)
7. *Harmonic & Melodic Intelligence* (Tonality, phrasing melodi, pergerakan akor)
8. *Mixing & Production Intelligence* (Lebar stereo, kedalaman spasial, reverb/ambience, tekstur mixing)
9. *Dynamic Intelligence* (Kontras energi antar seksi, build-up, breakdown)

### 3. Tepat DUA Output Final (Strict Specification)
- **`01. COVER DESCRIPTION`**: Satu paragraf padu bahasa Inggris yang mengintegrasikan 5 pilar musikal.
  - **Batas Maksimal Ketat**: $\le$ 1.500 karakter (termasuk spasi dan tanda baca).
  - **Validasi Terprogram**: Live counter `[KARAKTER] / 1.500`, loop auto-optimasi jika melebihi batas, badge status validasi, dan proteksi salin jika melebihi batas.
- **`02. STYLE`**: Daftar tag musikal bahasa Inggris elit yang padat dan dipisahkan koma, teroptimasi langsung untuk **Suno v3.5/v4** dan **Udio**.

### 4. BYOK (Bring Your Own Key) Centralized Module
- Menu **API & PENGATURAN** untuk memasukkan Google Gemini API Key secara aman di browser (`localStorage`).
- Tombol uji koneksi real-time dengan pesan status bahasa Indonesia yang ramah.
- Pilihan model (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`) dan slider analytic temperature.

### 5. Riwayat Analisis & Ekspor
- Penyimpanan riwayat lokal (hanya menyimpan metadata & hasil prompt, tanpa menyimpan file audio mentah yang berat).
- Fitur pencarian, salin cepat, hapus, dan **Ekspor ke File TXT**.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Jalankan Server Development:
```bash
npm run dev
```
Buka browser pada alamat `http://localhost:3000` (atau port yang ditampilkan di terminal).

### 2. Jalankan Pengujian Unit & QA Suite:
```bash
npm run test
```

### 3. Build untuk Production:
```bash
npm run build
```

---

## 🔒 Privasi & Keamanan
- Kunci API pengguna disimpan secara eksklusif di `localStorage` peramban lokal Anda.
- Audio referensi diproses secara langsung via peramban ke endpoint resmi Gemini API tanpa penyimpanan di server pihak ketiga.
