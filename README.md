# 🎵 MUSIC DNA ANALYZER v1.0.2 Pro
### Professional Reference Audio Analysis & AI Music Prompt Generator (Suno v3.5/v4 & Udio Expert)

Aplikasi studio profesional untuk menganalisis audio lagu referensi (*Song A*), mengekstrak identitas sonik & *Musical DNA* aslinya, serta menghasilkan prompt AI musik dengan **tepat dua output final** tanpa laporan berlebihan.

---

## ✨ Fitur Baru di v1.0.2 Pro: CUSTOM INTRO ARRANGEMENT (dengan Toggle ON/OFF)

Fitur **CUSTOM INTRO ARRANGEMENT** memungkinkan pengguna merancang intro lagu cover yang lebih menarik, lebih kaya instrumen, lebih emosional, dan lebih kreatif sebelum masuk secara alami ke lagu asli:
- **Toggle ON/OFF**:
  - **OFF (Default)**: Custom intro dinonaktifkan. Seluruh kontrol ter-disable secara visual dan fungsional. Intro original dipertahankan murni dari hasil analisis audio referensi.
  - **ON**: Mengaktifkan kustomisasi intro instrumen, atmosfer, dan dinamika.
  - **Session State Persistence**: Pengaturan instrumen dan opsi intro tetap tersimpan di memori sesi saat toggle diubah dari ON ke OFF, dan langsung dipulihkan ketika diaktifkan kembali.
- **Pilihan Instrumen Tambahan (Multiple Select)**:
  Grand Piano, Acoustic Guitar, Clean Electric Guitar, Violin, Cello, Orchestral Strings, Ambient Synth Pad, Flute, Saxophone, Cinematic Percussion, Soft Drums, Harp.
- **Pilihan Intro Atmosphere**:
  Emotional & Cinematic, Romantic & Gentle, Atmospheric & Dreamy, Dramatic & Powerful, Acoustic & Intimate, Epic & Orchestral, Elegant & Melodic, Warm & Nostalgic.
- **Pilihan Intro Dynamics**:
  Soft & Intimate, Gradual Build-up, Moderate & Expressive, Powerful & Dramatic.
- **Instruksi Kustom Tambahan (Opsional)**:
  Catatan narasi aransemen intro spesifik pengguna.
- **Strict Original Song Preservation**:
  Kustomisasi hanya berlaku eksklusif pada bagian INTRO. Begitu intro selesai, lagu **wajib kembali 100% ke aransemen utama lagu asli** (melodi asli, lirik, bahasa, tempo, groove, progresi akor, Verse, Chorus, Bridge, Interlude, dan Outro tidak diubah).
- **Pembagian Tanggung Jawab Output Mutlak**:
  - **`01. COVER DESCRIPTION`**: Menerima aransemen intro kreatif beserta transisi alaminya menuju lagu asli ($\le$ 1.500 karakter).
  - **`02. STYLE`**: **TETAP 100% INDEPENDEN**. Tidak terpengaruh atau tercemar oleh instrumen/tag dari intro tambahan.

---

## 🎤 Fitur v1.0.1 Pro: VOCAL CHARACTER REPLACEMENT
- Memungkinkan penggantian karakter vokal penyanyi (*Male to Female*, *Female to Male*, *Tenor to Alto*, dll.) tanpa mengubah melodi atau aransemen asli lagu.
- Terletak bersama di dalam wadah: **PENGATURAN KREATIF COVER**.
- Hanya memengaruhi output `01. COVER DESCRIPTION`. Output `02. STYLE` tetap murni.

---

## 🎧 Seluruh Fitur Standar

### 1. Audio Processing & Waveform Visualization
- **Multi-Format Audio Upload**: Mendukung MP3, WAV, OGG, M4A, FLAC, dan AAC (drag-and-drop & browse).
- **Interactive Audio Waveform**: Render visual gelombang suara real-time berbasis Web Audio API Canvas.
- **Audio Controls**: Play/pause, seek, volume control, mute/unmute, dan reset.
- **Deteksi Header Teknis**: Durasi akurat, ukuran file, sample rate (kHz), dan jumlah kanal (Stereo/Mono).
- **Preservasi Audio**: File audio referensi tidak dimodifikasi dan diproses secara aman.

### 2. Internal 9-Dimensional Musical Intelligence (Gemini AI)
Analisis dilakukan mendalam secara internal tanpa membocorkan laporan parsial:
1. *Genre & Style Intelligence*
2. *Mood & Emotional Intelligence*
3. *Instrumentation Intelligence*
4. *Arrangement Intelligence*
5. *Vocal Intelligence*
6. *Rhythm & Tempo Intelligence*
7. *Harmonic & Melodic Intelligence*
8. *Mixing & Production Intelligence*
9. *Dynamic Intelligence*

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
