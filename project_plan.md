# Project Plan – Egészséges Táplálkozás Alkalmazás

## Egy mondatos értékajánlat

Egy személyre szabható egészséges táplálkozási webalkalmazás, amely segít a tudatos életmódra törekvő felhasználóknak eligazodni a különböző diéták között, és a kalóriaszámláláson túlmutatva személyre szabott étrendekkel, ajánlásokkal és intelligens funkciókkal támogatja a hosszú távon fenntartható életmódot.

## Képességek

| Képesség | Kategória | Komplexitás | Miért nem triviális? |
|---|---|---|---|
| Főoldal és kiemelt tartalmak | Value | S | Dinamikus tartalmak (cikkek, receptek) kiemelése és aggregálása |
| Bejelentkezés és szerepkörök | Productization | M | JWT-alapú hitelesítés és role-based hozzáférés |
| Receptkeresés és böngészés | Value | M | Kulcsszó- és kategóriaalapú keresés, szűrés és szezonális ajánlások |
| Receptkezelés (CRUD, értékelés, komment) | Value | M | Több entitás kezelése és felhasználói interakciók |
| Cikkek és tudásanyagok | Value | M | Tartalomkezelés és különböző típusú bejegyzések kezelése |
| Interaktív tartalom (kvízek) | Value | M | Felhasználói válaszok kezelése és visszacsatolás |
| Személyre szabott étrendtervezés | Value | L | Több paraméter alapján generált étrend és optimalizálás |
| Kalóriaszámláló és tápanyagkövető | Value | L | Napi adatok aggregálása és makrók számítása |
| Receptajánló rendszer | Value | M | Profil és kalóriacél alapján dinamikus ajánlás |
| Bevásárlólista generálás | Value | M | Több recept hozzávalóinak összesítése |
| Profilkezelés | Value | M | Felhasználói adatok integrálása más funkciókba |
| AI-alapú chatbot | Value | M | OpenAI API integráció és kontextus-kezelés |
| Fitnesz adatok integrációja | Value | L | Külső API-k kezelése és adat szinkronizáció |
| Admin felület és moderáció | Productization | L | Jogosultságkezelés és tartalommoderáció |
| Hibakezelés és validáció | Productization | M | Backend validáció és egységes API válaszok |
| Reszponzív felület | Productization | M | Több eszközön való helyes megjelenítés |

## A legnehezebb rész

Az étrendtervező megvalósítása, mivel több adat és szabály kombinációját igényli, és iteratív finomhangolás szükséges a megfelelő eredményekhez.

## Tech stack – indoklással

| Réteg | Technológia | Miért ezt és nem mást? |
|---|---|---|
| UI | React | Komponensalapú architektúra és gyors fejlesztés |
| Backend / logika | Node.js + Express | Egyszerű REST API és jó integráció |
| Adattárolás | MySQL | Relációs adatok kezelésére ideális |
| Auth | JWT | SPA alkalmazásokhoz jól illeszkedik |
| AI | OpenAI API | Gyors chatbot integráció |
| Verziókezelés | GitHub | Verziókövetés és együttműködés |

## Ami kimarad (non-goals)

- Mobil alkalmazás  
- Valós idejű push értesítések teljes implementációja  

## Ami még nem tiszta

- Az étrendtervező részletessége  
- A chatbot kontextusának mélysége  
- A statisztikák komplexitása  