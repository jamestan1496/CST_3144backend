const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

app.use(express.json());

app.set('port', process.env.PORT || 3000);


app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();

    }
);

let db;

const mongoUri = "mongodb+srv://jamestan1496:fullstack@cluster0.dqym2.mongodb.net/Webstore?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {

    try {

        const client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );

        db = client.db('Webstore');
        console.log("✅ Connected to MongoDB successfully");

        app.listen(app.get('port'), () => {
        console.log(`🚀 Server running at http://localhost:${app.get('port')}`);
        });

    } 
    
        catch (err) {
            console.error("❌ Database connection error:", err);
            process.exit(1); 
    }
}


connectDB();


app.param('collectionName', (req, res, next, collectionName) => {
    if (!db) {
        console.error("❌ Database not connected yet!");
        return res.status(500).json({ error: "Database connection not established yet" });
    }
    req.collection = db.collection(collectionName);
    next();
    }
);


app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/messages');
    }
);

app.get('/collection/:collectionName', async (req, res, next) => {
    try {
        const results = await req.collection.find({}).toArray();
        res.json(results);
    } catch (err) {
        next(err);
        }
    }
);


app.post('/collection/:collectionName', async (req, res, next) => {
    try {
        const result = await req.collection.insertOne(req.body);
        res.json(result.ops);
    } catch (err) {
        next(err);
        }
    }
);

app.put('/collection/Products/:id', async (req, res, next) => {
    try {
      const { Availability } = req.body;
  
      if (typeof Availability !== 'number') {
        return res.status(400).json({ msg: 'Availability must be a number.' });
      }
  
      const collection = db.collection('Products');
  
      const result = await collection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { Availability: Availability } }
      );
  
      res.json(result.modifiedCount === 1 ? { msg: 'success' } : { msg: 'error' });
    } catch (err) {
      next(err);
    }
  });
  



app.get('/collection/:collectionName/:id', async (req, res, next) => {
    try {
        const result = await req.collection.findOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
    } catch (err) {
        next(err);
        }
    }
);
