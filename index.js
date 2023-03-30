const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connecting MongoDB 
// user: repliQTaskUser,
// pass: xeXTFQwvvgoovGXG

app.get('/', async (req, res) => {
    res.send('RepliQ task is alive....');
});

app.listen(port, async (req, res) => {
    console.log(`RQT is running through ${port}`);
});