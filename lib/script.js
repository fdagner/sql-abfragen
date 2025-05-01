
let SQLInstance;
let db;
let editor;

// Initiales Laden von SQL.js und danach Laden der Datenbank aus IndexedDB
fetch("lib/sqljs/sql-wasm.wasm")
    .then(response => response.arrayBuffer())
    .then(wasmBinary => initSqlJs({ locateFile: file => "lib/sqljs/sql-wasm.js", wasmBinary }))
    .then(SQL => {
        SQLInstance = SQL;
        return loadDbFromIndexedDB();
    })
    .then(data => {
        if (data) {
            db = new SQLInstance.Database(new Uint8Array(data));
            updateExampleAndSchema();
            clearOutput();
        } else {
            loadDefaultDb();
        }
    });

// Dummy-Funktion als Platzhalter – bitte mit deiner Logik befüllen!
function loadDefaultDb() {
    fetch('data/datenbank1.sqlite')
        .then(response => response.arrayBuffer())
        .then(buffer => {
            db = new SQLInstance.Database(new Uint8Array(buffer));
            updateExampleAndSchema();
            clearOutput();
            // Optional: in IndexedDB speichern
            saveDbToIndexedDB(Array.from(new Uint8Array(buffer)));
        })
        .catch(err => {
            console.error("Fehler beim Laden der Standard-Datenbank:", err);
            db = new SQLInstance.Database(); // leere DB als Fallback
            updateExampleAndSchema();
            clearOutput();
        });
}

// IndexedDB-Funktionen
function openDbStore() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SQLDBStore', 1);
        request.onupgradeneeded = e => {
            e.target.result.createObjectStore('db', { keyPath: 'id' });
        };
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = e => reject(e.target.error);
    });
}

function saveDbToIndexedDB(data) {
    return openDbStore().then(db => {
        const tx = db.transaction('db', 'readwrite');
        tx.objectStore('db').put({ id: 'user-db', data });
        return tx.complete;
    });
}

function loadDbFromIndexedDB() {
    return openDbStore().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction('db', 'readonly');
            const req = tx.objectStore('db').get('user-db');
            req.onsuccess = () => resolve(req.result ? req.result.data : null);
            req.onerror = () => reject(req.error);
        });
    });
}

function deleteDbFromIndexedDB() {
    return openDbStore().then(db => {
        const tx = db.transaction('db', 'readwrite');
        tx.objectStore('db').delete('user-db');
        return tx.complete;
    });
}

// Tabellenschema und Beispielabfrage anzeigen
function updateExampleAndSchema() {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    const exampleEl = document.getElementById("example-query");
    if (tables[0] && tables[0].values.length) {
        const first = tables[0].values[0][0];
        exampleEl.textContent = `SELECT * FROM ${first};`;
    } else {
        exampleEl.textContent = "-- keine Tabelle gefunden --";
    }
    document.getElementById("schema-output").innerHTML = renderSchemaHTML();
}

// Ausgabeflächen zurücksetzen
function clearOutput() {
    document.getElementById("output").innerHTML = "";
    document.getElementById("count-text").textContent = "";
    document.getElementById("export-buttons").style.display = "none";
}

// Datei-Upload
document.getElementById("db-upload").addEventListener("change", evt => {
    const file = evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const buf = e.target.result;
        db = new SQLInstance.Database(new Uint8Array(buf));
        updateExampleAndSchema();
        clearOutput();
        saveDbToIndexedDB(Array.from(new Uint8Array(buf)));
    };
    reader.readAsArrayBuffer(file);
});

// Zurücksetzen-Button
document.getElementById("reset-db").addEventListener("click", () => {
    deleteDbFromIndexedDB();
    loadDefaultDb();
    document.getElementById("db-upload").value = '';
});

// SQL-Abfrage ausführen
function runQuery() {
    const sql = editor.getValue();
    const output = document.getElementById("output");
    const countText = document.getElementById("count-text");
    const exportButtons = document.getElementById("export-buttons");

    clearOutput();
    exportButtons.style.display = "none";

    if (!sql.trim()) {
        output.textContent = "❌ Bitte eine SQL-Anweisung eingeben.";
        return;
    }

    try {
        const res = db.exec(sql);
        if (!res[0]) {
            countText.textContent = "Keine Ergebnisse.";
            return;
        }
        const { columns, values } = res[0];
        const table = document.createElement("table");
        const header = document.createElement("tr");
        columns.forEach(c => {
            const th = document.createElement("th");
            th.textContent = c;
            header.appendChild(th);
        });
        table.appendChild(header);
        values.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(val => {
                const td = document.createElement("td");
                td.textContent = val;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        countText.textContent = `Anzahl der Datensätze: ${values.length}`;
        output.appendChild(table);
        exportButtons.style.display = "flex";
    } catch (e) {
        output.textContent = "❌ Fehler: " + e.message;
    }
}

// Tabellenschema rendern
function renderSchemaHTML() {
    let html = '<details><summary>Tabellenschema</summary>'; // gemeinsames <details>
    try {
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
        if (!tables[0]) return "<p>Keine Tabellen gefunden.</p>";
        tables[0].values.forEach(r => {
            const name = r[0];
            const pragma = db.exec(`PRAGMA table_info(${name});`);
            html += `<h4>${name}</h4>`;
            if (pragma[0]) {
                html += `<ul>` + pragma[0].values.map(c => `<li><strong>${c[1]}</strong>: ${c[2]}</li>`).join('') + `</ul>`;
            } else {
                html += `<p>(keine Spalten)</p>`;
            }
        });
    } catch (e) {
        html += `<p>❌ Fehler beim Laden des Schemas: ${e.message}</p>`;
    }
    html += '</details>'; // gemeinsames </details> schließen
    return html;
}


// Speichern der DB als Datei
function saveDb() {
    const arr = db.export();
    const blob = new Blob([arr], { type: 'application/octet-stream' });
    triggerDownload(blob, 'datenbank.sqlite');
}

// Export als CSV / JSON
function escapeCSV(v) {
    return typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g, '""')}"` : v;
}

function triggerDownload(blob, fname) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadAsCSV() {
    const sql = editor.getValue();
const res = db.exec(sql);

    if (!res[0]) return alert('Keine Daten.');
    const { columns, values } = res[0];
    const csv = [columns.join(','), ...values.map(r => r.map(escapeCSV).join(','))].join('\n');
    triggerDownload(new Blob([csv], { type: 'text/csv' }), 'datenbank.csv');
}

function downloadAsJSON() {
    const sql = editor.getValue();
    const res = db.exec(sql);
    if (!res[0]) return alert('Keine Daten.');
    const { columns, values } = res[0];
    const json = values.map(r => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
    triggerDownload(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }), 'datenbank.json');
}
