const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const handleSuccess = require("./handleSuccess");
const handleError = require("./handleError");
const headers = require("./headers");
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("資料庫連接成功"));

// schema 開始

const Post = require("./models/post.js");

// schema 結束

const requestListener = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url == "/posts" && req.method == "GET") {
    const post = await Post.find();
    handleSuccess(res, post);
  } else if (req.url == "/posts" && req.method == "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (data.content !== undefined) {
          const newPost = await Post.create({
            name: data.name,
            content: data.content,
          });
          handleSuccess(res, newPost);
        } else {
          const message = "欄位未填寫正確，或無該筆貼文 id";
          handleError(res, message);
        }
      } catch (error) {
        handleError(res, error);
      }
    });
  } else if (req.url.startsWith("/posts/") && req.method == "DELETE") {
    const id = req.url.split("/").pop();
    try {
      await Post.findByIdAndDelete(id);
      handleSuccess(res, null);
    } catch (err) {
      handleError(res, err);
    }
  } else if (req.url == "/posts" && req.method == "DELETE") {
    await Post.deleteMany();
    const newMessage = "已刪除全部貼文";
    handleSuccess(res, newMessage);
  } else if (req.url.startsWith("/posts/") && req.method == "PATCH") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        if (data !== undefined) {
          const id = req.url.split("/").pop();
          await Post.findByIdAndUpdate({ _id: id }, data, { new: true });
          const newData = await Post.find({ _id: id });
          handleSuccess(res, newData);
        } else {
          const message = "欄位未填寫正確，或無該筆貼文 id";
          handleError(res, message);
        }
      } catch (error) {
        const message = error;
        handleError(res, message);
      }
    });
  } else if (req.method == "OPTIONS") {
    handleSuccess(res);
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "failed",
        message: "not found",
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(3000);
