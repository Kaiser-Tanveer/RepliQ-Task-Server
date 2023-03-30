const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// user: repliQTaskUser,
// pass: xeXTFQwvvgoovGXG

// Connecting MongoDB 
const uri = `mongodb+srv://${process.env.RQT_USER}:${process.env.RQT_PASS}@cluster0.tl2ww1y.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        // Collections 
        const categoriesCollection = client.db("RQT").collection("categories");
        const productsCollection = client.db("RQT").collection("products");
        const usersCollection = client.db("RQT").collection("users");

        // Category api 
        app.get('/categories', async (req, res) => {
            res.send(await categoriesCollection.find({}).toArray());
        });

        // Products api by category name 
        app.get('/products/:name', async (req, res) => {
            const products = await productsCollection.find({ category_name: req.params.name }).toArray();
            res.send(products);
        })

        // Single Product api by id 
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const products = await productsCollection.findOne({ _id: new ObjectId(id) });
            res.send(products);
        })
    }
    finally { }
}
run().catch(error => console.log(error.message));


app.get('/', async (req, res) => {
    res.send('RepliQ task is alive....');
});

app.listen(port, async (req, res) => {
    console.log(`RQT is running through ${port}`);
});