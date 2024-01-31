const Type = {
    GR_NATA: 'GRANDE NATA',
    GR_SIN: 'GRANDE SIN RELLENO',
    PEQ_NATA: 'PEQUEÑO NATA',
    PEQ_SIN: 'PEQUEÑO SIN RELLENO',
    ESP: 'ESPECIAL'
};

const Size = {
    GR: 'GRANDE',
    PEQ: 'PEQUEÑO',
};

const Fill = {
    NATA: 'NATA',
    MOCA: 'MOCA',
    MERENGUE: 'MERENGUE',
    CREMA: 'CREMA',
    CAFE: 'CAFE',
    EMPTY: 'SIN RELLENO',
};

// JavaScript equivalent for the Especial interface
const Especial = {
    size: null,
    fill: null,
    half: null,
};

// JavaScript equivalent for the Product interface
const Product = {
    roscontype: null,
    quantity: 0,
    price: 0,
    notes: null,
    especial: Especial,
};

function getSheetTable(rosconType) {
    if (rosconType !== Type.ESP)
        return 'roscones'
    else
        return 'especiales'
}

module.exports = { Type, Especial, Fill, Size, Product, getSheetTable};