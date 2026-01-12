# DanceArena
DanceArena je web platforma namijenjena organizaciji plesnih natjecanja. Cilj projekta je digitalizirati i pojednostaviti proces prijave, organizacije i ocjenjivanja plesnih natjecanja na jednom mjestu. Platforma omogućuje organizatorima natjecanja, voditeljima klubova, sucima i administratorima da međusobno surađuju kroz jasno definirane uloge i funkcionalnosti.

Platforma se temelji na ideji da svi sudionici plesne scene (organizatori, klubovi i suci) imaju pristup intuitivnom i učinkovitom sustavu koji smanjuje administrativni teret i povećava transparentnost rezultata natjecanja.

### Ciljevi projekta
- omogućiti jednostavno kreiranje i vođenje plesnih natjecanja putem web sučelja
- olakšati prijavu klubova i grupa na natjecanja
- osigurati transparentan sustav ocjenjivanja putem digitalnog sučelja za suce
- omogućiti automatizirano generiranje startnih lista i rezultata
- integrirati online plaćanja članarina i kotizacija putem kreditnih kartica
- poboljšati komunikaciju i koordinaciju između svih sudionika natjecanja

# Funkcionalni zahtjevi

Autentifikacija i prijava korisnika (F-001, F-002): Korisnici se prijavljuju pomoću Google ili Facebook računa, a autentifikacija se obavlja putem sigurnog OAuth 2.0 protokola.

Pregled i upravljanje natjecanjima (F-003, F-004): Svi korisnici mogu pregledavati natjecanja, dok organizatori mogu kreirati nova natjecanja, definirati kategorije i birati suce.

Plaćanje članarine i kotizacija (F-005, F-007): Organizatori plaćaju godišnju članarinu za korištenje platforme, a voditelji klubova plaćaju kotizacije prilikom prijave na natjecanje.

Prijava klubova i nastupa (F-006): Voditelji klubova mogu prijaviti svoje grupe, unijeti podatke o koreografiji i učitati glazbene datoteke.

Upravljanje prijavama (F-008): Organizatori mogu pregledavati i upravljati prijavama (odobriti, izmijeniti, odbiti).

Generiranje PDF dokumenata (F-009): Sustav automatski generira PDF dokumente sa startnim listama.

Bodovanje i rangiranje (F-010, F-012): Suci unose ocjene (0–30 bodova), a nakon završetka natjecanja sustav automatski izračunava rezultate i objavljuje rang liste.

Administracija sustava (F-011): Administrator ima najviše ovlasti, upravlja korisnicima, postavlja cijene članstva i nadzire objave i prijave.

# Tehnologije

Aplikacija je razvijena koristeći JavaScript (ES2023) na klijentskoj i poslužiteljskoj strani, što omogućuje jednostavnu integraciju frontenda i backenda.

Korisničko sučelje izrađeno je u Reactu v18 koji omogućuje razvoj modularnih i ponovno iskoristivih komponenti. Serverski dio aplikacije razvijen je pomoću Node.js i Express.js koji se koriste za izradu REST API-ja i obradu HTTP zahtjeva.

Za pohranu podataka koristi se MongoDB NoSQL baza podataka, hostana putem MongoDB Atlas servisa. Autentifikacija korisnika implementirana je pomoću OAuth 2.0. Za online plaćanja korišten je Stripe.

Razvoj aplikacije proveden je u alatu Visual Studio Code, uz verzioniranje izvornog koda pomoću Gita i repozitorija na GitHubu. Dizajn korisničkog sučelja izrađen je u alatu Figma.

Generiranje PDF-a sa startnom listom obavlja se s pomoću PDFkita.

Aplikacija je deployana u oblaku. Frontend je hostan na platformi Vercel, a backend na platformi Render. Testiranje aplikacije provedeno je ručno tijekom razvoja.

# Članovi tima

- Dorijan Gučin 
- Alen Jurina
- Karlo Krznar
- Tihana Lončarek
- Rafael Lovrenčić
- Emanuel Rod - voditelj tima
- Viktor Veverec

# Kontribucije

> detaljna pravila u [CONTRIBUTING.md](https://github.com/RafaelLovrencic/DanceArena-DEVTRAK/blob/master/CONTRIBUTING.md)

### Issue
Prije početka rada potrebno je otvoriti **issue** s odgovarajućom kategorijom u naslovu:  
\[BUG\], \[ZNAČAJKA\] ili \[DOKUMENTACIJA\]

- Dodijeliti issue sebi ili članu tima  
- Po želji dodati **tag**  
- Ispuniti **opis** ako zadatak obuhvaća više elemenata  

### Commit
Svaki **commit** mora jasno opisivati što je promijenjeno.  
Za složenije promjene dodati i detaljniji opis.  

**Primjeri:**
```bash
Fixes #12: Ispravljena greška pri učitavanju proizvoda
Refs #8: Dodan dio funkcionalnosti za filtriranje
```

#### Ključne riječi 
- Fixes/Resolves - zatvaraju issue
- Refs - pridodaje commit bez zatvaranja issue-a

### Dokumentiranje rada
1. otvoriti i zatvoriti issue prema pravilima
2. zabilježiti promjene dokumentacije u [dnevnik](https://github.com/RafaelLovrencic/DanceArena-DEVTRAK/wiki/B.-Dnevnik-promjena-dokumentacije)
3. dodati vrijeme rada u [tablicu aktivnosti](https://github.com/RafaelLovrencic/DanceArena-DEVTRAK/wiki/C.-Prikaz-aktivnosti-grupe#tablica-aktivnosti)

### Stil kodiranja

| Pravilo     | Opis                                              |
| ----------- | ------------------------------------------------- |
| Imenovanje  | camelCase                                         |
| Zagrade     | Otvorena `{` u istom redu kao definicija funkcije |
| Indentacija | 4 razmaka                                         |
| Razmaci     | Ostaviti razmak između operatora i operanada      |
| Struktura   | Prazan red između logičkih cjelina                |

