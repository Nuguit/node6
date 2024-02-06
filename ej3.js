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

app.get('/api/series', async(req, res)=>{
    try {
        const results = await app.locals.db.collection('series').find({}).toArray()
        res.send({mensaje: "Petición satisfecha", results})    
    } catch (error) {
        res.send({mensaje: "Petición No resuelta", error})
    }
})

app.post('/api/nuevaSerie', async(req,res)=>{
    try {
        let {titulo, plataforma, nota} = req.body
        nota = parseInt(nota)
        let results = await app.locals.db.collection('series').insertOne({titulo, plataforma,nota})
        res.send({mensaje: "Serie añadida", results})
    } catch (error) {
        res.send({mensaje: "Serie no añadida", error})
    }
})

app.get('/api/:serie', async (req, res) => {
    try {
        const results = await app.locals.db.collection('series').find({ titulo: req.params.serie }).toArray()
        results.length > 0
            ? res.send({ mensaje: "Petición satisfecha", results })
            : res.send({ mensaje: "Serie no encontrada en la base de datos" })
    } catch (error) {
        res.send({ mensaje: "Serie no recuperada", error })
    }
})


app.listen(PORT, (e) => {
    e
        ? console.error("Express no conectado")
        : console.log("Express conectado y a la escucha en el puerto: " + PORT)
})