var fs = require("fs");
var express = require("express");
var student = require("./student.js");
var mysql = require("mysql");

var router = express.Router();
var db = mysql.createPool({host:"localhost",port:3306,user:"root",password:"110199",database:"login"});
var logStatus = false;//登录状态，默认时没登陆

//判断对象是否为空的方法
function judgeObj(obj){
           for(var item in obj){
               return true;
           }
          return false;

        }

router.get("/student/select", function(req, res) {
	if (logStatus) {
		student.selectall(function(err, data) {
		if (err) {
			res.status(500).send("文件未找到");
		} else {
			res.render("students.html", {
				student: data,
				yh: req.session.yh
			});
		}
	});
	}else {
		res.redirect("/login");
	}
	
});

//http://localhost:8888/student/insert
router.get("/student/insert", function(req, res) {
	if (logStatus) {
		res.render("insert.html", {
				yh: req.session.yh
			});
	}else {
		res.redirect("/login");
	}
});

//http://localhost:8888/student/insertform
router.post("/student/insertform", function(req, res) {
	if (logStatus) {
		console.log(req.body);
	student.insert(req.body, function(err, data) {
		if (err) {
			res.status(500).send("服务器内部错误");
		} else {
			res.redirect("/student/select");
		}
	});
}else {
	res.redirect("/login");
}
});

//http://localhost:8888/student/edit
router.get("/student/edit", function(req, res) {
	if (logStatus) {
		student.selectid(req.query.id, function(err, ret) {
		if (err) {
			res.status(500).send("服务器内部错误");
		} else {
			res.render("selectid.html", {
				student: ret,
				yh: req.session.yh
			});
		}
	});
	}else {
		res.redirect("/login");
	}
});

router.post("/student/update", function(req, res) {
	student.update(req.body, function(err) {
		if (err) {
			res.status(500).send("服务器内部错误");
		} else {
			res.redirect("/student/select");
		}
	});
}); 

router.get("/student/remove", function(req, res) {
	student.remove(req.query.id, function(err) {
		if (err) {
			res.status(500).send("服务器内部错误");
		} else {
			res.redirect("/student/select");
		}
	});
});

//上传文件请求
router.post("/student/insertfile", function(req, res) {
	var newName = req.files[0].originalname;
	fs.rename(req.files[0].path, newName, function(err) {
		if (err) {
			res.send(err);
		} else {
			fs.readFile("./" + newName, function(err, data1) {
				if (err) {
					res.status(500).send("服务器内部错误");
				} else {
					fs.readFile("./db.json", function(err, data2) {
						if (err) {
							res.status(500).send("服务器内部错误");
						} else {
							var ndata1 = JSON.parse(data1).student;
							var ndata2 = JSON.parse(data2).student;
							ndata2 = ndata2.concat(ndata1); //合并数组
							var newFile = JSON.stringify({
								student: ndata2
							});
							fs.writeFile("./db.json", newFile, function(err) {
								if (err) {
									res.status(500).send("服务器内部错误");
								} else {
									fs.unlink("./" + newName, function(err) {
										if (err) {
											res.status(500).send("服务器内部错误");
										} else {
											res.redirect("/student/select");
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
});

//http://localhost:8888/login
router.get('/login', function (req, res) {
  	res.render('login.html');
});

//http://localhost:8888/login  表单请求时
router.post('/login', function (req, res) {

	db.query(`SELECT * FROM users WHERE user='${req.body.user}'`, function(err, data) {
		if (err) {
			console.log(err);
		}else {
			if (!judgeObj(data)) {
				res.send({"ok":false,"message":"用户不存在"});
			}else if (req.body.password!=JSON.parse(JSON.stringify(data))[0].password) {
				res.send({"ok":false,"message":"用户名或密码错误"});
			}else {
				var yh = {user: req.body.user,password: req.body.password}
				req.session.yh = yh;
				logStatus = true;
				res.send({"ok":true,"message":"登陆成功"});
			}
		}
	});
});

//http://localhost:8888/register
router.get('/register', function (req, res) {
  	res.render('register.html');
});
  
//http://localhost:8888/register   注册请求
router.post('/register', function (req, res) {

  	db.query(`SELECT * FROM users WHERE user='${req.body.user}'`, function(err, data) {
		if (err) {
			console.log(err);
		}else {
			if (judgeObj(data)) {
				res.send({"ok":false,"message":"用户已存在"});
			}else {		
				db.query(`INSERT INTO users VALUES ('${req.body.user}', '${req.body.password}', '${req.body.email}');`, function(err, data) {
					if (err) {
						console.log(err);
					}else {
						var yh = {user: req.body.user,password: req.body.password}
						req.session.yh = yh;
						res.send({"ok":true,"message":"注册成功"});
					}
				})
			}
		}
	});
});

router.get("/out", function(req, res) {
	logStatus = false;
	req.session.yh = null;
	res.redirect("/login");
});

//http://localhost:8888
router.get("/", function(req, res) {
	if (logStatus) {
		res.render("welcome2.html", {
				yh: req.session.yh
			});
	}else {
		res.render("welcome.html");
	}
});

//http://localhost:8888/student
router.get("/student", function(req, res) {
	if (logStatus) {
		res.render("welcome2.html", {
				yh: req.session.yh
			});
	}else {
		res.render("welcome.html");
	}
});

//错误地址
router.get("/welcome", function(req, res) {
	if (logStatus) {
		res.render("welcome2.html", {
				yh: req.session.yh
			});
	}else {
		res.render("welcome.html");
	}
});

module.exports = router;
