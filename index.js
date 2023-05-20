const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS)



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yrxlyvn.mongodb.net/?retryWrites=true&w=majority`;

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



    const toysCollection = client.db('toyStore').collection('toys');

   

    // app.get('/toys', async (req, res) => {
    //     console.log(req.query.email);
    //     let query = {};
    //     if (req.query?.email) {
    //         query = { email: req.query.email }
    //     }
    //     const result = await toysCollection.find(query).toArray();
    //     res.send(result);
    // }) 

    app.get('/toys', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      
      const sortField = req.query?.sortField || 'price'; // Default sort field is 'price'
      const sortOrder = req.query?.sortOrder === 'desc' ? -1 : 1; // Default sort order is ascending
    
      const result = await toysCollection.find(query).sort({ [sortField]: sortOrder }).toArray();
      res.send(result);
    });
    
    

    app.get('/toys', async (req, res) => {
      console.log(req.query);
      const initial = parseInt(req.query.page) || 0;
      const end = parseInt(req.query.limit) || 20;
      const proceed = initial * end;
      //  const cursor = toysCollection.find();
      const result = await toysCollection.find().skip(proceed).limit(end).toArray();
     res.send(result);
  })

    

    //  app.get('/toys/:id', async (req, res) => {
    //      const id = req.params.id;
    //     const query = { _id: new ObjectId(id) }
    
        
    
    //     const result = await toysCollection.findOne(query, options);
    //      res.send(result);
    //  })

    app.get('/toys/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const options = {
          // Include only the `title` and `imdb` fields in the returned document
          projection: { name: 1, sellerName:1 , 
            email:1 , subcategory:1 , rating:1 , description:1 , price: 1, quantity: 1, pictureUrl: 1 },
      };
        const result = await toysCollection.findOne(query , options);
        
        if (!result) {
          return res.status(404).send('Toy not found');
        }
    
        res.send(result);
      } catch (error) {
        console.error('Error retrieving toy:', error);
        res.status(500).send('Internal Server Error');
      }
    });
    
    app.post('/toys', async (req, res) => {
        const toy = req.body;
        console.log(toy)
        const result = await toysCollection.insertOne(toy);
        res.send(result);
    });

    app.put('/toys/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedtoy = req.body;

      const toy = {
          $set: {
            
             price: updatedtoy.price,
              quantity: updatedtoy.quantity,
              description: updatedtoy.description,
          }
      }

      const result = await toysCollection.updateOne(filter, toy, options);
      res.send(result);
  })

    

    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query);
      res.send(result);
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



app.get('/', (req, res) => {
    res.send('marketplace is running')
})

app.listen(port, () => {
    console.log(`Toy marketplace Server is running on port: ${port}`)
})