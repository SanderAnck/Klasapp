# Klasapp koppelen aan Google Sheet en Google Drive

Hiermee komen al je gegevens (alle klassen, leerlingen, criteria, lesmomenten, scores en notities) automatisch in **één Google Sheet** terecht. Daarnaast bewaart Google Drive een volledige kopie als bestand, plus één back-up per dag.

Je doet dit één keer, op een computer (dat gaat het makkelijkst). Reken op een tiental minuten.

## Stap 1. Maak de Google Sheet

1. Ga naar [sheets.new](https://sheets.new) (je bent aangemeld met je Google-account).
2. Geef de sheet een naam, bv. **Klasapp**.

## Stap 2. Plak het koppelscript

1. Kies in de sheet het menu **Extensies → Apps Script**.
2. Wis alles wat in `Code.gs` staat.
3. Plak de volledige inhoud van [`Code.gs`](Code.gs) uit deze map.
4. Tik op het **diskette-icoon** (Project opslaan).

## Stap 3. Installeer en geef toestemming

1. Kies bovenaan bij de functies **installeer** en klik op **▶ Uitvoeren**.
2. Google vraagt toestemming. Klik op **Machtigingen controleren**, kies je account.
3. Je ziet *"Google heeft deze app niet geverifieerd"*. Dat is normaal: het is je eigen script. Klik op **Geavanceerd → Ga naar … (onveilig)** en daarna op **Toestaan**.
   Het script vraagt toegang tot je spreadsheets (om de tabbladen te schrijven) en tot Drive (om de back-upbestanden te bewaren).
4. Onderaan in het uitvoeringslogboek staat: *Klaar. Je koppelcode is: …*. In de sheet staat die code ook op het tabblad **Koppeling**.

## Stap 4. Zet het script online als webapp

1. Klik rechtsboven op **Implementeren → Nieuwe implementatie**.
2. Klik op het tandwiel naast *Type selecteren* en kies **Web-app**.
3. Vul in:
   - **Uitvoeren als:** *Ik* (je eigen account)
   - **Wie heeft toegang:** *Iedereen*
4. Klik op **Implementeren** en kopieer de **Web-app-URL** (eindigt op `/exec`).

"Iedereen" is nodig omdat de app op je iPhone zich niet bij Google aanmeldt. Wie de URL kent, kan nog niets zonder de **koppelcode**: het script weigert elk verzoek zonder de juiste code. Deel de URL en de code dus met niemand.

## Stap 5. Koppel de app

1. Open de app op je iPhone en ga naar **Instellingen → Google Sheet**.
2. Plak de **webapp-URL** en de **koppelcode**. Geef het toestel eventueel een naam.
3. Tik op **Koppelen**. Na een paar seconden staat bovenaan *Opgeslagen in Google Sheet ✓*.

Vanaf nu gaat elke wijziging enkele seconden later vanzelf naar de sheet. Zonder internet wacht de app en verstuurt ze alles zodra je weer online bent.

## Wat staat er in de sheet?

| Tabblad | Inhoud |
|---|---|
| **Overzicht** | Per klas, leerling en criterium: gemiddelde (1–4), ++ / + / − / −−, aantal scores, trend |
| **Rapport** | Per leerling de rapporttekst en de groeifeedback (over alle lesmomenten) |
| **Scores** | Elke afzonderlijke score: klas, datum, vak, leerling, criterium, score. Handig voor filters en draaitabellen |
| **Notities** | Notities en afwezigheden per lesmoment |
| **Lesmomenten**, **Leerlingen**, **Criteria**, **Klassen** | De instellingen van elke klas |
| **Koppeling** | Je koppelcode en de laatste synchronisatie |

De tabbladen worden bij elke synchronisatie **volledig herschreven** vanuit de app. De app blijft dus de plek waar je gegevens invult; aanpassingen die je rechtstreeks in de sheet doet, worden overschreven. Wil je zelf berekeningen of grafieken maken, doe dat dan op een eigen, nieuw tabblad dat naar deze tabbladen verwijst.

In Google Drive vind je naast de sheet de map **Klasapp back-ups** met:

- `klasapp-gegevens.json`: altijd de laatste volledige versie;
- `klasapp-JJJJ-MM-DD.json`: één back-up per dag.

## De sheet leegmaken

In de app: **Instellingen → Google Sheet → Google Sheet leegmaken** (twee keer tikken). Alle tabbladen worden leeggemaakt (de kolomnamen blijven staan) en `klasapp-gegevens.json` gaat naar de prullenbak. De dagelijkse back-ups in de map blijven bewaard. De gegevens op het toestel zelf blijven staan; bij de volgende wijziging komen ze opnieuw in de sheet.

## Een tweede toestel (bv. iPad of computer)

1. Op je toestel dat al gekoppeld is: **Instellingen → Google Sheet → Kopieer toestelcode** (of **Deel toestelcode**). Stuur die code naar je andere toestel, bv. via AirDrop, Berichten of mail.
2. Op het andere toestel: open de app, ga naar **Instellingen → Google Sheet**, plak de code bij **Toestelcode** en tik op **Koppelen**.
3. Staan er op dat toestel nog geen gegevens, dan worden alle gegevens meteen opgehaald. Staan er wel al gegevens, dan kies je bovenaan **Ophalen** of **Dit toestel doorzetten**.

Werk je op twee toestellen, dan wint de laatste wijziging. Heeft de sheet nieuwere gegevens dan het toestel waarop je werkt, dan krijg je bij het openen van de app bovenaan een melding en kies je zelf of je ophaalt of je eigen versie doorzet.

## Het script later bijwerken

Komt er een nieuwe versie van `Code.gs`: plak ze in Apps Script, sla op en kies **Implementeren → Implementaties beheren → ✏️ (bewerken) → Versie: Nieuwe versie → Implementeren**. De URL blijft dezelfde.

## Privacy

Het gaat om gegevens van leerlingen. Ze staan in je eigen Google Drive en worden enkel gedeeld met wie jij de sheet geeft. Gebruik bij voorkeur het Google-account dat je school daarvoor voorziet, en volg de afspraken van je school rond leerlingengegevens.
