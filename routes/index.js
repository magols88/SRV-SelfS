var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const db = CyclicDB(process.env.Cyclic_DB);
let contentCollection = db.collection("content");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/json", async function (req, res, next) {
  let data;
  try {
    data = fs.readFileSync(
      path.resolve(__dirname, "../data/json.json"),
      "utf8"
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to read data" });
  }
  res.json({ status: "success", data: JSON.parse(data) });
});

router.post("/json", async function (req, res, next) {
  try {
    const { json } = req.body;
    fs.writeFileSync(
      path.resolve(__dirname, "../data/json.json"),
      JSON.stringify(json)
    );
  } catch (error) {
    console.log(error);
    return res.json({ status: "error", message: "Failed to save data" });
  }
  res.json({ status: "success", message: "data saved" });
});

router.post("/dish", async function (req, res, next) {
  try {
    const { content } = req.body;
    const { name, country } = content;
    await contentCollection.set(name, {
      name,
      country,
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: "error", message: "Failed to save data" });
  }
  res.json({ status: "success", message: "data saved" });
});

router.get("/dish", async function (req, res, next) {
  let content = await contentCollection.get("content");
  if (!content) {
    return res.json({ status: "error", message: "Failed to read data" });
  }
  res.json({ status: "success", data: content });
});

module.exports = router;
