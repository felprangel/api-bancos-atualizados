const express = require("express");
const app = express();

app.get("/status", (req, res) => {});

app.listen(3333, () => {
  console.log("listening on port 3333");
});
