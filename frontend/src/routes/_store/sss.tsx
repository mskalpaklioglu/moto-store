import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, DemoNotice } from "@/components/common/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_store/sss")({
  head: () => ({ meta: [{ title: "Sık Sorulan Sorular" }] }),
  component: Page,
});

// Placeholder answers: replace with confirmed store policies before launch.
const faqs: [string, string][] = [
  [
    "Siparişimi nasıl verebilirim?",
    "Ürünü sepete ekleyip ödeme adımlarını tamamlayarak sipariş verebilirsiniz. Sipariş ve ödeme altyapısı henüz bağlı olmadığından şu an yalnızca demo akışı çalışır.",
  ],
  [
    "Kargo ücreti ve teslimat süresi nedir?",
    "Kargo firması, ücretler ve süreler belirlendiğinde Kargo ve Teslimat sayfasında yayımlanacaktır.",
  ],
  [
    "İade ve değişim yapabilir miyim?",
    "İade ve değişim koşulları hukuki inceleme sonrasında İade ve Değişim sayfasında açıklanacaktır.",
  ],
  [
    "Hangi ödeme yöntemleri kullanılabilir?",
    "Ödeme sağlayıcısı henüz belirlenmedi. Desteklenen yöntemler entegrasyon sonrasında duyurulacaktır.",
  ],
  [
    "Ürünümün motosikletime uyumlu olduğunu nasıl anlarım?",
    "Gerçek ürün kataloğunda uyumluluk bilgileri ürün sayfasında yer alacaktır. Emin olamadığınızda bize ulaşabilirsiniz.",
  ],
  [
    "Siparişimi nasıl takip ederim?",
    "Hesap altyapısı bağlandığında Hesabım > Siparişlerim bölümünden sipariş durumunu görebileceksiniz.",
  ],
];

function Page() {
  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Sık sorulan sorular" }]} />
      <div className="mx-auto mt-6 max-w-3xl">
        <h1 className="heading-lg">Sık sorulan sorular</h1>
        <DemoNotice className="mt-5">
          Yanıtlar taslak niteliğindedir; kesin bilgiler işletme politikaları belirlendiğinde
          eklenecektir.
        </DemoNotice>
        <Accordion type="single" collapsible className="mt-6 border-t">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={q} value={`q${i}`}>
              <AccordionTrigger className="cursor-pointer text-left text-sm font-bold">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-sm text-muted-foreground">
          Aradığınızı bulamadınız mı?{" "}
          <Link to="/iletisim" className="font-semibold text-foreground underline">
            Bize yazın.
          </Link>
        </p>
      </div>
    </div>
  );
}
