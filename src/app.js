const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const db = require('./db');

app.use(cors());
app.use(express.json()); // Middleware para procesar datos JSON
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configura una ruta para manejar todas las solicitudes y enviar el archivo 'index.html'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

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

app.get('/roscones/sum/size', async (req, res) => {
    const size = req.params.size;
    let sumGrande = 0;
    let sumPequeno = 0;
    try {
        const resultGrande = await db.sumAllBySize('GRANDE');
        sumGrande = resultGrande[0]['SUM(quantity)'] != null ? resultGrande[0]['SUM(quantity)'] : 0;
        const resultPeq = await db.sumAllBySize('PEQUEÑO');
        sumPequeno = resultPeq[0]['SUM(quantity)'] != null ? resultPeq[0]['SUM(quantity)'] : 0;
        // Enviar los resultados combinados como JSON
        res.status(200).json({GRANDE: sumGrande, PEQUENO: sumPequeno});
        // res.json(results);
    } catch (err) {
        console.error('Error al obtener resultados:', err);
        res.status(500).json({error: 'Error al obtener resultados de base de datos'});
    }
});

app.get('/roscones/sum/size/fill', async (req, res) => {
    const size = req.params.size;
    const fill = req.params.fill;
    try {
        const grNATA = (await db.sumAllBySizeAndFill('GRANDE', 'NATA'))[0]['SUM(quantity)'] ?? 0;
        const grSin = (await db.sumAllBySizeAndFill('GRANDE', 'SIN RELLENO'))[0]['SUM(quantity)'] ?? 0;
        const grESP = (await db.sumSpecialsBySize('GRANDE'))[0]['SUM(quantity)'] ?? 0;
        const peqNATA = (await db.sumAllBySizeAndFill('PEQUEÑO', 'NATA'))[0]['SUM(quantity)'] ?? 0;
        const peqSIN = (await db.sumAllBySizeAndFill('PEQUEÑO', 'SIN RELLENO'))[0]['SUM(quantity)'] ?? 0;
        const peqESP = (await db.sumSpecialsBySize('PEQUEÑO'))[0]['SUM(quantity)'] ?? 0;
        // Enviar los resultados combinados como JSON
        console.log({
            grNATA: grNATA,
            grSin: grSin,
            grESP: grESP,
            peqNATA: peqNATA,
            peqSIN: peqSIN,
            peqESP: peqESP
        })
        res.status(200).json({
            grNATA: grNATA,
            grSin: grSin,
            grESP: grESP,
            peqNATA: peqNATA,
            peqSIN: peqSIN,
            peqESP: peqESP
        });
        // res.json(results);
    } catch (err) {
        console.error('Error al obtener resultados de roscones especiales:', err);
        res.status(500).json({ error: 'Error al obtener resultados de base de datos' });
    }
});
// Metodo para obtener todos los roscones
app.get('/roscones', async (req, res) => {
    try {
        const results = await db.selectAll();
        // Enviar los resultados combinados como JSON
        res.status(200).json(results);
        // res.json(results);
    } catch (err) {
        console.error('Error al obtener resultados combinados:', err);
        res.status(500).json({ error: 'Error al obtener resultados combinados' });
    }
});

// Metodo para obtener todos los roscones especiales
app.get('/especiales', async (req, res) => {
    try {
        const results = await db.selectAllSpecials();
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
    const receivedJson = req.body; // Accede a los datos recibidos en formato JSON

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

app.put('/sold/:client', (req, res) => {
    const client = req.params.client;
    db.markAsSold(client);

    res.status(200).json({ message: 'OK' });
});

app.put('/unsold/:client', (req, res) => {
    const client = req.params.client;
    db.markAsUnsold(client);

    res.status(200).json({ message: 'OK' });
});

process.on('SIGINT', () => {
    console.log('El servidor se está cerrando...');

    db.closeDatabase(() => {
        process.exit(0);
    });
});
