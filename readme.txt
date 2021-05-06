From Online Class ISTTS to Everyone:  01:23 PM
localhost:3000/api/tambah?a=1&b=2
localhost:3000/api/tambah-premium?a=1&b=2
From Online Class ISTTS to Everyone:  01:44 PM

// npm install express mysql morgan

Rencana yang mau dibuat hari ini:

1. free tier
2. pay per use
3. quota
4. overage (hybrid antara pay per use & quota)

free tier:
	gratis
	rate limited -> dalam 1 menit hanya boleh akses 5x

pay per use:
	bayar
	1x nembak api Rp. 100
	ditagih per 2 menit (normalnya perbulan atau pertahun, tapi untuk coba2 hari ini bikin jadi 2 menit)
	kalo nunggak tagihan, akses diblock

quota:
	bayar 1000, dapat quota 20x request
	masa aktif 2 menit (normalnya perbulan atau pertahun, tapi untuk coba2 hari ini bikin jadi 2 menit), sisa quota hangus
	kalau quota / masa aktif habis, diblock nggak bisa akses

overage:
	bayar 1000, dapat quota 20x request
	kalau quota habis, tambahan biaya 1x nembak api Rp. 100
	masa aktif 2 menit (normalnya perbulan atau pertahun, tapi untuk coba2 hari ini bikin jadi 2 menit), sisa quota hangus
	kalau nunggak tagihan, diblock nggak bisa akses


// WEEK 9
// npm install midtrans-client ngrok
// npm install midtrans-client ngrok

// HEROKU GITHUB
git add .
git commit -m "initial commit"
git push