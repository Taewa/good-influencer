import { MongoClient } from "mongodb";

const connectionString = "mongodb://localhost:27017";
const client = new MongoClient(connectionString);
let conn;

try {
    conn = await client.connect();
} catch (e) {
    console.error('db connection error');
    console.error(e);
}

let db = conn.db("GoodInfluencer");

export default db;