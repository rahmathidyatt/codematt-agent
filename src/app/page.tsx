import { product } from "@/config/product";
import { dictionaries } from "@/i18n/dictionaries";
export default function FoundationPage() {
  const t = dictionaries[product.defaultLocale];
  return <main id="main">
    <header><span className="mark" aria-hidden="true">c.</span><span>codematt <strong>agent</strong></span></header>
    <section aria-labelledby="title">
      <p className="eyebrow">{t.phase}</p>
      <h1 id="title">{t.title}</h1>
      <p className="description">{t.description}</p>
      <div className="status"><span className="dot" aria-hidden="true"/><p>{t.status}</p></div>
      <p className="next">{t.next}</p>
    </section>
    <footer>{product.tagline} · by codematt</footer>
  </main>;
}
