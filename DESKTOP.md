# ILoveNime Desktop

Shell desktop ini menjalankan aplikasi web ILoveNime di dalam satu jendela Electron dan mempertahankan server Node.js yang sudah ada. Server tetap memakai `127.0.0.1` dan port default `3099`; jika port itu sedang dipakai, aplikasi memilih port lokal kosong secara otomatis.

## Menjalankan di mode desktop

```bash
npm install
npm run desktop:start
```

## Membuat installer

```bash
npm run desktop:dist
```

## Build Windows

Pada Windows, jalankan:

```powershell
npm install
npm run desktop:win
```

Perintah tersebut menghasilkan installer NSIS `.exe` dan executable portable `.exe` di folder `release/`. Installer tidak memerlukan Node.js pada komputer pengguna karena runtime Electron sudah dibundel. `requestedExecutionLevel` menggunakan `asInvoker`, sehingga aplikasi tidak meminta hak administrator untuk pemakaian normal.

Hasil Linux dibuat di folder `release/` sebagai AppImage dan paket `.deb`, bergantung pada target host yang digunakan. Untuk Windows atau macOS, jalankan perintah build pada sistem operasi target agar artefak native sesuai platform.

## Catatan performa dan keamanan

Shell menggunakan `contextIsolation`, `sandbox`, dan `nodeIntegration: false`. Tidak ada server publik yang dibuka; semua request aplikasi diarahkan ke loopback. Menu aplikasi disembunyikan, fitur Electron latar belakang yang tidak diperlukan dimatikan, dan hanya satu proses server lokal yang dijalankan.

Aplikasi tetap membutuhkan Node.js hanya saat dijalankan dari source. Installer Electron membundel runtime Node/Chromium sehingga pengguna akhir tidak perlu memasang Node.js secara terpisah.
