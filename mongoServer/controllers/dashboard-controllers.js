const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI || "mongodb+srv://sandhya:123@cluster0.ddkdz.mongodb.net/wonpulse?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const GetDashboardData = async (req, res, next) => {
    console.log("Triggering GET GroupByCollection");

    try {
        await client.connect();
        const db = client.db("wonpulse");
        const collection = db.collection("GroupByCollection");

        const List = await collection.find({}).toArray();

        res.json({ List });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Error fetching data", error });
    } finally {
        await client.close();
    }
};

exports.GetDashboardData = GetDashboardData;
