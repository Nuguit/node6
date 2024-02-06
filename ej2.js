const express = require('express');
const app = express();
const MongoClient = require('mongodb');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }))
app.use(express.json())


const client = new MongoClient("mongodb://127.0.0.1:27017"); 

async function connectMongo() {
    try {
        await client.connect().then((client) => app.locals.db = client.db("prueba"));
        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB está conectado");
    } catch (error) {
        console.error("MongoDB no conectado:", error);
    }
}

connectMongo()

app.use(express.static('public'))


app.get('/api/libros', async(req, res) =>{
    try {
        const results = await app.locals.db.collection('libros').find().toArray()
        res.send({mensaje: 'Petición satisfecha', results})
    } catch (error) {
        res.send({mensaje: 'Petición no resuelta', error})
    }
})

app.get('/api/libros/:titulo', async (req, res) => {
    try {
        const results = await app.locals.db.collection('libros').find({titulo: req.params.titulo}).toArray()
        res.send({ mensaje: 'Petición satisfecha', results })
    } catch (error) {
        res.send({ mensaje: 'Petición no resuelta', error })
    }
})

app.post('/api/nuevoLibro/:titulo', async(req, res)=>{
    try {
        const results = await app.locals.db.collection('libros').insertOne({titulo: req.params.titulo, leido: false})
        res.send({mensaje: "Libro insertado", results})
    } catch (error) {
        res.send({mensaje: 'Libro no insertado', error})
    }
})

app.put('/api/editarLibro/:titulo', async(req,res)=>{
    try {
        const results = await app.locals.db.collection('libros').updateOne({ titulo: req.params.titulo}, {$set: {leido: true}})
        res.send({ mensaje: "Libro modificado", results })
    } catch (error) {
        res.send({ mensaje: 'Libro no modificado', error })
    }
})

app.delete('/api/borrarLibro/:titulo', async (req,res)=>{
    try {
        const results = await app.locals.db.collection('libros').deleteOne({ titulo: req.params.titulo })
        results.deletedCount < 1
        ? res.send({ mensaje: "Libro no borrado", results})
        : res.send({ mensaje: "Libro borrado", results })
    } catch (error) {
        res.send({ mensaje: 'Libro no borrado', error })
    }
})




app.listen(PORT, (e) => {
    e
        ? console.error("Express no conectado")
        : console.log("Express conectado y a la escucha en el puerto: " + PORT)
})