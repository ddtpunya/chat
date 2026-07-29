CHAT DDT Stable Send Scroll v24

PERBAIKAN:
- Setelah mengirim pesan, chat langsung berpindah satu kali ke posisi paling bawah.
- Tidak ada lagi gerakan naik-turun akibat render pending, server timestamp, status terkirim/dibaca, atau perubahan tinggi composer.
- Composer dibersihkan sebelum write agar layout berubah satu kali saja.
- Scroll halus dinonaktifkan selama sinkronisasi pesan baru.

PEMASANGAN:
1. Salin kembali daftar ALLOWED_EMAILS dari auth.js lama bila diperlukan.
2. Timpa seluruh file website dengan isi folder v24.
3. Upload/publish ulang.
4. Tutup tab lama lalu buka kembali.
5. Jika memakai Home Screen/PWA, hapus aplikasi lama dan pasang ulang bila cache lama masih muncul.

Tidak perlu mengubah Firestore Rules atau Storage Rules.
