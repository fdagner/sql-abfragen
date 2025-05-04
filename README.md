# SQL-Abfragen Tool

Ein interaktives Web-Tool zur Ausführung, Bearbeitung und Verwaltung von SQLite-Datenbanken direkt im Browser. Entwickelt mit [sql.js](https://github.com/sql-js/sql.js), bietet dieses Tool eine intuitive Benutzeroberfläche und Funktionen für den Upload, die Speicherung und den Export von Daten.

## Funktionen

### 🔍 SQL-Abfragen ausführen
- Verwenden Sie den eingebauten ACE-Editor, um SQL-Abfragen gegen die aktuell geladene SQLite-Datenbank auszuführen.
- Ergebnisse werden in einer Tabelle dargestellt.
- Bei Fehlern wird eine Fehlermeldung angezeigt.

### 📂 Datenbank laden
- Automatisches Laden einer Standard-Datenbank (`datenbank1.sqlite`), falls keine andere geladen wurde.
- Optional kann eine andere Datenbank über die URL (`?db=meine-db.sqlite`) geladen werden.
- Möglichkeit, eine Datenbankdatei per Dateiupload auszuwählen.

### 💾 Speicherung im Browser (IndexedDB)
- Die aktuell geladene Datenbank wird automatisch in der IndexedDB des Browsers gespeichert.
- Beim nächsten Aufruf der Seite wird diese Datenbank automatisch wiederhergestellt, sofern keine andere Datenbank angegeben ist.
- Möglichkeit, die gespeicherte Datenbank zu löschen und auf die Standard-Datenbank zurückzusetzen.

### 📑 Tabellenschema anzeigen
- Eine Übersicht über alle Tabellen und deren Spalten wird angezeigt.
- Automatisch generierte Beispielabfrage für die erste Tabelle.

### 💡 Beispielabfrage
- Automatische Anzeige einer Beispiel-SQL-Abfrage auf die erste gefundene Tabelle.

### 🔃 Datenbank zurücksetzen
- Die aktuelle Datenbank kann durch einen Klick auf den "Zurücksetzen"-Button gelöscht und durch die Standard-Datenbank ersetzt werden.

### 💻 Datenbank exportieren
- Die aktuelle Datenbank kann als `.sqlite`-Datei heruntergeladen werden.

### 📤 Export von Abfrageergebnissen
- Export der Abfrageergebnisse als `.csv` oder `.json`.

## Nutzung

1. Seite öffnen (z. B. `index.html` im Browser).
2. SQL-Abfrage eingeben oder Beispielabfrage verwenden.
3. Auf „Abfrage ausführen“ klicken.
4. Ergebnisse werden angezeigt, exportierbar als CSV/JSON.
5. Optional: Datenbankdatei hochladen oder speichern.

## Lizenz

MIT License