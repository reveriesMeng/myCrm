var express = require("express");
var bodyParser = require("body-parser");
var art = require("express-art-template");
var router = require("./router");
var multer =require("multer");
var path = require('path');
var session = require('express-session');


var server = express();
server.listen(8888);

//配置文件
server.engine("html", art);
server.use(bodyParser.urlencoded({
	extended: false
}));
server.use(multer({dest:"./"}).any());//dest表示上传去的地址 .any表示任何都接受  .single表示只接受前端name为single括号里面值得数据

//静态开放文件夹，存了css，js，image和lib引入包等文件
server.use("/public/", express.static(path.join(__dirname, './public/')));

//配置session
server.use(session({
  // 配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
  // 目的是为了增加安全性，防止客户端恶意伪造
  secret: 'itcast',
  resave: false,
  saveUninitialized: false // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
}))

//引用路由模块
server.use(router);

//错误地址
server.use(function(req, res) {
	res.render("error.html");
});