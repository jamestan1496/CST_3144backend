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
});

let db;

const mongoUri = "mongodb+srv://jamestan1496:fullstack@cluster0.dqym2.mongodb.net/Webstore?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
    try {
        const client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        db = client.db('Webstore');
        console.log("✅ Connected to MongoDB successfully");

        app.listen(app.get('port'), () => {
            console.log(`🚀 Server running at http://localhost:${app.get('port')}`);
        });

    } catch (err) {
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
});

app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/messages');
});

app.get('/collection/:collectionName', async (req, res, next) => {
    try {
        const results = await req.collection.find({}).toArray();
        res.json(results);
    } catch (err) {
        next(err);
    }
});

app.use('/images', express.static(path.join(__dirname,  'images')));

app.get('/images/tabletennis.jpg', (req, res) => {
    logActivity("Request for image received");
});


app.post('/collection/:collectionName', async (req, res, next) => {
    try {
        const result = await req.collection.insertOne(req.body);
        res.json(result.ops);
    } catch (err) {
        next(err);
    }
});

// PUT endpoint updated to use Spaces instead of Availability
app.put('/collection/Products/:_id', async (req, res, next) => {
    try {
        const { Spaces } = req.body;

        console.log('Updating product _id:', req.params._id);
        console.log('New Spaces:', Spaces);

        if (typeof Spaces !== 'number') {
            return res.status(400).json({ msg: 'Spaces must be a number.' });
        }

        const collection = db.collection('Products');
        const result = await collection.updateOne(
            { _id: new ObjectId(req.params._id) },
            { $set: { Spaces: Spaces } }
        );

        console.log('Update result:', result);
        res.json(result.modifiedCount === 1 ? { msg: 'success' } : { msg: 'error' });
    } catch (err) {
        console.error('Update error:', err);
        next(err);
    }
});

app.get('/collection/:collectionName/:_id', async (req, res, next) => {
    try {
        const result = await req.collection.findOne({ _id: new ObjectId(req.params._id) });
        res.json(result);
    } catch (err) {
        next(err);
    }
});