# Dynastree (万承) — LPA-Custodian Docs

Bilingual (中文 / English), searchable documentation site for the Dynastree (万承) LPA-Custodian specification — a Telegram-first digital asset, RWA & distribution ecosystem covering MLM/CRM, binary trading, RWA infrastructure, custody, compliance, and the LPA-Custodian (族谱连) inheritance system. Static site, no build step, all 61 sections in both languages with full-text search.

**Live site:** https://mjoechia.github.io/Dynastree_docs/

**Original PDF:** [`assets/Dynastree_LPA-Custodian_EN_CN.pdf`](assets/Dynastree_LPA-Custodian_EN_CN.pdf)

Also included: the **DYN & DYNUSD Token Ecosystem Whitepaper** — a gold/dark premium whitepaper covering token roles, DYN tokenomics, DYNUSD architecture, treasury model, and the four-phase Dynastree Chain roadmap.

- **Whitepaper site:** https://mjoechia.github.io/Dynastree_docs/whitepaper.html
- **Whitepaper PDF:** [`assets/Dynastree_DYN_Whitepaper.pdf`](assets/Dynastree_DYN_Whitepaper.pdf)

Also included: the **LEGACY (万承) — LGT Ecosystem Architecture** briefing — an investor/partner-facing document (English then Chinese) covering the five core LGT pillars, target technology infrastructure partners, target institutional liquidity partners, and the ecosystem architecture diagram. All partner/company names are explicitly presented as potential / target integrations under evaluation, not confirmed partnerships.

- **PDF:** [`assets/Legacy_LGT_Ecosystem_Architecture.pdf`](assets/Legacy_LGT_Ecosystem_Architecture.pdf)

## Structure

- `index.html` / `styles.css` / `app.js` — the LPA-Custodian spec site (vanilla JS, no build step)
- `data/content.json` — structured bilingual section content, extracted from the source `generate_dynastree_pdf.py` spec script
- `whitepaper.html` / `whitepaper.css` / `whitepaper.js` — the DYN/DYNUSD token whitepaper site (gold theme, shares `styles.css` as a base)
- `data/whitepaper-content.json` — structured content for the whitepaper, mirroring `generate_dyn_whitepaper_pdf.py`
- `assets/` — original formatted PDFs (LPA-Custodian spec, DYN whitepaper, LEGACY/LGT architecture briefing)
