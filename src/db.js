const sqlite3 = require('sqlite3').verbose();
const dbPath = '../database/roscon.db'; // Cambia por el nombre que desees
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos:', dbPath);
        db.run(`
            CREATE TABLE IF NOT EXISTS "roscones" (
            "id" INTEGER,
            "cliente" TEXT NOT NULL,
            "tipo" TEXT NOT NULL,
            "cantidad" INTEGER,
            "fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "vendido" BOOLEAN DEFAULT 'FALSE',
            PRIMARY KEY("ID" AUTOINCREMENT)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS "especiales" (
            "id" INTEGER,
            "cliente" TEXT NOT NULL,
            "tamano" TEXT NOT NULL,
            "relleno" TEXT NOT NULL,
            "mitad" TEXT,
            "cantidad" NUMERIC NOT NULL,
            "fecha" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "vendido" BOOLEAN DEFAULT 'FALSE',
            "notas" TEXT,
            PRIMARY KEY("ID" AUTOINCREMENT)
            )
        `);
    }
});

// Función para cerrar la conexión a la base de datos
const closeDatabase = () => {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
        } else {
            console.log('Conexión a la base de datos cerrada');
        }
    });
};
const insertRoscon = (cliente, roscon) => {
    if (roscon.roscontype !== 'ESPECIAL'){
        db.run(
            'INSERT INTO roscones (cliente, tipo, cantidad) VALUES (?, ?, ?)',
            [
                cliente,
                roscon.roscontype,
                roscon.quantity
            ],
            (err) => {
                if (err) {
                    console.error(err.message);
                }
            }
        );
    }else{
        db.run(
            'INSERT INTO especiales (cliente, cantidad, tamano, relleno, mitad, notas) VALUES (?, ?, ?, ?, ?, ?)',
            [
                cliente,
                roscon.quantity,
                roscon.especial.size,
                roscon.especial.fill,
                roscon.especial ? roscon.especial.half : null,
                roscon.especial ? roscon.especial.notes : null
            ],
            (err) => {
                if (err) {
                    console.error(err.message);
                }
            }
        );
    }

};


module.exports = {
    db,
    closeDatabase,
    insertRoscon
};
