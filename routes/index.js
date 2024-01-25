var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const CyclicDb = require("@cyclic.sh/dynamodb");
const db = CyclicDb(process.env.CYCLIC_DB);
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
  let item;
  try {
    const { content } = req.body;
    const { name, country } = content;
    item = await contentCollection.set(name, {
      name,
      country,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "error",
      message: `Failed to save data: ${error.message}`,
    });
  }
  res.json({ status: "success", message: item });
});

router.get("/dish", async function (req, res, next) {
  try {
    let item = await contentCollection.get("content");
    if (item === null) {
      return res.json({
        status: "fail",
      });
    } else {
      let contentValue = content.props.value;
      console.log(contentValue);
      res.json({ status: "success", content: contentValue });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: "error", message: "Failed to read data" });
  }
});

module.exports = router;
