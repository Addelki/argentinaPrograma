const express = require('express');
const app = express();
const { connectToDB, disconnectFromMongoDB } = require('./src/mongodb');
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    next();
});

app.get('/', (req, res) => {
    res
        .status(200)
        .send('Bienvenido a la API de Prendas.');
});

app.get('/prendas', async (req, res) => {
    try {
        const client = await connectToDB();
        if(!client){
            res
                .status(500)
                .send('Error al conectarse con MongoDB');
            return;
        }
        const db = client.db('prendas');
        const prendas = await db.collection('prendas').find().toArray();
        res.json(prendas);
    } catch (error) {
        res
            .status(500)
            .send('Error al obtener las prendas de la base de datos.');
    } finally{
        await disconnectFromMongoDB();
    }
});

app.get('/prenda/:id', async (req, res) => {
    const prendaId = parseInt(req.params.id);
    try {
        const client = await connectToDB();
        if(!client){
            res
                .status(500)
                .send('Error al conectarse a MongoDB');
            return;
        }
        const db = client.db('prendas');
        const prenda = await db.collection('prendas').findOne({ codigo: prendaId });
        if(prenda){
            res.json(prenda);
        } else {
            res
                .status(404)
                .send(`Prenda con id: ${ prendaId } no encontrada.`);
        }
    } catch (error) {
        res
            .status(500)
            .send('Error al obtener la prenda en la base de datos.');
    } finally {
        await disconnectFromMongoDB();
    }
})

app.get('/prenda/nombre/:nombre', async(req, res) => {
    const prendaQuery = req.params.nombre;
    let nombrePrenda = RegExp(prendaQuery, 'i');
    try {
        const client = await connectToDB();
        if(!client){
            res
                .status(500)
                .send('Error al conectarse a MongoDB.');
        }

        const db = client.db('prendas');
        const prenda = await db
            .collection('prendas')
            .find({nombre : {$regex: nombrePrenda}})
            .toArray();
        if(prenda.length > 0){
                res.send(prenda);
        } else {
            res
                .status(404)
                .send(`No se encontro prenda con ${ prendaQuery }`);
        }
    } catch (error) {
        res
            .status(500)
            .send('Error al obtener la prenda de la base de datos.');
    } finally {
        await disconnectFromMongoDB();
    }
});

app.get('/prenda/categoria/:categoria', async (req, res ) =>{
    const categoriaQuery = req.params.categoria;
    let nombreCategoria = RegExp(categoriaQuery, 'i');
    try {
        const client = await connectToDB();
        if(!client){
            res
            .status(500)
            .send('Error al conectarse a MongoDB.');
        }
        const db = client.db('prendas');
        const prenda = await db
            .collection('prendas')
            .find({ categoria: { $regex: nombreCategoria } })
            .toArray();
        if(prenda.length > 0){
            res.send(prenda);
        } else {
            res
                .status(404)
                .send(`No se encontraron prendas con la categría: ${ categoriaQuery }.`);
        }
    } catch (error) {
        res
            .status(500)
            .send('Error al obtener la prenda de la base de datos.');        
    } finally {
        await disconnectFromMongoDB();
    }
});

app.post('/prendas', async (req, res) => {
    const nuevaPrenda = req.body;
    if(nuevaPrenda === undefined){
        res
            .status(400)
            .send('Error en el formato de datos.');
        return;
    }
    try {
        const client = await connectToDB();
        if(!client){
            res
                .status(500)
                .send('Error al conectarse a MongoDB.');
        }
    const db = client.db('prendas').collection('prendas');
    await db.insertOne(nuevaPrenda)
        .then(() => {
            res
                .status(201)
                .send(nuevaPrenda);
        })
    } catch (error) {
        res
            .status(500)
            .send('Error al agregar la prenda a la base de datos.');
    } finally {
        await disconnectFromMongoDB();
    }
});

app.patch('/prenda/:id', async (req, res) => {
    const prendaId = parseInt(req.params.id);
    const precioNuevo = req.body;
    try {
        if(!prendaId || !precioNuevo){
            res
                .status(400)
                .send('Error en el formato para modificar la prenda.');
            return;
        }
        const client = await connectToDB();
        if(!client){
            res
                .status(500)
                .send('Error al conectarse a MongoDB.');
        }
        const db = client.db('prendas').collection('prendas');
        await db.updateOne({codigo:prendaId}, { $set: precioNuevo })
            .then(() => {
                res
                    .status(201)
                    .send(`Se modifico el precio correctamente.\n${ JSON.stringify(precioNuevo) }`);
            })
    } catch (error) {
        res
            .status(500)
            .send('Error al modificar el precio de la prenda.')
    } finally{
        await disconnectFromMongoDB();
    }
});

app.delete('/prenda/:id', async (req, res) => {
    const idPrenda = parseInt(req.params.id);
    try {
        if(!idPrenda){
            res
                .status(400)
                .send(`No se puede eliminar la prenda con id: ${ idPrenda }.`);
            return;
        }
        const client = await connectToDB();
        if(!client){
            res
                .status(500)
                .send('Error al conectarse a MongoDB');
            return;
        }
        const db = client.db('prendas').collection('prendas');
        const resultado = await db.deleteOne({ codigo : idPrenda})
        if (resultado.deletedCount === 1){
            res
                .status(204)
                .send();
        } else {
            res
                .status(404)
                .send(`No se pudo eleiminar la prenda con id: ${ idPrenda }`);
        }
    } catch (error) {
        res
            .status(500)
            .send('Error al eliminar la prenda.');
    } finally {
        await disconnectFromMongoDB();
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${ PORT }`);
});

