# Design System

## UI könyvtár / komponensek

Az alkalmazás frontendje React alapokon készült, Tailwind CSS használatával a gyors és konzisztens stíluskezelés érdekében.  
A komponensek moduláris felépítésűek, újrafelhasználható React komponensekből állnak (pl. kártyák, űrlapok, navigációs elemek).

---

## Színpaletta

Az alkalmazás egy modern, letisztult, meleg színvilágot használ, amely az egészséges életmódhoz és étkezéshez kapcsolódik.

- Primary: #f97316 (narancssárga)
- Secondary: #fb923c (világos narancs)
- Accent: #22c55e (zöld – egészséges életmód)
- Background: #f9fafb (világos háttér)
- Surface: #ffffff (kártyák)
- Text primary: #111827
- Text secondary: #6b7280
- Success: #22c55e
- Warning: #facc15
- Error: #ef4444

---

## Tipográfia

- Betűtípus: rendszer alapértelmezett sans-serif (pl. Inter / system-ui)
- Címsorok: félkövér (font-weight 600–700)
- Törzsszöveg: normál (400)

### Méret skála:
- H1: ~32px
- H2: ~24px
- H3: ~20px
- Body: ~14–16px
- Small text: ~12px

A tipográfia célja az olvashatóság és a jól strukturált információs hierarchia.

---

## Spacing / Grid rendszer

- Alap egység: 8px
- Margin és padding értékek 8px többszörösei
- Kártyák között egységes spacing
- Max content width: ~1200–1400px

Ez biztosítja a konzisztens és rendezett layoutot.

---

## Ikonkészlet

- Használt ikonok: Lucide (vagy hasonló modern ikon library)
- Egyszerű, letisztult, lineáris ikonok
- Ikonok használata:
  - navigációban
  - gombok mellett
  - státusz visszajelzésekhez

---

## Reszponzív design

Az alkalmazás reszponzív, és több eszközön is használható.

### Breakpointok:
- Mobile: < 768px
- Tablet: 768px – 1024px
- Desktop: > 1024px

A layout rugalmas:
- mobilon egyoszlopos
- desktopon többoszlopos elrendezés

---

## Sötét mód

- Nem támogatott jelenleg
- A rendszer világos témára optimalizált

