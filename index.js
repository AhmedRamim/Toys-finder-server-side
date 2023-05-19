const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())

require('dotenv').config()
// console.log(process.env.DB_PASS);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.by8imti.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const carToysCollection = client.db('carToysDB').collection('carToys')

    // indexing for search........
    const indexKey = {name:1}
    const indexOption = {name:'toyName'}
    const result =await carToysCollection.createIndex(indexKey,indexOption)



    app.get('/toySearchByName/:text',async(req,res) => {
      const searchText = req.params.text;
      const result = await carToysCollection.find({
        name:{$regex:searchText, $options:"i"}
      }).toArray()
      res.send(result)
    })

    app.get('/updateToy/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result =await carToysCollection.findOne(query)
      res.send(result)
    })

    app.get('/alltoys', async (req, res) => {
        try {
          const limit = parseInt(req.query.limit) || 20; 
          const result = await carToysCollection.find().limit(limit).toArray();
          res.send(result);
        } catch (error) {
          console.error('Error retrieving toys:', error);
          res.status(500).send('Internal Server Error');
        }
      });

      app.get('/myToys/:email', async (req, res) => {
        try {
          const email = req.params.email;
          const sortBy = req.query.sortBy; 
      
          let sortOptions = {};
          if (sortBy === 'lower') {
            sortOptions = { price: 1 }; 
          }
          
          else if (sortBy === 'higher') {
            sortOptions = { price: -1 }; 
          }
          
          const result = await carToysCollection
            .find({ sellerEmail: email })
            .sort(sortOptions)
            .toArray();
          res.send(result);
        } catch (error) {
          console.error('Error retrieving toys:', error);
          res.status(500).send('Internal Server Error');
        }
      });
      


    app.post('/addToys',async(req,res) => {
        const toys =  req.body;
        const result  = await carToysCollection.insertOne(toys)
        res.send(result);
    })



    app.put('/updateToy/:id',async(req,res) => {
      const id = req.params.id;
      const toys = req.body;
      const query = {_id:new ObjectId(id)}
      const options = {upsert:true}
      const updateToy = {
        $set:{
          price: toys.price,
          quantity : toys.quantity,
          description: toys.description
        }
      }
      const result = await carToysCollection.updateOne(query,updateToy,options)
      res.send(result)
    })

    app.delete('/toy/:id',async(req,res) => {
      const id = req.params.id;
      const query = { _id : new ObjectId(id)}
      const result =await carToysCollection.deleteOne(query)
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














app.get('/',(req,res) => {
    res.send('Cars Toys finder are running')
})

app.listen(port,() => {
    console.log(`Cars Toys Finder are running on port : ${port}`);
})