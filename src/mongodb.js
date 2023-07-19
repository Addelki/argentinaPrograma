const dotenv = require('dotenv');
dotenv.config();
const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URLSTRING;
const client = new MongoClient(URI);

const connectToDB = async () => {
    try {
        await client.connect();
        console.log('Conectado a MongoDB.')
        return client;
    } catch (error) {
        console.error(`Error al conectar con MongoDB: ${ error }` );
        return null;
    }
}

const disconnectFromMongoDB = async () => {
    try {
        await client.close();
        console.log('Desconectado de MongoDB.')
    } catch (error) {
        console.error(`Error al desconectar de MongoDB: ${ error }` );
        return null;
    }
}

module.exports = { connectToDB, disconnectFromMongoDB };