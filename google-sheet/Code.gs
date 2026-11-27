/**
 * Klashouding volgen – koppeling met Google Sheet en Google Drive.
 *
 * Plak dit hele bestand in Extensies → Apps Script van je Google Sheet.
 * Zie google-sheet/HANDLEIDING.md voor de stappen.
 *
 * Wat dit script doet:
 *  - De app stuurt na elke wijziging al je gegevens (alle klassen) hierheen.
 *  - Het script schrijft leesbare tabbladen in deze sheet (Scores, Overzicht, Rapport, …).
 *  - Het bewaart de volledige gegevens ook als JSON-bestand in Google Drive,
 *    plus één back-up per dag, in de map "Klasapp back-ups" naast deze sheet.
 *  - Een ander toestel kan de gegevens hier weer ophalen.
 */

const TABBLADEN = ['Overzicht', 'Rapport', 'Scores', 'Notities', 'Lesmomenten', 'Leerlingen', 'Criteria', 'Klassen'];
const MAP_NAAM = 'Klasapp back-ups';
const BESTAND_LAATSTE = 'klasapp-gegevens.json';

/* ---------- Eenmalige installatie ---------- */

/** Voer deze functie één keer uit vanuit de Apps Script-editor (knop ▶ Uitvoeren). */
function installeer() {
  const props = PropertiesService.getScriptProperties();
  let code = props.getProperty('KOPPELCODE');
  if (!code) {
    code = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    props.setProperty('KOPPELCODE', code);
  }
  map_();
  const ss = SpreadsheetApp.getActive();
  TABBLADEN.forEach(n => tab_(ss, n));
  const info = tab_(ss, 'Koppeling');
  info.clear();
  info.getRange(1, 1, 4, 2).setValues([
    ['Koppelcode', code],
    ['Uitleg', 'Plak deze koppelcode samen met de webapp-URL in de app: Instellingen → Google Sheet.'],
    ['Laatste synchronisatie', props.getProperty('BIJGEWERKT_TEKST') || 'nog niet'],
    ['Van toestel', props.getProperty('TOESTEL') || '']
  ]);
  info.getRange('A1:A4').setFontWeight('bold');
  info.setColumnWidth(1, 180);
  info.setColumnWidth(2, 520);
  const leeg = ss.getSheetByName('Blad1') || ss.getSheetByName('Sheet1');
  if (leeg && leeg.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(leeg);
  Logger.log('Klaar. Je koppelcode is: ' + code);
  return code;
}

/** Maakt een nieuwe koppelcode. Oude toestellen moeten daarna opnieuw gekoppeld worden. */
function nieuweKoppelcode() {
  PropertiesService.getScriptProperties().deleteProperty('KOPPELCODE');
  return installeer();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Klasapp')
    .addItem('Koppelcode tonen', 'toonKoppelcode')
    .addToUi();
}

function toonKoppelcode() {
  const code = PropertiesService.getScriptProperties().getProperty('KOPPELCODE') || installeer();
  SpreadsheetApp.getUi().alert('Koppelcode voor de app', code, SpreadsheetApp.getUi().ButtonSet.OK);
}

/* ---------- Webapp ---------- */

function doGet() {
  return json_({ ok: true, app: 'klashouding', bericht: 'De koppeling werkt. Gebruik deze URL in de app.' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, fout: 'ongeldig' }); }
  const props = PropertiesService.getScriptProperties();
  const code = props.getProperty('KOPPELCODE');
  if (!code || req.code !== code) return json_({ ok: false, fout: 'koppelcode' });

  if (req.actie === 'info') return json_(info_(props));
  if (req.actie === 'ophalen') return ophalen_(props);
  if (req.actie === 'opslaan') return opslaan_(req, props);
  if (req.actie === 'wissen') return wissen_(req, props);
  return json_({ ok: false, fout: 'onbekende actie' });
}

function info_(props) {
  return {
    ok: true,
    bijgewerkt: Number(props.getProperty('BIJGEWERKT') || 0),
    toestel: props.getProperty('TOESTEL') || '',
    sheet: SpreadsheetApp.getActive().getUrl()
  };
}

function ophalen_(props) {
  const id = props.getProperty('BESTAND_ID');
  if (!id) return json_({ ok: true, leeg: true });
  const db = JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString('UTF-8'));
  const res = info_(props);
  res.db = db;
  return json_(res);
}

function opslaan_(req, props) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const db = req.db;
    if (!db || db.v !== 2 || !db.klassen) return json_({ ok: false, fout: 'ongeldige gegevens' });
    const nieuw = Number(db.bijgewerkt || 0);
    const huidig = Number(props.getProperty('BIJGEWERKT') || 0);
    // Niet zomaar nieuwere gegevens van een ander toestel overschrijven.
    if (!req.forceer && huidig > nieuw && props.getProperty('TOESTEL') !== req.toestel) {
      const res = info_(props);
      res.ok = false;
      res.fout = 'conflict';
      return json_(res);
    }

    const tekst = JSON.stringify(db);
    const map = map_();
    const id = props.getProperty('BESTAND_ID');
    let bestand = null;
    if (id) { try { bestand = DriveApp.getFileById(id); if (bestand.isTrashed()) bestand = null; } catch (err) { bestand = null; } }
    if (bestand) bestand.setContent(tekst);
    else {
      bestand = map.createFile(BESTAND_LAATSTE, tekst, 'application/json');
      props.setProperty('BESTAND_ID', bestand.getId());
    }
    // Eén back-up per dag (wordt die dag telkens bijgewerkt).
    const tz = Session.getScriptTimeZone();
    const dag = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    const naam = 'klasapp-' + dag + '.json';
    const it = map.getFilesByName(naam);
    if (it.hasNext()) it.next().setContent(tekst); else map.createFile(naam, tekst, 'application/json');

    schrijfTabs_(req.tabs || {});

    const stempel = Utilities.formatDate(new Date(nieuw || Date.now()), tz, 'dd/MM/yyyy HH:mm:ss');
    props.setProperties({
      BIJGEWERKT: String(nieuw || Date.now()),
      BIJGEWERKT_TEKST: stempel,
      TOESTEL: String(req.toestel || '')
    });
    const info = SpreadsheetApp.getActive().getSheetByName('Koppeling');
    if (info) info.getRange('B3:B4').setValues([[stempel], [String(req.toestelNaam || req.toestel || '')]]);
    return json_(info_(props));
  } finally {
    lock.releaseLock();
  }
}

/** Maakt de sheet leeg (kolomnamen blijven staan) en verwijdert het gegevensbestand. De dagelijkse back-ups in Drive blijven bewaard. */
function wissen_(req, props) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActive();
    TABBLADEN.forEach(naam => {
      const sh = ss.getSheetByName(naam);
      if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getMaxColumns()).clearContent();
    });
    const id = props.getProperty('BESTAND_ID');
    if (id) { try { DriveApp.getFileById(id).setTrashed(true); } catch (err) {} props.deleteProperty('BESTAND_ID'); }
    const tz = Session.getScriptTimeZone();
    const stempel = Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm:ss');
    props.setProperties({ BIJGEWERKT: String(Date.now()), BIJGEWERKT_TEKST: stempel + ' (leeggemaakt)', TOESTEL: String(req.toestel || '') });
    const info = ss.getSheetByName('Koppeling');
    if (info) info.getRange('B3:B4').setValues([[stempel + ' (leeggemaakt)'], [String(req.toestelNaam || req.toestel || '')]]);
    return json_(info_(props));
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Tabbladen ---------- */

function schrijfTabs_(tabs) {
  const ss = SpreadsheetApp.getActive();
  TABBLADEN.forEach(naam => {
    const rijen = tabs[naam];
    if (!Array.isArray(rijen) || !rijen.length) return;
    const sh = tab_(ss, naam);
    const breedte = Math.max.apply(null, rijen.map(r => r.length));
    const data = rijen.map(r => {
      const a = r.map(v => (v === null || v === undefined) ? '' : (typeof v === 'string' && v.charAt(0) === '=') ? "'" + v : v);
      while (a.length < breedte) a.push('');
      return a;
    });
    sh.clearContents();
    if (sh.getMaxColumns() < breedte) sh.insertColumnsAfter(sh.getMaxColumns(), breedte - sh.getMaxColumns());
    if (sh.getMaxRows() < data.length) sh.insertRowsAfter(sh.getMaxRows(), data.length - sh.getMaxRows());
    const bereik = sh.getRange(1, 1, data.length, breedte);
    bereik.setNumberFormat('@'); // tekst blijft tekst (bv. datums en namen)
    // Kolommen met enkel getallen als getal opslaan, zodat je ermee kan rekenen.
    if (data.length > 1) {
      for (let i = 0; i < breedte; i++) {
        const kol = data.slice(1).map(r => r[i]);
        if (kol.some(v => typeof v === 'number') && kol.every(v => v === '' || typeof v === 'number')) {
          const geheel = kol.every(v => v === '' || Number.isInteger(v));
          sh.getRange(2, i + 1, data.length - 1, 1).setNumberFormat(geheel ? '0' : '0.0');
        }
      }
    }
    bereik.setValues(data);
    sh.getRange(1, 1, 1, breedte).setFontWeight('bold').setBackground('#eef7f1');
    sh.setFrozenRows(1);
  });
}

function tab_(ss, naam) {
  return ss.getSheetByName(naam) || ss.insertSheet(naam);
}

function map_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('MAP_ID');
  if (id) { try { const m = DriveApp.getFolderById(id); if (!m.isTrashed()) return m; } catch (err) {} }
  const ouders = DriveApp.getFileById(SpreadsheetApp.getActive().getId()).getParents();
  const ouder = ouders.hasNext() ? ouders.next() : DriveApp.getRootFolder();
  const m = ouder.createFolder(MAP_NAAM);
  props.setProperty('MAP_ID', m.getId());
  return m;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
