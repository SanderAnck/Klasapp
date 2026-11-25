# Klashouding volgen

Een eenvoudige webapp voor de juf of meester in het lager onderwijs: beoordeel per lesmoment snel de klashouding van je leerlingen, bekijk per kind een overzicht met groeifeedback en rapporttekst, en exporteer alles voor het rapport.

- Per lesmoment kies je maximum **10 criteria**, zodat elk kind hoogstens 10 vragen krijgt.
- Alles staat in één bestand (`index.html`), zonder framework of build-stap.
- De app werkt offline na de eerste keer laden.

## 1. GitHub Pages aanzetten

1. Open de repository op github.com.
2. Ga naar **Settings → Pages**.
3. Bij *Build and deployment* kies je **Deploy from a branch**.
4. Kies de branch **main** en de map **/ (root)** en tik op **Save**.
5. Na een minuutje staat de app op `https://<jouw-gebruikersnaam>.github.io/<repository>/`.

## 2. De app op het beginscherm van je iPhone zetten

1. Open de link hierboven in **Safari** (niet in Chrome).
2. Tik op de **deelknop** (vierkantje met pijltje omhoog).
3. Kies **Zet op beginscherm** en tik op **Voeg toe**.
4. Open de app voortaan via het icoon op je beginscherm.

## 3. Back-ups nemen

Je gegevens staan **enkel op dit toestel**, in de browser. Neem daarom geregeld een back-up:

1. Ga naar **Klas & criteria → Back-up**.
2. Tik op **Kopieer back-up** en bewaar de tekst, bv. in een notitie of een mail aan jezelf.
3. Terugzetten of overzetten naar een ander toestel: plak de tekst in het vak **Back-up terugzetten** en tik twee keer op de knop. Let op: dit vervangt alle gegevens op dat toestel.

## 4. Een nieuwe versie uitbrengen

1. Pas de bestanden aan.
2. Verhoog in `sw.js` de `VERSIE` (bv. van `'klashouding-v1'` naar `'klashouding-v2'`).
3. Commit en push naar `main`. GitHub Pages zet de nieuwe versie automatisch online; open de app een keer met internet en de update is binnen.
