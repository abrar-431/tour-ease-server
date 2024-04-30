const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000

// middleware
const corsConfig = {
  origin: ["http://localhost:5173","https://tourism-manager-6b4fe.web.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.salgcrv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const spotCollection = client.db("spotsDB").collection('spots');
    const countryCollection = client.db("spotsDB").collection('countries');

    app.get('/spots', async(req, res)=>{
      const cursor  = spotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Countries
    app.get('/countries', async(req, res)=>{
      const cursor  = countryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/countries/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await countryCollection.findOne(query);
      res.send(result);
    })

    app.get('/sortedspots', async(req, res)=>{
      const cursor  = spotCollection.find();
      const result = await cursor.sort({cost: 1}).toArray();
      res.send(result);
    })

    app.get('/spots/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await spotCollection.findOne(query);
      res.send(result);
    })

    app.post('/spots', async(req, res)=>{
      const spot = req.body;
      console.log(spot);
      const result = await spotCollection.insertOne(spot);
      res.send(result);
    })

    app.delete('/spots/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await spotCollection.deleteOne(query);
      res.send(result);
    })

    app.put('/update/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const user = req.body;
      const updatedUser = {
        $set:{
          spot: user.spot, 
          country: user.country,
          location: user.location,
          cost: user.cost,
          seasonality: user.seasonality,
          time: user.time,
          visitors: user.visitors,
          image: user.image,
          description: user.description
        }
      }
      const result = await spotCollection.updateOne(filter, updatedUser, options);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Tourism server is running')
})

app.listen(port, ()=>{
    console.log('Tourism server is running on, ', port);
})