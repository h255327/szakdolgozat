# Képernyő leírások

| id | név | cél | belépési pont | auth szükséges | fő interakciók | adatforrások | validációk | kezelt állapotok | a11y |
|----|-----|-----|---------------|----------------|----------------|--------------|------------|------------------|------|
| S01 | Bejelentkezés | Felhasználó bejelentkezése a rendszerbe | induló | nem | bejelentkezési űrlap beküldése; regisztráció link | /api/auth/login | email formátum; kötelező jelszó | loading; error; success | label-input kapcsolat; billentyű navigáció |
| S02 | Regisztráció | Új felhasználó létrehozása | S01 | nem | regisztrációs űrlap beküldése; bejelentkezés link | /api/auth/register | email formátum; jelszó hossz; kötelező mezők | loading; error; success | label-input kapcsolat; billentyű navigáció |
| S03 | Főoldal | Kiemelt tartalmak és navigáció biztosítása | S01 | igen | navigáció; kiemelt receptek/cikkek kiválasztása | /api/recipes; /api/articles | nincs | loading; empty; success | kontraszt; kép alt szöveg |
| S04 | Receptek | Receptek böngészése és keresése | S03 | igen | keresés; szűrés; recept kiválasztása | /api/recipes | nincs | loading; empty; success | kép alt szöveg; billentyű navigáció |
| S05 | Recept részletek | Egy recept részletes megjelenítése | S04 | igen | recept megtekintése; visszanavigálás | /api/recipes/:id | nincs | loading; success | kép alt szöveg; olvasható layout |
| S06 | Cikkek | Edukációs tartalmak böngészése | S03 | igen | cikk kiválasztása; navigáció | /api/articles | nincs | loading; empty; success | olvasható tipográfia; kontraszt |
| S07 | Dashboard | Felhasználói áttekintés és gyors navigáció | S03 | igen | navigáció; statisztikák megtekintése | /api/meals; /api/profile | nincs | loading; success | egyértelmű hierarchia; kontraszt |
| S08 | Profil | Felhasználói adatok kezelése | S07 | igen | űrlap szerkesztése; mentés | /api/users | mező validáció; kötelező mezők | loading; error; success | label-input kapcsolat |
| S09 | Étkezéskövető | Napi étkezések és makrók követése | S07 | igen | étel hozzáadása; szerkesztés | /api/meals; /api/meals/:id/items | szám validáció; kötelező mezők | loading; empty; success | táblázat olvashatóság; billentyű navigáció |
| S10 | Étrendtervező | Személyre szabott étrend generálása | S07 | igen | terv generálása | /api/planner | nincs | loading; success | átlátható elrendezés; kontraszt |
| S11 | Bevásárlólista | Hozzávalók listájának kezelése | S07 | igen | lista szerkesztése; kipipálás | /api/shopping | nincs | success | checkbox akadálymentesség |
| S12 | Chatbot | AI alapú táplálkozási segítség | S07 | igen | üzenet küldése; válasz fogadása | /api/chat | nincs | loading; success | chat struktúra; kontraszt |