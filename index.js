const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// JWT Verification middleware Function 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.WEB_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized Access' });
        }
        req.decoded = decoded;
        next();
    })
}

// Admin middleware function 
const verifyAdmin = async (req, res, next) => {
    const decodedEmail = req.decoded.email;
    const user = await usersCollection.findOne({ email: decodedEmail });

    if (user?.role !== admin) {
        return res.status(403).send({ message: 'Forbidden Access' });
    }

    next();
}


// Connecting MongoDB 
const uri = `mongodb+srv://${process.env.RQT_USER}:${process.env.RQT_PASS}@cluster0.tl2ww1y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        // Collections 
        const categoriesCollection = client.db("RQT").collection("categories");
        const productsCollection = client.db("RQT").collection("products");
        const bookingsCollection = client.db("RQT").collection("bookings");
        const usersCollection = client.db("RQT").collection("users");



        // JWT Read api 
        app.get('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.WEB_TOKEN_SEC, { expiresIn: "7d" });
            res.send({ token });
        });

        // Admin api
        app.get('/users/admin', async (req, res) => {
            const email = req.params.email;
            res.send(await usersCollection.findOne({ email }));
        })



        // Category api 
        app.get('/categories', async (req, res) => {
            res.send(await categoriesCollection.find({}).toArray());
        });

        // All products for Shop component 
        app.get('/shop', async (req, res) => {
            res.send(await productsCollection.find({}).toArray());
        });

        // Products api by category name 
        app.get('/products/:name', async (req, res) => {
            const products = await productsCollection.find({ category_name: req.params.name }).toArray();
            res.send(products);
        })

        // Single Product api by id 
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const products = await productsCollection.findOne({ _id: new ObjectId(id) });
            res.send(products);
        });

        // Add Products api 
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            res.send(await productsCollection.insertOne(product));
        })

        // Bookings api 
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

        app.get('/myBookings', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email }
            const myBookings = await bookingsCollection.find(filter).toArray();
            res.send(myBookings);
        });

        // Admin Interactions on bookings 
        app.get('/dashboard/orders', async (req, res) => {
            res.send(await bookingsCollection.find({}).toArray());
        });

        app.delete('/dashboard/orders', async (req, res) => {
            const id = req.query.id;
            res.send(await bookingsCollection.deleteOne({ _id: new ObjectId(id) }));
        })

        app.delete('/bookings', async (req, res) => {
            const id = req.query.id;
            const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // Users api 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/dashboard/users', async (req, res) => {
            res.send(await usersCollection.find({}).toArray());
        });

        app.delete('/dashboard/users', async (req, res) => {
            const id = req.query.id;
            res.send(await usersCollection.deleteOne({ _id: new ObjectId(id) }));
        });
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