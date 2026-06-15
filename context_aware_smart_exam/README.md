# Context-Aware Smart Exam

Aplikasi ini dibuat untuk tugas **Komputasi Pervasif**: simulasi E-Ujian sederhana dengan fitur pengawasan cerdas berbasis Web API.

## Fitur

1. **Halaman Mulai**
   - Input nama
   - Input NIM
   - Tombol mulai ujian

2. **Halaman Ujian**
   - 5 soal pilihan ganda
   - Timer 5 menit
   - Monitoring perpindahan tab
   - Monitoring aktivitas user

3. **Tab Visibility Monitor**
   - Menggunakan `document.hidden` dan event `visibilitychange`
   - Jika peserta pindah tab, sistem:
     - Menampilkan peringatan
     - Mencatat log pelanggaran
     - Mengunci ujian otomatis jika pindah tab 3 kali

4. **Idle / AFK Detector**
   - Menggunakan event:
     - `mousemove`
     - `keydown`
     - `click`
     - `scroll`
     - `touchstart`
   - Jika tidak aktif 20 detik:
     - Status berubah menjadi AFK
     - Timer dijeda
     - Log perilaku dicatat

5. **Halaman Hasil**
   - Menampilkan nama dan NIM
   - Menampilkan skor
   - Menampilkan status ujian
   - Menampilkan log perilaku

## Cara Menjalankan

### Cara 1: Langsung di browser
1. Download semua file.
2. Buka file `index.html` menggunakan browser.
3. Jalankan ujian.

### Cara 2: Menggunakan VS Code Live Server
1. Buka folder proyek di VS Code.
2. Install extension **Live Server**.
3. Klik kanan `index.html`.
4. Pilih **Open with Live Server**.

## File Penting

- `index.html` = struktur halaman aplikasi
- `style.css` = tampilan aplikasi
- `script.js` = logika ujian, deteksi tab, deteksi AFK, timer, skor, dan log

## Catatan Demo Video

Untuk demo maksimal 3 menit, tunjukkan:
1. Input nama dan NIM.
2. Mulai ujian.
3. Jawab beberapa soal.
4. Sengaja pindah tab untuk melihat peringatan dan log.
5. Diamkan laptop/komputer selama 20 detik untuk melihat status AFK.
6. Selesaikan ujian dan tampilkan hasil serta log perilaku.
