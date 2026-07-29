CHAT DDT — WHITE SCREEN RECOVERY V25

Penyebab v24:
1. app.js memiliki potongan fungsi lama yang tertinggal dan menyebabkan SyntaxError pada browser module.
2. CSS menggunakan contain: paint dan grid override pada area chat; beberapa Safari iOS dapat merender area kosong/putih.

Pemasangan:
1. Upload SEMUA file v25 dan timpa file v24.
2. Pastikan auth.js mempertahankan daftar ALLOWED_EMAILS Anda.
3. Tutup seluruh tab CHAT DDT.
4. Safari: Settings > Safari > Advanced > Website Data, hapus data situs CHAT DDT bila layar putih masih tersimpan.
5. Jika dipasang di Home Screen, hapus ikon lama dan pasang ulang.

Firestore Rules tidak perlu diubah.
