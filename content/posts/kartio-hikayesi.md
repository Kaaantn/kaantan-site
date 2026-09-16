---
title: "Kartio Nasıl Doğdu: Bir ikas Uygulamasını Sıfırdan Geliştirmek"
date: 2026-07-06
description: "ikas App Store'da yayınladığım Kartio uygulamasının fikir aşamasından yayına çıkışına kadar geçen süreci, karşılaştığım teknik zorlukları ve öğrendiklerimi anlatıyorum."
---

Bazen bir ürün fikri, büyük bir "aha" anıyla değil, küçük ve tekrar eden bir sıkıntıyla başlıyor. Kartio da tam olarak böyle doğdu.

## Sorunu fark etmek

Farklı mağazalarla çalışırken, özellikle hediye ve sipariş kartı basan işletmelerde sürekli aynı manzarayı görüyordum: mağaza sahibi Canva'da ya da Photoshop'ta elle bir kart tasarlıyor, ürün adını, fiyatı yazıyor, sonra bunu tek tek yazdırıp kesiyor. Sipariş sayısı arttıkça bu iş kabusa dönüşüyordu. Her siparişte tekrar eden, tamamen mekanik ama zaman alan bir süreçti.

Bunu bir kere değil, birkaç farklı mağazada gördüğümde, kafamda soru netleşti: "Bu neden otomatikleşmiyor?" İsim, tip, süsleme ve renk gibi birkaç değişkeni seçip, kesime hazır bir PDF çıktısını otomatik üretecek bir sistem neden yok?

## İlk karar: Nerede yaşayacak?

Burada önemli bir karar vermem gerekiyordu: bunu bağımsız bir web uygulaması olarak mı yapmalıydım, yoksa doğrudan mağaza sahiplerinin zaten kullandığı bir platformun (İkas'ın) App Store'una entegre bir uygulama olarak mı?

Bağımsız bir araç yapmak teknik olarak daha basitti ama gerçek kullanım açısından daha zayıf bir tercih olurdu: mağaza sahibinin ayrı bir siteye gidip, ayrı bir hesap açıp, ürünlerini elle eşleştirmesi gerekecekti. Oysa İkas App Store üzerinden bir uygulama olarak sunmak, mağaza sahibinin zaten içinde olduğu ekosistemde, tek tıkla kurulum ve mevcut ürün/sipariş verisine doğrudan erişim anlamına geliyordu. Daha fazla mühendislik işi ama çok daha az sürtünme.

Bu kararı verdikten sonra iş, "nasıl bir araç yaparım"dan "İkas'ın uygulama geliştirme standartlarına nasıl uyarım"a döndü.

## Teknik zorluklar

**OAuth2 entegrasyonu.** İkas App Store'da yayınlanan bir uygulama olabilmek için, mağaza sahibinin kendi mağaza verisine güvenli ve yetkilendirilmiş şekilde erişebilmeniz gerekiyor. Bu, standart bir OAuth2 akışı kurmak demek — ama "standart" derken bile, her platformun kendine özgü küçük farkları oluyor: token yenileme süreleri, webhook doğrulamaları, izin kapsamları (scopes). Bunu bir kere doğru kurduğunuzda sorun değil, ama ilk kurulumda dokümantasyonu satır satır okuyup test etmeniz gerekiyor.

**PDF üretimi.** Kullanıcının seçtiği isim, tip, süsleme ve renk kombinasyonunu, A4 sayfaya kesime hazır şekilde dizilmiş bir PDF'e dönüştürmek göründüğünden daha ince bir iş. Kesim payı (bleed), yazı tipi gömme, renk profili tutarlılığı gibi detaylar — ekranda güzel görünen bir tasarımın, yazıcıdan çıktığında bozuk ya da kaymış olmaması için hepsinin doğru olması gerekiyor. jsPDF ile çalışırken bu detayları defalarca test ederek, farklı yazıcı ve kağıt boyutu senaryolarında deneyerek oturttum.

**Veritabanı ve durum yönetimi.** Prisma ile veritabanı tarafını kurarken, asıl zorluk teknik değil, kavramsaldı: bir mağaza sahibinin birden fazla kart şablonu, birden fazla siparişi olabiliyor, ve bunların hepsi İkas'taki gerçek sipariş verisiyle senkron kalmalı. "Senkron kalmalı" demek kolay, ama sipariş İkas tarafında güncellenirse, iptal edilirse, ya da düzenlenirse Kartio tarafında da bunun doğru yansıması gerekiyor. Bu tür veri tutarlılığı sorunlarını önceden düşünmek, sonradan yama yapmaktan çok daha az acı verici.

## App Store inceleme süreci

Uygulamayı yazmak işin bir kısmıydı; İkas App Store'da yayınlanabilmek için platformun kendi inceleme sürecinden geçmek gerekiyordu. Bu süreç, güvenlik, kullanıcı deneyimi ve veri gizliliği açısından belirli standartlara uyup uymadığınızı kontrol ediyor. İlk başvurumda birkaç geri bildirim aldım — bazıları küçük UI detaylarıydı, bazıları izin kapsamlarının daha net açıklanması gerektiğiydi. Bunları düzeltip tekrar gönderdim ve kısa süre sonra onay geldi.

Bu süreç bana şunu öğretti: bir platform uygulaması geliştirirken, "benim için çalışıyor" yetmiyor; platformun kullanıcı tabanının genelinde güvenli ve tutarlı çalışması gerekiyor. Bu, kod kalitesine bakış açımı da değiştirdi.

## Yayından sonra: gerçek kullanım, gerçek geri bildirim

Kartio yayına girdikten sonra en değerli şey, gerçek mağaza sahiplerinden gelen geri bildirim oldu. Bazı süsleme seçenekleri beklediğim kadar kullanılmadı, bazı renk kombinasyonları çok talep gördü, bazı küçük UX sürtünmeleri (örneğin önizleme ekranının yüklenme hızı) kullanıcıların şikayet ettiği noktalar oldu. Bu geri bildirimler, sonraki güncellemelerin yol haritasını büyük ölçüde belirledi.

## Kartio'dan sonra: Takiplio ve Barlio

Kartio'yu geliştirirken öğrendiğim her şey — OAuth entegrasyonu, App Store süreçleri, gerçek kullanıcı geri bildirimini ürüne dönüştürme — sonraki uygulamalarım Takiplio ve Barlio'ya da doğrudan taşındı. İlk uygulamanın en büyük değeri belki de bu: bir sonrakini çok daha hızlı ve daha az hatayla yapabilmeniz.

## Geriye dönüp baktığımda

Kartio'yu bugün tekrar sıfırdan yazacak olsam, muhtemelen bazı mimari kararları farklı alırdım. Ama bu, projenin "yanlış" yapıldığı anlamına gelmiyor — sadece bir ürünü gerçek kullanıcılarla test ederek öğrenmenin doğal sonucu. Bir fikri "mükemmel" olana kadar bekletmek yerine, gerçek bir soruna gerçek bir çözüm sunup, gerisini kullanıcılardan öğrenerek şekillendirmek — bu yaklaşımı hâlâ savunuyorum.

Benzer bir sorununuz varsa — mağazanızda tekrar eden, elle yapılan ama aslında otomatikleşebilecek bir süreç — bunu konuşmaktan çekinmeyin. Bazen bir uygulama fikri, tam da böyle küçük bir gözlemden çıkıyor.
