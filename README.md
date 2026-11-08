# 🎵 MUSIC DNA ANALYZER v1.0.1 Pro
### Professional Reference Audio Analysis & AI Music Prompt Generator (Suno v3.5/v4 & Udio Expert)

Aplikasi studio profesional untuk menganalisis audio lagu referensi (*Song A*), mengekstrak identitas sonik & *Musical DNA* aslinya, serta menghasilkan prompt AI musik dengan **tepat dua output final** tanpa laporan berlebihan.

---

## ✨ Fitur Baru di v1.0.1 Pro: VOCAL CHARACTER REPLACEMENT

Fitur **VOCAL CHARACTER REPLACEMENT** memungkinkan pengguna menentukan karakter suara penyanyi pengganti untuk lagu cover (*Song B*):
- **Change the Singer's Vocal Character, Not the Original Song**:
  Hanya mengubah karakter suara penyanyi pengganti tanpa merusak atau mengubah melodi, instrumen, progresi akor, tempo, genre, dan aransemen lagu asli.
- **Kondisi Input**:
  - *Kolom Kosong (Default)*: Mempertahankan karakter vokal penyanyi asli berdasarkan hasil deteksi audio.
  - *Kolom Terisi*: Mengganti karakter vokal asli dengan target suara pilihan pengguna (misal: *Male to Female*, *Male Tenor to Female Alto*, *Aggressive High-Energy Female Vocal*, *Smooth Velvety Male Tenor*).
- **Aturan Pembagian Tanggung Jawab Output Mutlak**:
  - **`01. COVER DESCRIPTION`**: Satu-satunya output yang menerima instruksi karakter vokal pengganti.
  - **`02. STYLE`**: Tetap 100% independen dan mencerminkan *Original Musical DNA* lagu referensi tanpa terpengaruh oleh input karakter vokal pengganti.

---

## 🎧 Seluruh Fitur Utama

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
- **`01. COVER DESCRIPTION`**: Satu paragraf padu bahasa Inggris yang mengintegrasikan 5 pilar musikal (maksimal 1.500 karakter).
- **`02. STYLE`**: Daftar tag musikal bahasa Inggris elit yang padat dan dipisahkan koma, teroptimasi langsung untuk **Suno v3.5/v4** dan **Udio**.

### 4. BYOK (Bring Your Own Key) Centralized Module
- Menu **API & PENGATURAN** untuk mengelola Google Gemini API Key di `localStorage`.
- Model default: `gemini-3.8-flash` dengan smart fallback otomatis.

### 5. Riwayat Analisis & Ekspor
- Panel drawer riwayat analisis dengan pencarian judul/genre, filter, salin cepat, dan **Ekspor ke File TXT**.

---

## 🚀 Cara Menjalankan Aplikasi

```bash
# Development Server
npm run dev

# Testing & QA Acceptance Suite
npm run test

# Production Build
npm run build
```
