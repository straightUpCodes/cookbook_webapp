import dotenv from "dotenv";
import express, { json } from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const mode = process.env.MODE || "development";

// Dynamically choose the .env file
const envPath = `.env.${mode}`;
dotenv.config({ path: `./backend/${envPath}` });

const app = express();
const PORT = process.env.PORT;

app.use(cors()); // Allow frontend to access backend
app.use(json());

const client = new MongoClient(process.env.URI); //Connection string found in MongoDB cluster

let db;

export async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db("cookbook");
  }
  return db;
}

app.get("/api/categories", async (_req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("categories");

    const documents = await collection.find().toArray();
    res.json(documents); // Send JSON response
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/recipes/:category", async (req, res) => {
  const category_name = req.params.category;

  try {
    const db = await connectToDatabase();
    const collection = db.collection("recipes");

    const documents = await collection
      .find({ category: category_name })
      .toArray();
    res.json(documents); // Send JSON response
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/recipe/:name", async (req, res) => {
  const recipe_name = decodeURIComponent(req.params.name); // Decode URL-encoded string

  try {
    const db = await connectToDatabase();
    const collection = db.collection("recipes");

    const documents = await collection.find({ name: recipe_name }).toArray();
    res.json(documents); // Send JSON response
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/recipe/add", async (req, res) => {
  const recipe = req.body;

  try {
    const db = await connectToDatabase();

    const myColl = db.collection("recipes");

    const result = await myColl.insertOne(recipe);

    res.status(200).json({
      message: `A document was inserted with the _id: ${result.insertedId}`,
    }); // Send response
  } catch (err) {
    console.error("Error during insertion:", err);
    res.status(500).json({ error: "Failed to insert document" });
  }
});

app.post("/api/category/add", async (req, res) => {
  const category = req.body.categoryName;

  try {
    const db = await connectToDatabase();
    const collection = db.collection("categories");

    const filter = { _id: new ObjectId("67e9c0ae0c3a1d90097e3ce4") };
    const update = { $set: { [category]: [] } };

    const result = await collection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Updated successfully", result });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.post("/api/category/delete", async (req, res) => {
  const category = req.body.categoryName;

  try {
    const db = await connectToDatabase();
    const collection = db.collection("categories");

    const filter = { _id: new ObjectId("67e9c0ae0c3a1d90097e3ce4") };
    const update = { $unset: { [category]: [] } };

    const result = await collection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Updated successfully", result });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.post("/api/recipe/delete", async (req, res) => {
  const doc = req.body;

  try {
    const db = await connectToDatabase();
    const collection = db.collection("recipes");

    const result = await collection.deleteOne(doc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Deleted successfully", result });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.post("/api/recipe/update", async (req, res) => {
  const doc = req.body;

  const updateDocument = {
    $set: {
      name: doc.name,
      steps: doc.steps,
      ingredients: doc.ingredients,
      category: doc.category,
      link: doc.link,
      ranking: { vanessa: doc.ranking.vanessa, farid: doc.ranking.farid },
      cookTime: { hours: doc.cookTime.hours, minutes: doc.cookTime.minutes },
      dateAdded: doc.dateAdded,
    },
  };

  try {
    const db = await connectToDatabase();
    const collection = db.collection("recipes");
    const filter = { name: doc.name };
    const options = { upsert: true };

    const result = await collection.updateOne(filter, updateDocument, options);

    res.status(200).json({ message: "Updated successfully", result });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.post("/api/incart", async (req, res) => {
  const recipe_names = req.body;

  try {
    const db = await connectToDatabase();
    const collection = db.collection("recipes");

    const documents = await collection.find(recipe_names).toArray();
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching data:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

app.get("/api/allrecipes", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("recipes");

    const documents = await collection.find({}).toArray();
    res.json(documents); // Send JSON response
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/addtocart", async (req, res) => {
  const doc = req.body;
  const currentDate = new Date();

  const updateDocument = {
    $set: {
      dateAdded: currentDate,
    },
  };

  try {
    const db = await connectToDatabase();
    const collection = db.collection("recipes");
    const options = { upsert: true };

    const result = await collection.updateMany(doc, updateDocument, options);

    res.status(200).json({ message: "Updated successfully", result });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.get("/api/units", async (_req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("units");

    const documents = await collection.find().toArray();

    // Extract only the units
    const unitsArray = documents.flatMap((doc) => doc.units);

    res.json(unitsArray); // Send only the units
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/unit/add", async (req, res) => {
  const unit = req.body.unitName; // Expect a single string

  if (!unit || typeof unit !== "string") {
    return res
      .status(400)
      .json({ message: "unitName must be a non-empty string" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("units");

    // Update a specific document, assuming you have one master document for units
    const filter = { _id: new ObjectId("68b63461cf8f5a3d5313939c") };
    const update = { $addToSet: { units: unit } }; // $addToSet prevents duplicates

    const result = await collection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Unit added successfully", result });
  } catch (error) {
    console.error("Error adding unit:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.post("/api/unit/delete", async (req, res) => {
  const unit = req.body.unitName; // Expect a single string

  if (!unit || typeof unit !== "string") {
    return res
      .status(400)
      .json({ message: "unitName must be a non-empty string" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("units");

    const filter = { _id: new ObjectId("68b63461cf8f5a3d5313939c") };
    const update = { $pull: { units: unit } };

    const result = await collection.updateOne(filter, update);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Unit deleted successfully", result });
  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.listen(PORT, process.env.HOST, () => {
  console.log("Server running");
});
