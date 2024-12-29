const {join} = require("node:path");
const sqlite3 = require('sqlite3').verbose();
const dbPath = join(__dirname, '../database/roscon.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
        process.exit(1); // Salir si no se puede abrir la base de datos
    } else {
        console.log('Conectado a la base de datos:', dbPath);
        db.run(`
            CREATE TABLE IF NOT EXISTS "roscones" (
            "id" INTEGER,
            "client" TEXT NOT NULL,
            "size" TEXT NOT NULL,
            "fill" TEXT NOT NULL,
            "half" TEXT,
            "quantity" INTEGER,
            "notes" TEXT,
            "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "vendido" BOOLEAN DEFAULT 'FALSE',
            PRIMARY KEY("ID" AUTOINCREMENT)
            )
        `);
    }
});

// Función para cerrar la conexión a la base de datos
const closeDatabase = (callback) => {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
            process.exit(1);
        } else {
            console.log('Conexión a la base de datos cerrada');
        }
        callback();
    });
};
const insertRoscon = (client, roscon) => {
        db.run(
            'INSERT INTO roscones (client, quantity, notes, size, fill, half) VALUES (?, ?, ?, ?, ?, ?)',
            [
                client,
                roscon.quantity,
                roscon.notes ? roscon.notes : null,
                roscon.size,
                roscon.fill,
                roscon.half ? roscon.half : null
            ],
            (err) => {
                if (err) {
                    console.error(err.message);
                }
            }
        );
};

// Función para ejecutar una consulta y devolver una promesa
function executeQuery(sql, params) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function selectRoscones(client) {
    const select_query = 'SELECT size, fill, half, quantity, notes, vendido FROM roscones WHERE client = ?'
    return executeQuery(select_query, [client])
}

async function markAsSold(client) {
    const select_query = 'UPDATE roscones SET vendido = \'TRUE\' WHERE client = ?'
    return executeQuery(select_query, [client])
}

async function markAsUnsold(client) {
    const select_query = 'UPDATE roscones SET vendido = \'FALSE\' WHERE client = ?'
    return executeQuery(select_query, [client])
}

function deleteOrder(client) {
    db.run('DELETE FROM roscones WHERE client = ? ', [client], function (err) {
        if (err) {
            console.error('Error al ejecutar la consulta DELETE:', err);
        }
    });
}


async function selectAll() {
    const select_all_query = 'SELECT client, size, fill, half, quantity, timestamp, notes, vendido FROM roscones';
    return executeQuery(select_all_query, []);
}

async function selectAllSpecials() {
    const select_all_query = 'SELECT client, size, fill, half, quantity, timestamp, notes, vendido FROM roscones WHERE ((fill != ? AND fill != ?) OR half IS NOT NULL)'
    return executeQuery(select_all_query, ['NATA', 'SIN']);
}

async function sumAllBySize(size) {
    const select_query = 'SELECT SUM(quantity) FROM roscones WHERE size = ?'
    return executeQuery(select_query, [size])
}


async function sumAllBySizeAndFill(size, fill) {
    const select_query = 'SELECT SUM(quantity) FROM roscones WHERE size = ? AND fill = ?'
    return executeQuery(select_query, [size, fill])
}

async function sumSpecialsBySize(size) {
    const select_query = 'SELECT SUM(quantity) FROM roscones WHERE size = ? AND ((fill != ? AND fill != ?) OR half IS NOT NULL)'
    return executeQuery(select_query, [size, 'NATA', 'SIN'])
}

module.exports = {
    db,
    closeDatabase,
    insertRoscon,
    selectRoscones,
    deleteOrder,
    selectAll,
    selectAllSpecials,
    markAsSold,
    markAsUnsold,
    sumAllBySize,
    sumAllBySizeAndFill,
    sumSpecialsBySize
};
