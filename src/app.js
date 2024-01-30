const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const db = require('./db');
const googlesheets = require('./googleApi');


app.use(cors());
app.use(express.json()); // Middleware para procesar datos JSON
app.use(express.static(path.join(__dirname, '../dist')));


// Ruta para recibir datos JSON
app.post('/receive', (req, res) => {
    const receivedJson = req.body; // Accede a los datos recibidos en formato JSON
    console.log('Datos recibidos:', receivedJson);

    // if (!receivedJson || !Array.isArray(receivedJson)) {
    //     return res.status(400).json({ error: 'Invalid JSON format' });
    // }
    receivedJson.roscones.forEach((roscon, index) => {
    db.insertRoscon(receivedJson.cliente, roscon)
    googlesheets.insertRoscon(receivedJson.cliente, roscon)

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

// Configura una ruta para manejar todas las solicitudes y enviar el archivo 'index.html'
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../dist', 'index.html'));
// });

// app.post('/receive', (req, res) => {
//     // Simular una espera de 2 segundos antes de responder
//     setTimeout(() => {
//         const { cliente, roscones } = req.body;
//         console.log(`Recibida petición de ${cliente} con ${roscones.length} roscones.`);
//
//         // Puedes realizar algún procesamiento adicional aquí antes de enviar la respuesta
//
//         // Enviar una respuesta de ejemplo
//         res.json({ mensaje: 'Petición recibida con éxito después de esperar 2 segundos.' });
//     }, 2000); // 2000 milisegundos = 2 segundos
// });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
