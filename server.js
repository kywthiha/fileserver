"use strict";

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

const app = express();

app.use(express.static("uploads"));

app.post("/", upload.single("file"), function (req, res, next) {
  res.json({
    status: "success",
    path: req.file.filename,
    url: `${req.protocol}://${req.get("host")}/${req.file.filename}`,
  });
});

app.put("/", function (req, res, next) {
  const filename = req.query.filename;

  if (!filename) {
    res.status(401).send({ status: "error", message: "File Name required" });
  }

  const folder = req.query.folder;

  if (folder) {
    if (!fs.existsSync(path.join(__dirname, `/uploads/${folder}`))) {
      fs.mkdirSync(path.join(__dirname, `/uploads/${folder}`));
    }
  }

  const objectKey = folder
    ? `${folder}/${Date.now()}_${filename}`
    : `${Date.now()}_${filename}`;

  const filePath = path.join(__dirname, `./uploads/${objectKey}`);
  const stream = fs.createWriteStream(filePath);

  stream.on("open", () => req.pipe(stream));

  stream.on("close", () => {
    res.status(200).send({
      status: "success",
      path: objectKey,
      url: `${req.protocol}://${req.get("host")}/${objectKey}`,
    });
  });

  stream.on("error", (err) => {
    res.status(500).send({ status: "error", err });
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
