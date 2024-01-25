var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const fs = require("fs");
const path = require("path");
const CyclicDb = require("@cyclic.sh/dynamodb");
const db = CyclicDb(process.env.CYCLIC_DB);
let contentCollection = db.collection("content");
const { save } = require("../save_json");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/json", async function (req, res, next) {
  try {
    const data = await s3
      .getObject({
        Bucket: "cyclic-apricot-oyster-kilt-eu-north-1",
        Key: "data/json.json",
      })
      .promise();
    const content = JSON.parse(data.Body.toString());
    res.json({ status: "success", content });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "error",
      message: `Failed to load data: ${error.message}`,
    });
  }
});

router.post("/json", async function (req, res, next) {
  try {
    const { content } = req.body;
    const { name, country } = content;
    await save({ name, country });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "error",
      message: `Failed to save data: ${error.message}`,
    });
  }
  res.json({ status: "success" });
});

router.get("/dish", async function (req, res, next) {
  let item = await contentCollection.list();
  res.send(item);
});

router.get("/dish/:dishKey", async function (req, res, next) {
  let item = await contentCollection.get(req.params.dishKey);
  res.send(item);
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

module.exports = router;
