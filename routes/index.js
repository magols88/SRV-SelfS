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
        Key: "json.json",
      })
      .promise();
    const content = JSON.parse(data.Body.toString());
    res.json({ status: "success", message: content });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "error",
      message: `Failed to load data: ${error.message}`,
    });
  }
});

router.post("/json", async function (req, res, next) {
  const { jsonData } = req.body;
  if (!jsonData) {
    return res.json({
      status: "error",
      message: "jsonData is required",
    });
  }
  try {
    await save(jsonData, "json.json");
  } catch (error) {
    console.log(error);
    return res.json({
      status: "error",
      message: `Failed to save data: ${error.message}`,
    });
  }
  res.json({ status: "success", message: "New string added" });
});

router.get("/dish", async function (req, res, next) {
  try {
    const data = await s3
      .listObjectsV2({ Bucket: "cyclic-apricot-oyster-kilt-eu-north-1" })
      .promise();
    res.send(data.Contents);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: `Failed to load data: ${error.message}`,
    });
  }
});

router.get("/dish/:dishKey", async function (req, res, next) {
  try {
    const data = await s3
      .getObject({
        Bucket: "cyclic-apricot-oyster-kilt-eu-north-1",
        Key: req.params.dishKey,
      })
      .promise();
    res.send(JSON.parse(data.Body.toString()));
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: `Failed to load data: ${error.message}`,
    });
  }
});

router.post("/dish", async function (req, res, next) {
  let item;
  try {
    const { dishesData } = req.body;
    const { name, country } = dishesData;
    item = { name, country };
    await save(dishesData, "dishes.json");
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
