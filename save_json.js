const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const save = async (content) => {
  console.log("saving");
  await s3
    .putObject({
      Body: JSON.stringify(content, null, 2),
      Bucket: "cyclic-apricot-oyster-kilt-eu-north-1",
      Key: "json.json",
    })
    .promise();
};

module.exports = { save };
