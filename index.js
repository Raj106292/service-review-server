const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.tkcvter.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: "unauthorized access"});
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if(error){
            return res.status(403).send({message: 'forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

const run = async() => {
    try{
        const servicesCollection = client.db("service_review").collection("services");
        const reviewsCollection = client.db("service_review").collection("reviews");

        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24d' });
            res.send({ token });
        })

        app.get('/limited/services', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query).sort( { price: -1 } );
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = { email: req.query.email };
            }
            else if(req.query.serviceName){
                query = {serviceName: req.query.serviceName}
            }
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.post('/reviews', verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        app.patch('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const reviewUser = req.body.reviewUser;
            const query = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    reviewUser: reviewUser,
                }
            };
            const result = await reviewsCollection.updateOne(query, updatedDoc, {upsert: true});
            res.send(result);
        });


        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        });
    }
    finally{

    }
}

run().catch(error => console.log(error));

app.get('/', (req, res) => {
    res.send('Server is running properly');
});

app.listen(port, () => {
    console.log(`Server is up and running on the port ${port}`);
});