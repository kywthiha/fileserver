"use strict";

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.params[0];
    if (folder) {
      const folderPath = path.join(__dirname, `/uploads/${folder}`);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, {
          recursive: true,
        });
      }
      cb(null, folderPath);
    } else {
      cb(null, path.join(__dirname, `/uploads`));
    }
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

const app = express();

app.use(cors());

app.use(express.static("uploads"));

app.use((req, res, next) => {
  if (req.method == "GET") {
    next();
  } else if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
      jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET,
        { ignoreExpiration: true },
        function (err, decoded) {
          if (err) {
            return res
              .status(401)
              .json({ statusCode: 401, message: "Unauthorized" });
          }
          next();
        }
      );
    } else {
      return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
    }
  } else {
    return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
  }
});

app.post("/*", upload.single("file"), function (req, res, next) {
  if (req.file) {
    const path = req.file.path.split("/usr/src/app/uploads/")[1];
    res.json({
      status: "success",
      path,
      url: `${req.protocol}://${req.get("host")}/${path}`,
    });
  } else {
    res
      .status(401)
      .send({ status: "error", message: "The file field is required." });
  }
});

app.put(["/*/:filename", "/:filename"], function (req, res, next) {
  if (req.headers["content-type"]) {
    const filename = req.params.filename;

    if (!filename) {
      res
        .status(401)
        .send({ status: "error", message: "The filename is required." });
    }

    const folder = req.params[0];

    if (folder) {
      const folderPath = path.join(__dirname, `/uploads/${folder}`);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, {
          recursive: true,
        });
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
  } else {
    res
      .status(401)
      .send({ status: "error", message: "The binary file is required." });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
