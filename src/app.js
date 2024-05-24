const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const db = require('./db');
// const googlesheets = require('./googleApi');

app.use(cors());
app.use(express.json()); // Middleware para procesar datos JSON
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configura una ruta para manejar todas las solicitudes y enviar el archivo 'index.html'
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../dist', 'index.html'));
// });

// app.post('/receive', (req, res) => {
//     // Simular una espera de 2 segundos antes de responder
//     setTimeout(() => {
//         const { client, roscones } = req.body;
//         console.log(`Recibida petición de ${client} con ${roscones.length} roscones.`);
//
//         // Puedes realizar algún procesamiento adicional aquí antes de enviar la respuesta
//
//         // Enviar una respuesta de ejemplo
//         res.json({ mensaje: 'Petición recibida con éxito después de esperar 2 segundos.' });
//     }, 2000); // 2000 milisegundos = 2 segundos
// });


// app.get('/roscones/:client', async (req, res) => {
//     const client = req.params.client;
//     try {
//         // Llamar al método obtenerResultadosCombinados y esperar los resultados
//         const results = await selectRoscones(client);
//         // Enviar los resultados combinados como JSON
//         res.json(results);
//         // res.json({"client": client});
//     } catch (err) {
//         console.error('Error al obtener resultados combinados:', err);
//         res.status(500).json({ error: 'Error al obtener resultados combinados' });
//     }
// });


app.get('/roscones/:client', async (req, res) => {
    const client = req.params.client;
    try {
        // Llamar al método obtenerResultadosCombinados y esperar los resultados
        const results = await db.selectRoscones(client);
        // Enviar los resultados combinados como JSON
        res.status(200).json(results);
        // res.json(results);
    } catch (err) {
        console.error('Error al obtener resultados:', err);
        res.status(500).json({ error: 'Error al obtener resultados de base de datos' });
    }
});
// Metodo para obtener todos los roscones
app.get('/roscones', async (req, res) => {
    try {
        // Llamar al método obtenerResultadosCombinados y esperar los resultados
        const results = await db.selectAll();
        // Enviar los resultados combinados como JSON
        res.status(200).json(results);
        // res.json(results);
    } catch (err) {
        console.error('Error al obtener resultados combinados:', err);
        res.status(500).json({ error: 'Error al obtener resultados combinados' });
    }
});

// Ruta para recibir datos JSON
app.post('/roscones/:client', (req, res) => {
    const client = req.params.client;
    console.log(client);
    const receivedJson = req.body; // Accede a los datos recibidos en formato JSON
    console.log('Datos recibidos:', receivedJson);

    if (!receivedJson || !Array.isArray(receivedJson)) {
        return res.status(400).json({ error: 'Invalid JSON format' });
    }
    receivedJson.forEach((roscon) => {
        db.insertRoscon(client, roscon)
    });

    res.status(200).json({ message: 'OK' });
});

app.delete('/roscones/:client', (req, res) => {
    const client = req.params.client;
    //Eliminamos todos los roscones del cliente
    db.deleteOrder(client)

    res.status(200).json({ message: 'OK' });
    // res.status(200).send('OK');
});

app.put('/roscones/:client', (req, res) => {
    const client = req.params.client;
    console.log(client);
    const receivedJson = req.body; // Accede a los datos recibidos en formato JSON
    console.log('Datos recibidos:', receivedJson);

    if (!receivedJson || !Array.isArray(receivedJson)) {
        return res.status(400).json({ error: 'Invalid JSON format' });
    }
    //Eliminamos todos los roscones del cliente
    db.deleteOrder(client)
    //Insertamos los nuevos roscones actualizados
    receivedJson.forEach((roscon) => {
        db.insertRoscon(client, roscon)
    });

    res.status(200).json({ message: 'OK' });
});

process.on('SIGINT', () => {
    console.log('El servidor se está cerrando...');

    db.closeDatabase(() => {
        process.exit(0);
    });
});
