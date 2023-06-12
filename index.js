const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.header.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized token' })
  }
  // bearer token
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded)=> {
    if(error){
      return res.status(401).send({error: true, message: 'unauthorized user'})
    }
    req.decoded = decoded;
    next();
  })
}

app.get('/', (req, res) => {
  res.send('kids playing in summer camp')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qd7bbha.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // data collections
    const instructorCollection = client.db("summerSportsDB").collection("instructors")
    const classCollection = client.db("summerSportsDB").collection("allClasses")
    const selectedClassCollection = client.db("summerSportsDB").collection("selectedClasses")

    // jwt token api
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })
      res.send({ token })
    })

    // instructor operation apis
    app.get('/instructors', async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    })

    // classes operation apis
    app.get('/allclasses', async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    })

    // selected classes operation api
    app.post('/selectedclasses', async(req, res) => {
      const selectedClass = req.body;
      const result = await selectedClassCollection.insertOne(selectedClass);
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`server is running in localhost:${port}`);
})