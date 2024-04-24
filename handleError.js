const headers = require("./headers");
const handleError = (res, err) => {
  res.writeHead(400, headers);
  res.write(
    JSON.stringify({
      status: "false",
      message: err,
    })
  );
  res.end();
};
module.exports = handleError;
