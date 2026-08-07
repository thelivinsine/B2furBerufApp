/**
 * The ONE definition of what makes a Branche tag EARNED (s199 writing-task
 * audit, founder decision "go with your recommendation reg branche").
 *
 * Before this file, `sectors[]` on a writing task was gated only by "does every
 * Branche appear somewhere in this pool", which `tests/writingScope.test.ts`
 * demanded for all 10 Beruf AND all 10 Alltag Themen at both lengths. An
 * 11-task Alltag pool cannot honestly represent 15 industries, so the invariant
 * was met by handing one sector to each pool slot in enum order: 199 of 600
 * tagged tasks named an industry the brief never entered, and a Pharma learner
 * was preferentially served "Sie haben auf einer Feier eine Bekannte
 * wiedergetroffen". Coverage was satisfied; the tag meant nothing.
 *
 * A tag is EARNED when the brief (instruction + Leitpunkte + Adressat) contains
 * a token that only that workplace produces. That is the rule `lint:content`
 * enforces now, and the rule an author has to satisfy to add a tag.
 *
 * Matching is substring, lowercased, so a marker also catches the compounds
 * German builds from it (`schicht` catches `Frühschicht` and `Schichtplan`,
 * `objekt` catches `Objektleitung`). Keep markers SPECIFIC: a marker so general
 * that any brief could contain it re-opens the hole this file closes. When a
 * genuinely sector-specific word is missing here, ADD IT rather than dropping
 * the tag: the lexicon is meant to grow with the bank.
 *
 * **Markers are deliberately SHARED where the word really is shared.** `charge`
 * belongs to production, chemicals and pharma; `objekt` to cleaning and
 * security; `schicht` to care, production, security and hospitality. A brief
 * that says "Frühschicht" plausibly lives in any of those, so all of them are
 * honest tags for it, and the test's job is only to reject the tag with NO
 * connection at all. A first cut of this file withheld the shared words to stay
 * "strict" and stripped `wt_safety_s09` ("An Anlage 2 sitzt die Schutzabdeckung
 * locker. Melden Sie das dem Schichtleiter.") from `production`, which is as
 * production-shaped as a brief gets. Strictness in the wrong place is just a
 * different wrong answer.
 */

/** @type {Record<string, string[]>} */
export const SECTOR_MARKERS = {
  care: [
    "station", "pfleg", "patient", "bewohner", "visite", "heim", "klinik", "medikament",
    "wundver", "angehörig", "sturz", "pflegedoku", "betreuung", "demenz", "mobilisation",
    "dekubitus", "vitalwert", "arztbrief", "hygieneplan", "krankenhaus", "altenheim",
    "tagespflege", "beatmung", "sonde", "lagerung", "pflegegrad", "stationsleit",
    "schicht", "übergabe", "pflegekraft", "betreuungskraft", 
  ],
  trades: [
    "montage", "monteur", "werkstatt", "handwerk", "installat", "sanitär", "elektr",
    "meister", "kundeneinsatz", "kundentermin", "werkzeug", "badsanierung", "heizung",
    "gesell", "großhandel", "servicefahrz", "aufmaß", "wartungsvertrag", "störungsdienst",
    "kundendienst", "reparaturauftrag", "auftragsbespr", "geselle", "innung",
    "reparatur", "kundenauftrag", "betrieb vor ort",
  ],
  it: [
    "server", "ticket", "software", "release", "deploy", "datenbank", "schnittstelle",
    "rechenzentrum", "netzwerk", "backup", "nutzerkonto", "incident", "notebook",
    "lizenz", "sprint", "rollout", "migration", "code-review", "code review", "quellcode",
    "systemausfall", "anwender", "it-", "hotline", "programmier", "entwicklungsteam",
    "zugriffsrecht", "systemadmin", "störungsmeldung", "update-", "cloud",
    "system", "update", "version", "nutzer", "digital", "bildschirm", "tabelle", "buchungssystem", "scanner", "handscanner",
  ],
  retail: [
    "filiale", "kasse", "regal", "warenein", "sortiment", "verkaufsfläche", "inventur",
    "aktionsware", "umtausch", "verkaufsraum", "kassierer", "marktleit", "auszeichnung",
    "ladenöffnung", "warenverräum", "kundenkarte", "abverkauf", "filialleit", "supermarkt",
    "bestand", 
  ],
  hospitality: [
    "gast", "restaurant", "küche", "reservier", "speisekarte", "hotel", "rezeption",
    "buffet", "trinkgeld", "schankraum", "gastraum", "kellner", "à la carte", "bankett",
    "menükarte", "servicekraft", "wirt", "hotelzimmer", "frühstücksdienst", "restaurantleit",
    "service", "schicht", "kantine", "bestellsoftware",
  ],
  engineering: [
    "konstruktion", "zeichnung", "prüfstand", "toleranz", "spezifikation", "prototyp",
    "messwert", "baugruppe", "stückliste", "prüftermin", "auslegung", "bauteil",
    "werkstoff", "prüflabor", "konstrukteur", "prüffeld", "technische zeichnung",
    "berechnung", "konstruktionsphase", "freigabe der", "cad",
    "anlage", "maschine", "schutzeinricht", 
  ],
  construction: [
    "baustelle", "polier", "rohbau", "gewerk", "bauleit", "beton", "gerüst", "bauabschnitt",
    "bauherr", "bautagebuch", "estrich", "aushub", "kran", "richtfest", "bauzeitenplan",
    "nachtrag", "bauabnahme", "betonier", "baubüro", "bauplan", "baustellenbespr",
    "meilenstein", "umbau", "schutzabdeck",
  ],
  production: [
    "charge", "linie", "produktion", "fertigung", "ausschuss", "rüstzeit", "stillstand",
    "taktzeit", "rohmaterial", "instandhalt", "werkhalle", "maschinenführ", "produktionsleit",
    "anlagenwart", "schichtbuch", "serienfertigung", "montageband", "werkzeugwechsel",
    "schicht", "maschine", "anlage", "palette", "werksleit", "schutzeinricht", "schutzabdeck", "beinaheunfall", "halle", "kommissionier", "lager",
  ],
  transport: [
    "tour", "disposition", "lkw", "fahrer", "fracht", "route", "sendung", "zustell",
    "spedition", "lieferfenster", "ladung", "laderaum", "lenkzeit", "frachtbrief",
    "lieferadresse", "logistikpartner", "umschlag", "beladen", "entladen", "fahrzeugflotte",
    "paketdienst", "auslieferung", "versandleit",
    "lager", "kommissionier", "lieferschein", "fuhrpark", "kälteregal", "scanner", "flotte",
  ],
  beauty: [
    "salon", "friseur", "kosmetik", "haar", "färb", "nagel", "salonleit", "styling",
    "hautbild", "wimper", "behandlungsstuhl", "kundinnen", "kosmetikstudio", "haarschnitt",
    "produktschulung", "behandlungstermin",
    "behandlung", "farbbehandl", "haut", "kundin",
  ],
  sports: [
    "studio", "trainer", "mitglied", "training", "verein", "studioleit", "probetraining",
    "fitness", "reha", "trainingsplan", "kursplan", "wettkampf", "sporthalle", "geräteraum",
    "kursteilnehm", "mitgliedschaft", "übungsleit",
    "kurs", "buchungssystem", 
  ],
  chemicals: [
    "labor", "gefahrstoff", "sicherheitsdatenblatt", "reaktor", "abzug", "gefahrgut",
    "dosier", "ansatz", "betriebsanweisung", "probenahme", "analytik", "chemikal",
    "entsorgungsvorschrift", "laborleit", "messreihe", "prüfbericht", "gefahrensymbol",
    "charge", "lösungsmittel", "spezifikation", "messwert", "stichprobe", "analyse", "probe",
  ],
  pharma: [
    "apotheke", "arzneimittel", "wirkstoff", "gmp", "qs-", "qs ", "validier", "audit",
    "reinraum", "steril", "rückverfolg", "qualitätskontroll", "kalibrier", "präparat",
    "abfüllung", "chargendok", "abweichung", "stichprobe", "temperaturgeführ", "rezeptur",
    "qualitätssicherung", "qs-leitung", "medizinprodukt",
    "charge", "herstellung", "dokumentation zu", "hygiene", "labor", "probe",
  ],
  cleaning: [
    "reinigung", "revier", "unterhaltsreinig", "objektleit", "grundreinig", "desinfekt",
    "reinigungsplan", "sanitärbereich", "treppenhaus", "reinigungskraft", "reinigungsqualit",
    "reinigungsteam", "putzmittel", "flächendesinf", "gebäudereinig", "objektbetreu",
    "objekt", "einsatzleit", "schicht", "fläche",
  ],
  security: [
    "wache", "streife", "alarm", "zutritt", "sicherheitsdienst", "einsatzleit",
    "kontrollrunde", "wachbuch", "revierfahrt", "empfangsdienst", "videoüberwach",
    "zutrittssystem", "vorfallbericht", "schließrunde", "objektschutz", "sicherheitskraft",
    "werkschutz",
    "objekt", "vorfall", "leitstelle", "bewachung", "kamera", "schicht", "zugangskarte", "türschloss", "beleuchtung",
  ],
};

/** Every string a task's brief contributes to the marker test. */
export function briefText(task) {
  return [task.text ?? "", ...(task.points ?? []), task.addressee ?? "", task.source ?? ""]
    .join(" ")
    .toLowerCase();
}

/** The markers of `sector` that this brief actually contains. */
export function earnedMarkers(task, sector) {
  const text = briefText(task);
  return (SECTOR_MARKERS[sector] ?? []).filter((m) => text.includes(m));
}

/** Does the brief earn the sector tag it carries? */
export function isSectorEarned(task, sector) {
  return earnedMarkers(task, sector).length > 0;
}
