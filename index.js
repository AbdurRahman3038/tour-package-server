const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b3njf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('tourPackageDB');
        const packagesCollection = database.collection('packages');
        const bookingsCollection = database.collection('bookings')

        // POST API to add
        app.post('/packages', async (req, res) => {
            const package = req.body;
            console.log('first post API hitted', package);
            const result = await packagesCollection.insertOne(package);
            console.log(result);
            res.json(result);
        });

        // POST API to book
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log('Second API got hitted too', booking);
            const result = await bookingsCollection.insertOne(booking);
            console.log(result);
            res.json(result);
        });

        //GET API
        app.get('/packages', async (req, res) => {
            const cursor = packagesCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });

        //GET API
        app.get('/bookings', async (req, res) => {
            const cursor = bookingsCollection.find({});
            const bookings = await cursor.toArray();
            res.send(bookings);
        });

        //GET API for specific user
        app.get('/bookings/:email', async (req, res) => {
            const cursor = bookingsCollection.find({ email: req.params.email });
            const bookings = await cursor.toArray();
            res.send(bookings);
        });

        //Update booking status
        app.patch('/bookings/update/:id', (req, res) => {
            bookingsCollection.updateOne({ _id: ObjectId(req.params.id) },
                {
                    $set: { status: req.body.status }
                })
                .then(result => {
                    res.send(result.modifiedCount > 0)
                })
        })

        // DELETE API from bookings
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            console.log('deleting user with id ', result);
            res.json(result);
        })

        // DELETE API from packages
        app.delete('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await packagesCollection.deleteOne(query);
            console.log('deleting user with id ', result);
            res.json(result);
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Tour Package server is running');
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})