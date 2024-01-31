// const credentials = require('./credentials/credentials.json');
const credentials = require('../database/credentials.json');
const { google, sheets_v4 } = require('googleapis');
// const { getSheetTable, Size, Fill } = import('./product.mjs');
const rosconModule = require('./roscon');


const spreadsheetId = '1t6npY-2SMi7jDKrhhi2Tatc3RNc-WmrKKn3fmMRJHhk';

const client = new google.auth.JWT(
    credentials.client_email,
    undefined,
    credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);


async function authorizeClient() {
    await client.authorize();
    // console.log('Cliente autorizado');
}


class Lock {
    constructor() {
        this.isLocked = false;
        this.queue = [];
    }

    async acquire() {
        if (!this.isLocked) {
            this.isLocked = true;
        } else {
            await new Promise((resolve) => {
                this.queue.push(resolve);
            });
        }
    }

    release() {
        if (this.queue.length > 0) {
            const nextResolver = this.queue.shift();
            nextResolver();
        } else {
            this.isLocked = false;
        }
    }
}

const lock = new Lock();

// async function getLastRow(rosconType) {
//     try {
//         await lock.acquire(); // Acquire the lock before entering the critical section
//
//         // The critical section
//
//         const sheets = google.sheets({ version: 'v4', auth: client });
//         const sheetName = rosconModule.getSheetTable(rosconType);
//         const range = `${sheetName}!B3:B`;
//
//         const response = await sheets.spreadsheets.values.get({
//             spreadsheetId: spreadsheetId,
//             range: range,
//         });
//
//         const values = response.data.values;
//
//         if (values) {
//             for (let i = 0; i < values.length; i++) {
//                 const row = values[i];
//                 // console.log(`Row ${i + 1}: ${row}`);
//             }
//         }
//
//         const startOffset = 3;
//         const lastRow = values ? values.length + startOffset : startOffset;
//
//         // console.log('The next row to be filled is:', lastRow);
//         return lastRow;
//     } catch (err) {
//         console.error('Error while getting the next row:', err);
//         return -1;
//     } finally {
//         lock.release(); // Release the lock after exiting the critical section
//     }
// }

// Example usage
// (async () => {
//     const result = await getLastRow('roscones');
//     console.log(result);
// })();

async function getLastRow(rosconType) {
    try {
        // await authorizeClient();

        const sheets = google.sheets({ version: 'v4', auth: client });
        const sheetName = rosconModule.getSheetTable(rosconType);
        const range = `${sheetName}!B3:B`;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        const values = response.data.values;

        if (values) {
            for (let i = 0; i < values.length; i++) {
                const row = values[i];
                // console.log(`Row ${i + 1}: ${row}`);
            }
        }

        const startOffset = 3;
        const lastRow = values ? values.length + startOffset : startOffset;

        // console.log('The next row to be filled is:', lastRow);
        return lastRow;
    } catch (err) {
        console.error('Error while getting the next row:', err);
        return -1;
    }
}

async function insertRoscon(cliente, roscon) {
    try {
        await lock.acquire()
        await client.authorize();

        const sheets = google.sheets({ version: 'v4', auth: client });

        const sheetName = rosconModule.getSheetTable(roscon.roscontype);
        let nextRow = await getLastRow(roscon.roscontype);
        const currentDateTime = getCurrentDateTime();

        const normal = roscon.roscontype !== rosconModule.Type.ESP;
        const range = normal ? `${sheetName}!B${nextRow}:F${nextRow}` : `${sheetName}!B${nextRow}:G${nextRow}`;

        const newRowData = normal ?
            [cliente, roscon.quantity, roscon.roscontype, roscon.notes, currentDateTime] :
            [cliente, roscon.especial?.size, roscon.especial?.fill, roscon.especial?.half, roscon.quantity, roscon.notes, currentDateTime];

        // console.log('RANGO: ' + range);

        const request = {
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [newRowData],
            },
        };

        const response = await sheets.spreadsheets.values.append(request);

        console.log('Fila insertada con éxito:', response.data);
    } catch (err) {
        console.error('Error al insertar fila:', err);
    }finally {
        lock.release()
    }
}

function getCurrentDateTime() {
    const currentDate = new Date();

    // Get the date components
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Months in JavaScript are zero-based, so we add 1 to get the correct month number
    const year = currentDate.getFullYear();

    // Get the time components
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    // Build the string in the desired format
    const formattedDateTime = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedDateTime;
}

// Example usage
// const currentDateTime = getCurrentDateTime();
// console.log('Current date and time:', currentDateTime);
//
//
// insertRoscon("FANTASMA DE INDRA", {
//   roscontype: rosconModule.Type.GR_SIN,
//   quantity: 6,
//   price: 20,
//   especial: null,
// });
//
// insertRoscon("BLAS", {
//     roscontype: rosconModule.Type.ESP,
//     quantity: 11,
//     price: 18,
//     especial:{
//         size: rosconModule.Size.GR,
//         fill: rosconModule.Fill.MERENGUE,
//     },
// });


module.exports = {
    insertRoscon,
};
