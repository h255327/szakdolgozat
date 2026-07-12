# User Journeys

## 1. Teljes napi étkezés kezelése (Meal Logging + Monitoring Flow)

**Persona:** Egészségtudatos felhasználó, aki napi szinten szeretné követni a kalória- és makróbevitelét, és optimalizálni az étrendjét.  
**Belépési pont:** Dashboard (S07)

### Lépések:

1. **S07 — Dashboard**  
   A felhasználó áttekinti a napi állapotot (pl. kalória)  
   → „Étkezéskövető” kiválasztása  

2. **S09 — Étkezéskövető**  
   A felhasználó megtekinti a már rögzített étkezéseket  

3. **S09 — Étkezéskövető**  
   Új étel hozzáadása  
   → űrlap megjelenik  

4. **S09 — Étkezéskövető**  
   A felhasználó megadja:
   - étel neve  
   - mennyiség  
   - (manuális vagy automatikus mód)  

   **Hibaág:**  
   Hibás számformátum vagy hiányzó mező → validációs hiba  

5. **S09 — Étkezéskövető**  
   A rendszer kiszámolja a kalóriát és makrókat  

6. **S09 — Étkezéskövető**  
   Mentés után az étel megjelenik a listában  

7. **S09 → S07 — Dashboard**  
   A felhasználó visszatér a Dashboardra  

8. **S07 — Dashboard**  
   Frissített napi összesítés jelenik meg  

### Sikerkritérium:
A felhasználó pontosan látja a napi bevitelét és annak változását  

### Időtartam:
~40–70 másodperc, 6–9 interakció  

---

## 2. Recept → Étkezés integrált flow (Recipe → Meal Flow)

**Persona:** Felhasználó, aki receptekből inspirálódik, majd az elfogyasztott ételt szeretné rögzíteni.  
**Belépési pont:** Főoldal (S03)

### Lépések:

1. **S03 — Főoldal**  
   A felhasználó kiemelt receptet választ  
   → S05  

2. **S05 — Recept részletek**  
   A felhasználó:
   - megtekinti a hozzávalókat  
   - eldönti, hogy elkészíti  

3. **S05 → S04 — Receptek**  
   A felhasználó további recepteket böngész  

4. **S04 — Receptek**  
   Keresés vagy szűrés használata  

5. **S04 → S05**  
   Új recept kiválasztása  

6. **S05 → S09 — Étkezéskövető**  
   Navbar segítségével navigáció  

7. **S09 — Étkezéskövető**  
   A felhasználó hozzáadja az ételt:
   - recept neve alapján  
   - mennyiség megadásával  

8. **S09 — Étkezéskövető**  
   A rendszer kiszámolja a tápértékeket  

   **Hibaág:**  
   Hibás input → validáció  

9. **S09 — Étkezéskövető**  
   Mentés → lista frissül  

### Sikerkritérium:
A felhasználó sikeresen átalakította a recept inspirációt konkrét étkezési adattá  

### Időtartam:
~50–80 másodperc, 7–10 interakció  

---

## 3. AI alapú étrendtervezés és végrehajtás (Planner + Chatbot Flow)

**Persona:** Felhasználó, aki nem tudja mit egyen, és segítséget kér az alkalmazástól.  
**Belépési pont:** Dashboard (S07)

### Lépések:

1. **S07 — Dashboard**  
   A felhasználó kiválasztja a Chatbotot  
   → S12  

2. **S12 — Chatbot**  
   A felhasználó kérdést tesz fel:  
   „Mit egyek ma vacsorára?”  

3. **S12 — Chatbot**  
   A rendszer válaszol ajánlással  

   **Hibaág:**  
   API hiba → fallback vagy hibaüzenet  

4. **S12 → S10 — Étrendtervező**  
   A felhasználó átnavigál  

5. **S10 — Étrendtervező**  
   „Generálás” gomb megnyomása  

6. **S10 — Étrendtervező**  
   A rendszer:
   - figyelembe veszi a profilt  
   - napi tervet generál  

7. **S10 → S04 — Receptek**  
   A felhasználó konkrét recepteket keres  

8. **S04 → S05 — Recept részletek**  
   Recept kiválasztása  

9. **S05 → S09 — Étkezéskövető**  
   Az étel rögzítése  

10. **S09 — Étkezéskövető**  
   A rendszer frissíti a napi értékeket  

### Sikerkritérium:
A felhasználó AI segítséggel teljes étrendet kap és azt végre is hajtja  

### Időtartam:
~60–120 másodperc, 8–12 interakció  