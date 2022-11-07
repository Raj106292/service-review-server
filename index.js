const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.tkcvter.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
        const servicesCollection = client.db("service_review").collection("services");
    }
    finally{

    }
}

run().catch(error => console.log(error));

app.get('/', (req, res) => {
    res.send('Server is running properly');
})

app.listen(port, () => {
    console.log(`Server is up and running on the port ${port}`);
})