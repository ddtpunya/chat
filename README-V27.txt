CHAT DDT — Theme Sync Fix v27

Perbaikan:
- Tema dibaca dari localStorage sebelum CSS dan JavaScript utama selesai dimuat.
- Warna html, body, safe-area, status bar, login, dan chat disinkronkan.
- Cache PWA diperbarui ke v27.
- start_url manifest diperbarui ke v27.

Pemasangan:
1. Timpa seluruh file v26 dengan isi folder v27.
2. Upload dan publish ulang.
3. Tutup semua tab CHAT DDT.
4. Jika memakai Home Screen, hapus ikon lama dan pasang ulang bila warna lama masih tersimpan.
5. Tidak perlu mengubah Firestore Rules atau Storage Rules.
