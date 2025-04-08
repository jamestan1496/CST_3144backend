const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const path = require('path');

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
    console.log("Request for image received");
});

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
    if (e) return next(e)
    res.send(results.ops)
    })
    });

// PUT endpoint updated to use Spaces instead of Availability
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
    {_id: new ObjectID(req.params.id)},
    {$set: req.body},
    {safe: true, multi: false},
    (e, result) => {
    if (e) return next(e)
    res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
    })
    });

app.get('/collection/:collectionName/:_id', async (req, res, next) => {
    try {
        const result = await req.collection.findOne({ _id: new ObjectId(req.params._id) });
        res.json(result);
    } catch (err) {
        next(err);
    }
});

app.get('/collection/:collectionName/search', async (req, res, next) => {
    const query = req.query.q;  // Extract the query parameter

    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }

    try {
        const collection = req.collection;  // Use the collection set by the param middleware

        console.log('Search query received:', query);  // Debug the query received by backend

        // Ensure you're searching in title and description fields
        const results = await collection.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },   // Case-insensitive search in title
                { description: { $regex: query, $options: 'i' } }  // Case-insensitive search in description
            ]
        }).toArray();

        console.log('Search results:', results);  // Debug the results from MongoDB

        if (results.length === 0) {
            console.log('No results found for query:', query);  // Debug if no results found
        }

        res.json(results);  // Send the results back as JSON
    } catch (err) {
        console.error('Search error:', err);  // Log the error if any
        next(err);  // Pass the error to the next error handler
    }
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
