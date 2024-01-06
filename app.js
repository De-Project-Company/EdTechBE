import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


app.use(express.json());


app.get('/', (req, res) => {
  res.send("welcome to edtech backend repository")
})


// mongodb connection
mongoose
  .connect(process.env.MongoURI)
  .then(() => console.log("Database Connection Established"))
  .catch((e) => console.log(e.message));


  app.listen( port,()=>{
    console.log(`app is listening on port ${port}...`)
})