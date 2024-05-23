const {json} = require("express/lib/response");
const {join} = require("node:path");
// const {sql} = require("googleapis/build/src/apis/sql");
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
            "roscontype" TEXT NOT NULL,
            "quantity" INTEGER,
            "notes" TEXT,
            "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "vendido" BOOLEAN DEFAULT 'FALSE',
            PRIMARY KEY("ID" AUTOINCREMENT)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS "especiales" (
            "id" INTEGER,
            "client" TEXT NOT NULL,
            "roscontype" TEXT NOT NULL DEFAULT 'ESPECIAL',
            "size" TEXT NOT NULL,
            "fill" TEXT NOT NULL,
            "half" TEXT,
            "quantity" NUMERIC NOT NULL,
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
    if (roscon.roscontype !== 'ESPECIAL') {
        db.run(
            'INSERT INTO roscones (client, roscontype, quantity, notes) VALUES (?, ?, ?, ?)',
            [
                client,
                roscon.roscontype,
                roscon.quantity,
                roscon.notes ? roscon.notes : null
            ],
            (err) => {
                if (err) {
                    console.error(err.message);
                }
            }
        );
    } else {
        db.run(
            'INSERT INTO especiales (client, quantity, notes, size, fill, half) VALUES (?, ?, ?, ?, ?, ?)',
            [
                client,
                roscon.quantity,
                roscon.notes ? roscon.notes : null,
                roscon.especial.size,
                roscon.especial.fill,
                roscon.especial ? roscon.especial.half : null
            ],
            (err) => {
                if (err) {
                    console.error(err.message);
                }
            }
        );
    }

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
    const sql_normal = 'SELECT roscontype, quantity, timestamp, notes, vendido FROM roscones WHERE client = ?'
    const sql_special = 'SELECT roscontype, size, fill, half, quantity, notes, vendido FROM especiales WHERE client = ?'
    console.log(client);

    // Ejecutar ambas consultas y combinar resultados
    return Promise.all([
        executeQuery(sql_normal, [client]),
        executeQuery(sql_special, [client])
    ])
        .then((resultados) => {
            const [normals, specials] = resultados;
            return [...normals, ...specials]
        })
        .catch((err) => {
            console.error('Error al obtener resultados combinados:', err);
        })
        .finally(() => {
            // Cerrar la base de datos
            console.log('Finalizada consulta.');
        });

}

function deleteOrder(client) {

    db.run('DELETE FROM roscones WHERE client = ? ', [client], function (err) {
        if (err) {
            console.error('Error al ejecutar la consulta DELETE:', err);
            return;
        }
    });

    db.run('DELETE FROM especiales WHERE client = ? ', [client], function (err) {
        if (err) {
            console.error('Error al ejecutar la consulta DELETE:', err);
            return;
        }
    });

}


async function selectAll() {
    const sql_normal = 'SELECT roscontype, quantity, timestamp, notes, vendido FROM roscones'
    const sql_special = 'SELECT roscontype, size, fill, half, quantity, notes, vendido FROM especiales'

    // Ejecutar ambas consultas y combinar resultados
    return Promise.all([
        executeQuery(sql_normal, []),
        executeQuery(sql_special, [])
    ])
        .then((resultados) => {
            const [normals, specials] = resultados;
            return [...normals, ...specials]
        })
        .catch((err) => {
            console.error('Error al obtener los resultados:', err);
        })
        .finally(() => {
            // Cerrar la base de datos
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('Cerrada la conexión a la base de datos SQLite.');
            });
        });
}

module.exports = {
    db,
    closeDatabase,
    insertRoscon,
    selectRoscones,
    deleteOrder
};
