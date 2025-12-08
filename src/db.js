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
            "num_pedido" INTEGER,
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

        db.run(`CREATE TABLE IF NOT EXISTS contador (valor INTEGER)`, (err) => {
            if (err) {
                return console.error(err.message);
            }
            // Inicializar la tabla con un valor de 0 si está vacía
            db.get(`SELECT COUNT(*) AS total FROM contador`, (err, row) => {
                if (err) {
                    return console.error(err.message);
                }
                if (row.total === 0) {
                    db.run(`INSERT INTO contador (valor) VALUES (0)`);
                    console.log('Contador inicializado a 0.');
                }
            });
        });
    }
});

function getAndIncreaseOrderCounter(callback) {
    db.serialize(() => {
        // Obtener el valor actual
        db.get(`SELECT valor FROM contador`, (err, row) => {
            if (err) {
                console.error(err.message);
                return callback(err, null);
            }

            const valorAnterior = row ? row.valor : 0;
            const nuevoValor = valorAnterior + 1;

            // Incrementar el contador
            db.run(`UPDATE contador SET valor = ?`, [nuevoValor], (err) => {
                if (err) {
                    console.error(err.message);
                    return callback(err, null);
                }

                // Devolver el valor anterior
                callback(null, valorAnterior);
            });
        });
    });
}

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
const insertRoscon = (num_pedido, client, roscon) => {
    console.log(num_pedido);
    db.run(
        'INSERT INTO roscones (num_pedido, client, quantity, notes, size, fill, half) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
            num_pedido,
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
    const select_query = 'SELECT size, fill, half, quantity, notes, vendido FROM roscones WHERE client = ? OR num_pedido = ?'
    return executeQuery(select_query, [client, client])
}

async function markAsSold(client) {
    const select_query = 'UPDATE roscones SET vendido = \'TRUE\' WHERE client = ? OR num_pedido = ?'
    return executeQuery(select_query, [client, client])
}

async function markAsUnsold(client) {
    const select_query = 'UPDATE roscones SET vendido = \'FALSE\' WHERE client = ? OR num_pedido = ?'
    return executeQuery(select_query, [client, client])
}

function deleteOrder(client) {
    db.run('DELETE FROM roscones WHERE client = ? OR num_pedido = ? ', [client, client], function (err) {
        if (err) {
            console.error('Error al ejecutar la consulta DELETE:', err);
        }
    });
}


async function selectAll() {
    const select_all_query = 'SELECT num_pedido, client, size, fill, half, quantity, timestamp, notes, vendido FROM roscones';
    return executeQuery(select_all_query, []);
}

async function selectAllSpecials() {
    const select_all_query = 'SELECT num_pedido, client, size, fill, half, quantity, timestamp, notes, vendido FROM roscones WHERE ((fill != ? AND fill != ?) OR half IS NOT NULL)'
    return executeQuery(select_all_query, ['NATA', 'SIN RELLENO']);
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
    return executeQuery(select_query, [size, 'NATA', 'SIN RELLENO'])
}

async function sumUnsoldBySize(size) {
    const select_query = 'SELECT SUM(quantity) FROM roscones WHERE size = ? AND vendido = \'FALSE\''
    return executeQuery(select_query, [size])
}


async function sumUnsoldBySizeAndFill(size, fill) {
    const select_query = 'SELECT SUM(quantity) FROM roscones WHERE size = ? AND fill = ? AND vendido = \'FALSE\''
    return executeQuery(select_query, [size, fill])
}

async function sumUnsoldSpecialsBySize(size) {
    const select_query = 'SELECT SUM(quantity) FROM roscones WHERE size = ? AND ((fill != ? AND fill != ?) OR half IS NOT NULL) AND vendido = \'FALSE\''
    return executeQuery(select_query, [size, 'NATA', 'SIN RELLENO'])
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
    sumUnsoldBySize,
    sumUnsoldBySizeAndFill,
    sumUnsoldSpecialsBySize,
    getAndIncreaseOrderCounter
};
