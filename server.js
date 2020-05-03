var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/
  console.log("有人发请求过来啦！路径（带查询参数）为：" + pathWithQuery);

  if (path === "/home.html") {
    response.statusCode === 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const cookie = request.headers.cookie;
    const string = fs.readFileSync(`./public/home.html`).toString();
    if (cookie) {
      const userArray = JSON.parse(fs.readFileSync(`./db/users.json`));
      const session = JSON.parse(fs.readFileSync(`./session.json`).toString());
      const sessionId = cookie.substring(cookie.split(";")[0].indexOf("=") + 1);
      const user = userArray.find(
        (user) => user.id.toString() === session[sessionId].id.toString()
      );
      console.log(user);

      response.write(
        string
          .replace("{{userName}}", user.name)
          .replace("{{logStatus}}", "已登录")
      );
    } else {
      response.write(
        string.replace("{{userName}}", "").replace("{{logStatus}}", "未登录")
      );
    }
    response.end();
  } else if (path === "/signIn" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const arr = [];
    request.on("data", (chunk) => {
      arr.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(arr).toString();
      const obj = JSON.parse(string);
      const userArray = JSON.parse(fs.readFileSync(`./db/users.json`));
      const user = userArray.find(
        (user) => user.name === obj.name && user.password === obj.password
      );
      if (user === undefined) {
        response.statusCode = 400;
        response.write(`name password不匹配`);
        response.end();
      } else {
        const random = Math.random();
        const session = JSON.parse(
          fs.readFileSync(`./session.json`).toString()
        );
        session[random] = { id: user.id };
        fs.writeFileSync(`./session.json`, JSON.stringify(session));
        response.statusCode === 200;
        response.setHeader("Set-Cookie", `session_id=${random};HttpOnly`);
        response.end();
      }
    });
  } else if (path === "/register" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const arr = [];
    request.on("data", (chunk) => {
      arr.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(arr).toString();
      const obj = JSON.parse(string);
      console.log(obj);
      const userArray = JSON.parse(fs.readFileSync(`./db/users.json`));
      console.log(userArray);
      const newUser = {
        id: userArray.length,
        name: obj.name,
        password: obj.password,
      };
      userArray.push(newUser);
      fs.writeFileSync(`./db/users.json`, JSON.stringify(userArray));
      response.statusCode === 200;
      response.end();
    });
  } else {
    const filePath = path === "/" ? "/index.html" : path;
    const suffix = filePath.substring(filePath.lastIndexOf("."));
    console.log(suffix);
    const fileTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".jpg": "image/jpeg",
      ".png": "image/png",
    };

    response.setHeader(
      "Content-Type",
      `${fileTypes[suffix] || "text/html"};charset=utf-8`
    );
    let content;
    try {
      content = fs.readFileSync(`./public/${filePath}`);
      response.statusCode = 200;
    } catch (error) {
      content = `该文件不存在`;
      response.statusCode = 404;
    }
    response.write(content);
    response.end();
  }
  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);
