const express = require("express");
const app = express();
const cors = require("cors");
const DB = require("./Database/DB");
const staffRouter = require("./routes/staffRouter");
const adminRouter = require("./routes/adminRouter");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use("/files", express.static("files"));
app.use("/staff", staffRouter);
app.use("/admin", adminRouter);

app.post("/download", (req, res) => {
  const fileName = req.body.fileName;
  const filePath = req.body.filePath;

  const fileFullPath = path.join(__dirname, filePath);

  const file = fs.createReadStream(fileFullPath);

  file.on("open", () => {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    file.pipe(res);
  });

  file.on("error", (err) => {
    console.error("Error reading file:", err);
    res.status(404).send("File not found");
  });
});

app.get("/", async (req, res) => {
  let data = await DB.query("SELECT * FROM staff_details");
  res.json(data);
});

app.listen(3001, () => {
  console.log(`app listening at http://localhost:3001`);
});
