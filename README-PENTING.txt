CHAT DDT v18 — Complete Session Fix

Penyebab layar “Memulihkan sesi...” tidak berhenti:
Paket v17 hanya berisi index.html, app.js, style.css, dan service-worker.js, sedangkan index.html tetap memanggil auth.js dan firebase.js. Bila dua file itu tidak ada/404, kode autentikasi tidak pernah berjalan.

Pemasangan:
1. Upload SEMUA file dalam folder ini ke folder root website.
2. Jangan hanya upload index.html/style.css/app.js.
3. Pastikan URL berikut dapat dibuka dan tidak 404:
   - firebase.js
   - auth.js
   - app.js
   - style.css
4. Publish firestore.rules hanya bila rules yang aktif lebih lama dari v13.
5. Setelah upload, hapus data situs/cache Safari atau hapus ikon Home Screen lama lalu pasang ulang.
6. Login ulang satu kali.

Catatan email login:
Periksa daftar ALLOWED_EMAILS di auth.js dan tambahkan Gmail yang diizinkan sebelum upload.

Pengaman v18:
- Auth observer aktif tanpa menunggu redirect result.
- Timeout auth internal 6,5 detik.
- Watchdog HTML 8 detik jika modul auth/firebase gagal dimuat.
- Service worker tidak gagal total hanya karena satu aset cache bermasalah.
