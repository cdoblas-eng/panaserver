const express = require('express');
const cors = require('cors');
// const sqlite3 = require('sqlite3').verbose();
const db = require('./db');


const app = express();
app.use(cors());
app.use(express.json()); // Middleware para procesar datos JSON

// Ruta para recibir datos JSON
app.post('/receive', (req, res) => {
    const receivedJson = req.body; // Accede a los datos recibidos en formato JSON
    console.log('Datos recibidos:', receivedJson);

    // if (!receivedJson || !Array.isArray(receivedJson)) {
    //     return res.status(400).json({ error: 'Invalid JSON format' });
    // }
    receivedJson.roscones.forEach((roscon, index) => {
    db.insertRoscon(receivedJson.cliente, roscon)

        console.log(`Product ${index + 1}:`);
        console.log(`Type: ${roscon.roscontype}`);
        console.log(`Quantity: ${roscon.quantity}`);
        console.log(`Price: $${roscon.price}`);

        if (roscon.especial) {
            console.log('Especial:');
            console.log(`  Size: ${roscon.especial.size}`);
            console.log(`  Fill: ${roscon.especial.fill}`);
            console.log(`  Half: ${roscon.especial.half || 'N/A'}`);
        } else {
            console.log('Especial: N/A');
        }

        console.log('-------------------------');
    });


    res.json({ mensaje: 'Datos recibidos correctamente' });

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
