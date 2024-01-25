const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const save = async (content, key) => {
  console.log("saving");
  await s3
    .putObject({
      Body: JSON.stringify(content, null, 2),
      Bucket: "cyclic-apricot-oyster-kilt-eu-north-1",
      Key: key,
    })
    .promise();
};

module.exports = { save };
