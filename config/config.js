import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import app from "../app.js";

const port = process.env.PORT || 5000;
// mongodb connection
mongoose
  .connect(process.env.MongoURI)
  .then(() => console.log("Database Connection Established"))
  .catch((e) => console.log(e));

app.listen(port, () => {
  console.log(`app is listening on port ${port}...`);
  console.log("Connecting to database...");
});
