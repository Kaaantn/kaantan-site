---
title: "Mağaza Kurulumundan Yayına: E-Ticaret Sitesi Açarken Gözden Kaçan Detaylar"
date: 2026-06-29
description: "Bir e-ticaret mağazasını kurup yayına almak sanıldığından fazla adım içeriyor. Kurulumlarda en sık atlanan detayları ve bunların neden önemli olduğunu anlatıyorum."
---

Bir mağaza kurulumuna başladığımda, işletme sahiplerinin aklında genelde şu var: "logo koyayım, ürünleri yükleyeyim, siteyi açayım." Mantıklı bir sıralama gibi görünüyor ama gerçekte yayına alma süreci bunun çok daha fazlası. Yıllardır tekrar tekrar gördüğüm, insanların ilk seferde fark etmediği ama sonradan "keşke başta düşünseydim" dediği noktaları bir araya getirdim.

## Ödeme altyapısı onayı, sandığınızdan uzun sürebilir

Bunu neredeyse her projede yaşıyorum: işletme sahibi mağazayı açmaya hazır, ürünler yüklü, tasarım bitmiş — ama ödeme sağlayıcısının (iyzico, PayTR, Param, ya da hangisiyse) hesap onay süreci hâlâ devam ediyor. Bu süreç kimlik doğrulama, şirket evrakları, banka hesabı eşleştirmesi gibi adımlar içeriyor ve bazen birkaç gün, bazen bir haftadan fazla sürebiliyor.

Benim önerim basit: mağaza tasarımına başlamadan önce ödeme sağlayıcısı başvurunuzu yapın. Bu ikisini paralel yürütün, sona bırakmayın. Yayın günü "ödeme onayı bekleniyor" diye siteyi açamamak, önlenebilir bir gecikme.

## Kargo entegrasyonu sadece "API bağlantısı" değil

Kargo entegrasyonunu kurduğunuzda iş bitmiş gibi görünüyor ama asıl mesele operasyonel detaylarda saklı:

- Kargo firması sizin adresinizden mi alacak, siz mi bırakacaksınız? Bu, entegrasyon ayarlarında farklı yapılandırılıyor.
- Farklı bölgelere farklı kargo ücreti mi uygulayacaksınız, yoksa sabit mi? Bunu baştan netleştirmezseniz, ilk siparişlerde fiyatlandırma karmaşası yaşanıyor.
- Kargo takip numarası müşteriye otomatik mi gidecek, yoksa siz mi elle gireceksiniz? Otomatikleştirilmezse, bu iş büyüdükçe gerçek bir zaman kaybına dönüşüyor.

Bu detayları kurulum aşamasında konuşmazsanız, ilk gerçek siparişler geldiğinde fark ediyorsunuz — ki o zaman düzeltmek daha stresli oluyor.

## Yasal sayfalar dekor değil, gereklilik

Mesafeli satış sözleşmesi, iade/değişim koşulları, KVKK aydınlatma metni, çerez politikası — bunlar "sonra eklerim" diye bırakılan sayfalar arasında en çok atlananlar. Oysa hem yasal bir zorunluluk hem de müşteri güveni açısından kritik. Bir müşteri sepete ürün eklemeden önce "iade var mı, nasıl işliyor" diye bakıyor; o sayfa yoksa ya da eksikse, güven kaybı doğrudan satışa yansıyor.

Bunu şablon bir metin kopyalayıp yapıştırarak değil, gerçekten sizin işletmenizin çalışma şekline uygun şekilde hazırlamak gerekiyor. Kargo süreniz, iade koşullarınız, ödeme seçenekleriniz neyse, o metinler bunu yansıtmalı.

## Ürün görselleri ve açıklamaları: SEO'nun gerçek başladığı yer

Herkes "SEO" deyince teknik bir şeyden bahsedildiğini düşünüyor — meta etiketler, site hızı, backlink filan. Bunlar doğru ama e-ticarette SEO'nun büyük kısmı aslında ürün sayfalarında başlıyor:

- Her ürünün kendine özgü, kopyala-yapıştır olmayan bir açıklaması olmalı. Tedarikçiden gelen aynı metni yüzlerce mağaza kullanıyorsa, arama motoru sizi öne çıkarmaz.
- Görsellerin dosya adları ve alt metinleri anlamlı olmalı ("IMG_4821.jpg" değil, "kadin-deri-canta-siyah.jpg" gibi).
- Kategori yapısı mantıklı ve arama davranışına uygun olmalı — müşterinin arama kutusuna yazacağı kelimelerle sizin kategori isimleriniz örtüşmeli.

Bunlar küçük detaylar gibi görünüyor ama toplamda mağazanızın arama motorlarında görünürlüğünü belirleyen şey tam olarak bu.

## Yayından önce mutlaka test siparişi verin

Bu, atladığım zaman en çok pişman olduğum adımlardan biri: mağaza teknik olarak "hazır" göründüğünde bile, gerçek bir sipariş akışını uçtan uca (ürün seçme, sepete ekleme, ödeme yapma, sipariş onayı e-postası alma, kargo takibi görme) bizzat denemek şart. Bu testte genelde küçük ama can sıkıcı şeyler ortaya çıkıyor: ödeme sonrası yönlendirme sayfası bozuk, sipariş onay e-postası spam'e düşüyor, mobilde ödeme formu taşıyor gibi.

Yayına almadan önce bu testi yapmak, ilk gerçek müşterinizin karşılaşacağı sorunları sizin önceden fark etmeniz demek.

## Hız ve mobil uyum: "sonra bakarız" denen ama asla bakılmayan konu

İstatistik vermeyeceğim çünkü zaten hepimiz biliyoruz: müşterilerin büyük çoğunluğu mobilden alışveriş yapıyor ve yavaş açılan bir site direkt terk ediliyor. Ama şu ayrımı yapmak önemli: "mobilde görünüyor" ile "mobilde iyi çalışıyor" aynı şey değil. Butonlar parmakla rahat basılabiliyor mu, form alanları klavye açıldığında kayboluyor mu, görseller gereksiz yere ağır mı yükleniyor — bunlar gerçek kullanıcı deneyimini belirleyen detaylar.

## Özetle

Bir e-ticaret mağazası kurmak, aslında bir liste işi değil, bir sıralama işi. Doğru şeyleri doğru zamanda yapmak, sonradan "keşke" demenizi engelliyor. Ben kurulumlara girdiğimde bu listeyi zihnimde gezdiriyorum; sizin de kendi kurulumunuzda bu adımları baştan planlamanız, yayın gününü çok daha az stresli hale getirir.

Mağazanızı kurarken bu detayların hangisinde takıldığınızı bilmiyorsanız bile sorun değil — birlikte gözden geçirebiliriz.
