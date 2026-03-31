# Project Plan -- Egészséges Táplálkozás Alkalmazás

## Egy mondatos értékajánlat

Egy személyre szabható egészséges táplálkozási webalkalmazás, amely
segít a tudatos életmódra törekvő felhasználóknak eligazodni a különböző
diéták között, és a kalóriaszámláláson túlmutatva személyre szabott
étrendekkel, ajánlásokkal és intelligens funkciókkal támogatja a hosszú
távon fenntartható életmódot.

## Képességek

  --------------------------------------------------------------------------
  Képesség          Kategória         Komplexitás       Miért nem triviális?
  ----------------- ----------------- ----------------- --------------------
  Főoldal és        Value             S                 Dinamikus tartalmak
  kiemelt tartalmak                                     (cikkek, receptek)
                                                        kiemelése és
                                                        aggregálása

  Bejelentkezés és  Productization    M                 JWT-alapú
  szerepkörök                                           hitelesítés és
                                                        role-based
                                                        hozzáférés

  Receptkeresés és  Value             M                 Kulcsszó- és
  böngészés                                             kategóriaalapú
                                                        keresés, szűrés és
                                                        szezonális ajánlások

  Receptkezelés     Value             M                 Több entitás
  (CRUD, értékelés,                                     kezelése és
  komment)                                              felhasználói
                                                        interakciók

  Cikkek és         Value             M                 Tartalomkezelés és
  tudásanyagok                                          különböző típusú
                                                        bejegyzések kezelése

  Interaktív        Value             M                 Felhasználói
  tartalom (kvízek)                                     válaszok kezelése és
                                                        visszacsatolás

  Személyre szabott Value             L                 Több paraméter
  étrendtervezés                                        alapján generált
                                                        étrend és
                                                        optimalizálás

  Kalóriaszámláló   Value             L                 Napi adatok
  és tápanyagkövető                                     aggregálása és
                                                        makrók számítása

  Receptajánló      Value             M                 Profil és kalóriacél
  rendszer                                              alapján dinamikus
                                                        ajánlás

  Bevásárlólista    Value             M                 Több recept
  generálás                                             hozzávalóinak
                                                        összesítése

  Profilkezelés     Value             M                 Felhasználói adatok
                                                        integrálása más
                                                        funkciókba

  AI-alapú chatbot  Value             M                 OpenAI API
                                                        integráció és
                                                        kontextus-kezelés

  Fitnesz adatok    Value             L                 Külső API-k kezelése
  integrációja                                          és adat
                                                        szinkronizáció

  Admin felület és  Productization    L                 Jogosultságkezelés
  moderáció                                             és tartalommoderáció

  Hibakezelés és    Productization    M                 Backend validáció és
  validáció                                             egységes API
                                                        válaszok

  Reszponzív        Productization    M                 Több eszközön való
  felület                                               helyes megjelenítés
  --------------------------------------------------------------------------

## A legnehezebb rész

Az étrendtervező megvalósítása, mivel több adat és szabály kombinációját
igényli, és iteratív finomhangolás szükséges a megfelelő eredményekhez.

## Tech stack -- indoklással

  -----------------------------------------------------------------------
  Réteg                   Technológia             Miért ezt és nem mást?
  ----------------------- ----------------------- -----------------------
  UI                      React                   Komponensalapú
                                                  architektúra és gyors
                                                  fejlesztés

  Backend / logika        Node.js + Express       Egyszerű REST API és jó
                                                  integráció

  Adattárolás             MySQL                   Relációs adatok
                                                  kezelésére ideális

  Auth                    JWT                     SPA alkalmazásokhoz jól
                                                  illeszkedik

  AI                      OpenAI API              Gyors chatbot
                                                  integráció

  Verziókezelés           GitHub                  Verziókövetés és
                                                  együttműködés
  -----------------------------------------------------------------------

## Ami kimarad (non-goals)

-   Mobil alkalmazás
-   Valós idejű push értesítések teljes implementációja

## Ami még nem tiszta

-   Az étrendtervező részletessége
-   A chatbot kontextusának mélysége
-   A statisztikák komplexitása
