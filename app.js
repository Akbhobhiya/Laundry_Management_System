var express = require('express')
var mongojs = require('mongojs')
var JSAlert = require("js-alert");
const qr = require("qrcode");
var shortid = require('shortid');
const nodemailer= require('nodemailer')
var md5=require('md5');
const validatePhoneNumber = require('validate-phone-number-node-js');
var validator = require("email-validator");
var bodyparser=require('body-parser');

var db = mongojs('mongodb://localhost:27017/mydb', ['sample1','orders','issues','feeds','admin'])

var app = express()
app.use(express.static('public'))
app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine','ejs')
app.use('/images',express.static('views/images'))


app.get('/',function(req,res){
	res.sendFile('index.html')
})

app.get('/login',function(req,res){
	res.render('login')
})
app.get('/signup',function(req,res){
	res.render('signup')
})
app.get('/mailotp',function(req,res){
	res.render('mailotp')
})
app.get('/smailotp',function(req,res){
	res.render('smailotp')
})


function generate() {
        var add = 1, max = 12 - add;   

        if ( 6 > max ) {
                return generate(max) + generate(6 - max);
        }

        max        = Math.pow(10, 6+add);
        var min    = max/10; 
        var number = Math.floor( Math.random() * (max - min + 1) ) + min;

        return ("" + number).substring(add); 
}





app.get('/loginsubmit',function(req,res){
	var prodata = {
		rno : req.query.rno,
		pwd : md5(req.query.pwd)
	}
	let rno=req.query.rno;
	let pwd=req.query.pwd;
	let errors=[]
	db.sample1.find(prodata, function(err,dat){
		if(dat.length>0){
			if(req.query.rno == 'admin' && req.query.pwd == '12345678'){
				var odata
				var idata
				db.orders.find({}, function(err,dat){
					if(err){
						console.log(err)
					}
					else{
						odata = dat
						db.issues.find({}, function(err,dat){
							if(err){
								console.log(err)
							}
							else{
								idata = dat
								res.render('admin',{ person : req.query.rno , orders : odata , issues : idata}) 
							}
						})
					}
				})
			}
			else{
				res.redirect('profiles/'+req.query.rno)
			}
		}
		else{
			console.log('profile does not exit or pwd incorrect!!')
			errors.push({msg:"Password or roll no do not match"});
			res.render("login",{errors});
			
		}
	})
})









function sendmailotpf(email){
	const gmailotp= generate();
	const massage= 'Your OTP to Login is::  '+ gmailotp;
	let transporter = nodemailer.createTransport({
    	service: 'gmail',
    	auth: {
        	user: '', // TODO: your gmail account
        	pass: '' // TODO: your gmail password
    	}
	});

	let mailOptions = {
    	from: '', // TODO: email sender
    	to: email, // TODO: email receiver
    	subject: 'NITKL Login OTP',
    	text: massage
	};

	transporter.sendMail(mailOptions, (err, data) => {
    	if (err) {
        	return console.log('Error occurs');
    	}
    	return console.log('Email sent!!!');
	});
	return gmailotp;
}

app.get('/sendmailotp',function (req,res) {
	var prodata = {
		email : req.query.email
	}
	let errors=[]
	let email= req.query.email;
	db.sample1.find(prodata, function(err,dat){
		if(dat.length>0){
			gmailotp=sendmailotpf(email);
			console.log('otp sent succesfully')
			errors.push({msg:"otp sent succesfully"});
			res.render("mailotp",{errors});
		}
		else{
			console.log('profile does not exit or otp incorrect!!')
			errors.push({msg:"email do not match"});
			res.render("smailotp",{errors});
		}
	})
})

app.get('/mailotpsubmit',function(req,res){
	var prodata = {
		email : req.query.email
	}
	let email=req.query.email;
	let mailotp=req.query.mailotp;
	console.log(email)
	console.log(mailotp)
	console.log(gmailotp)
	let errors=[]
	db.sample1.find(prodata, function(err,dat){
		if(dat.length>0){
			if(req.query.email == 'admin@admin.com' && req.query.mailotp == '12345678'){
				var odata
				var idata
				db.orders.find({}, function(err,dat){
					if(err){
						console.log(err)
					}
					else{
						odata = dat
						db.issues.find({}, function(err,dat){
							if(err){
								console.log(err)
							}
							else{
								idata = dat
								res.render('admin',{ person : req.query.rno , orders : odata , issues : idata}) 
							}
						})
					}
				})
			}
			else{
				if(gmailotp==mailotp){


					db.collection("sample1").findOne({email: email}, function(err, result) {
    					if (err) throw err;
    					console.log(result.rno);
    					res.redirect('profiles/'+result.rno)
    				})

				}
				else{
					console.log('wrong otp')
					errors.push({msg:"otp do not match"});
					res.render("mailotp",{errors});
				}
				
			}
		}
		else{
			console.log('profile does not exit or otp incorrect!!')
			errors.push({msg:"email do not match"});
			res.render("mailotp",{errors});
			
		}
	})
})

app.get('/mobileotpsubmit',function(req,res){
	var prodata = {
		phno : req.query.phno
	}
	let phno=req.query.phno;
	let mailotp=req.query.mailotp;
	let errors=[]
	db.sample1.find(prodata, function(err,dat){
		if(dat.length>0){
			if(req.query.phno == '0000000000' && req.query.mobileotp == '12345678'){
				var odata
				var idata
				db.orders.find({}, function(err,dat){
					if(err){
						console.log(err)
					}
					else{
						odata = dat
						db.issues.find({}, function(err,dat){
							if(err){
								console.log(err)
							}
							else{
								idata = dat
								res.render('admin',{ person : req.query.rno , orders : odata , issues : idata}) 
							}
						})
					}
				})
			}
			else{
				db.sample1.find(prodata)
				res.redirect('profiles/'+req.query.rno)
			}
		}
		else{
			console.log('profile does not exit or otp incorrect!!')
			errors.push({msg:"mobile number or otp do not match"});
			res.render("mobileotp",{errors});
			
		}
	})
})


































app.get('/signupsubmit',function(req,res){
	var prodata = {
		uid : req.query.uid,
		pwd : md5(req.query.pwd),
		email : req.query.email,
		phno : req.query.phno,
		rno : req.query.rno
	}
	let pwd=req.query.pwd;
	let email=req.query.email;
	let phno=req.query.phno;
	let rno=req.query.rno;
	let name=req.query.uid;
	var flg;
	var regExp = /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}/;
	var phone = phno.match(regExp);
	

	
	
 


	let errors=[];
	if(!pwd || !email || !phno || !rno || !name)
	
	errors.push({msg:"Fill all the credentials"});
	if(errors.length)
	{
		res.render('signup',{errors});
	}

	else
	{
		if(validator.validate(email))
		flg=0;
		else
		flg=1;
		
		
	
		var cpwd = md5(req.query.cpwd)
	if(cpwd!=md5(pwd))
	{
		errors.push({msg:"Password and confirm password are not matching"});
	}
	if(pwd.length<6)
	{
		errors.push({msg:"Password length should be atlest of 6 length"})
	}
	if(phno.length!=10)
	errors.push({msg:"Invalid phone no"});

	if(flg==1)
	errors.push({msg:"Invalid email address"});

	if(errors.length)
	{
		res.render('signup',{errors});
	}
	else
	{

		if(prodata.pwd == cpwd && prodata.pwd!=""){
			db.sample1.find(prodata, function(err,dat){
				if(dat.length>0){
					console.log('profile already found')
					errors.push({msg:"Profile already exist!!"})
					res.render("signup",{errors});
					
				}
				else{
					var transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
					  user: 'ffaker909@gmail.com',
					  pass: 'Imf@kef@ke'
					}
				  });
				  
				  var mailOptions = {
					from: 'ffaker909@gmail.com',
					to: email,
					subject: 'NITK-LMS registration',
					html: `<p>Hello ${name} roll no ${rno}... You are succesfully registered for NITK-LMS </p>`
				  };
				  
				  transporter.sendMail(mailOptions, function(error, info){
					if (error) {
					  console.log(error);
					} else {
					  console.log('Email sent: ' + info.response);
					}
				  });
					
					db.sample1.insert(prodata,function(err,data){
						if (err) {
							console.log(err)
						}
						else{
							console.log('inserted succesfully')
							res.render('login')
						}
					})	
				}
			})
		}

	}
	
	
	

	}
	
	
	
})

app.get('/profiles/:code',function(req,res){
	var a = req.params.code
	order = {
		id : a,
	}
	var odata
	var idata
	db.orders.find(order, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find(order, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('profiles',{ person : a , orders : odata , issues : idata}) 
				}
			})
		}
	})
})

app.get('/profiles/:code/neworder',function(req,res){
	res.render('neworder',{person : req.params.code})
})

app.get('/profiles/:code/newissue',function(req,res){
	var a = req.params.code
	order = {
		id : a,
	}
	var odata
	db.orders.find(order, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			res.render('newissue',{person : req.params.code , orders:odata})
		}
	})
	
})

app.get('/newissuesubmit', function(req, res){
	var datetime = new Date();
    var datet = datetime.toISOString().slice(0,10)
    var uid = req.query.udig
    if(uid == null){
    	uid = ""
    }
	var issue = {
		id : req.query.id,
		uid : uid,
		comment : req.query.comment,
		date : datet,
		status : "pending"
	}
	db.issues.insert(issue,function(err,data){
		if (err) {
			console.log(err)
		}
		else{
			console.log('inserted succesfully')
			res.redirect('/profiles/'+req.query.id)
		}
	})
})

app.get('/newordersubmit',function(req,res){
	var wp = {
		shirts : 10,
		pants : 15,
		jeans : 20,
		shorts : 15,
		towels : 6,
		mundu : 10,
		bsheets : 15,
		pillowc : 5,
	}
	var ip = {
		shirts : 10,
		pants : 15,
		jeans : 15,
		shorts : 10,
		towels : 0,
		mundu : 10,
		bsheets : 7,
		pillowc : 0,
	}
	var tamount

	var wamount = (wp.shirts*req.query.shirts + wp.pants*req.query.pants + wp.jeans*req.query.jeans + wp.shorts*req.query.shorts + 
	wp.towels*req.query.towel + wp.mundu*req.query.mundu + wp.bsheets*req.query.bsheet + wp.pillowc*req.query.pillow)
	var iamount = (ip.shirts*req.query.shirts + ip.pants*req.query.pants + ip.jeans*req.query.jeans + ip.shorts*req.query.shorts + 
	ip.towels*req.query.towel + ip.mundu*req.query.mundu + ip.bsheets*req.query.bsheet + ip.pillowc*req.query.pillow) 
	
	if(req.query.wash == "on" && req.query.iron == "on"){
		tamount = wamount+iamount
	}
	else if(req.query.wash == "on" && req.query.iron != "on"){
		tamount = wamount
	}
	else if(req.query.wash != "on" && req.query.iron == "on"){
		tamount = iamount
	}
	var unid = shortid.generate()

    var datetime = new Date();
    var datet = datetime.toISOString().slice(0,10)

	var order = {
		date : datet,
		uid : unid,
		id : req.query.id,
		sem : req.query.sem,
		hostel : req.query.hostel,
		room: req.query.room,
		shirts : req.query.shirts,
		pants : req.query.pants,
		jeans : req.query.jeans,
		shorts : req.query.shorts,
		towels : req.query.towel,
		mundu : req.query.mundu,
		bsheets : req.query.bsheet,
		pillowc : req.query.pillow,
		wash :  req.query.wash,
		iron : req.query.iron,
		amount : tamount,
		status : "pending"
	}
	
		let id = req.query.id
		let sem = req.query.sem
		let	hostel = req.query.hostel
		let room= req.query.room
		let shirts = req.query.shirts
		let pants = req.query.pants
		let jeans = req.query.jeans
		let shorts = req.query.shorts
		let towels = req.query.towel
		let mundu = req.query.mundu
		let bsheets = req.query.bsheet
		let pillowc= req.query.pillow
		let wash = req.query.wash
		let iron = req.query.iron
		let errors=[];
		// if(!id || !sem || !hostel || !room )
		// {
		// 	errors.push({msg:"Pls fill the required section to book order"});


		// }
		// if(errors.length)
		// {
		// 	res.render("neworder",{errors,person:id});

		// }

		// if(!shirts && !pants && !jeans && !shorts && !towels && !mundu && !bsheets && !pillowc )
		// errors.push({msg:"Select atleast one item to proceed"});
		// if(errors.length)
		// {
		// 	res.render("neworder",{errors,person:id});

		// }
	console.log(order)
	db.orders.insert(order,function(err,data){
		if (err) {
			console.log(err)
		}
		else{
			console.log('inserted succesfully')
			res.redirect('/profiles/'+req.query.id)
		}
	})
})
app.get("/feedback",function(req,res)
{
	res.render("feedback");
})
app.post("/feedback",function(req,res)
{
	var feed={
		name:req.body.name,
		email:req.body.email,
		comments:req.body.comments,
		experience:req.body.experience
	}
	console.log(feed);
	db.feeds.insert(feed,function(err,data){
		if (err) {
			console.log(err)
		}
		else{
			console.log('inserted succesfully')
			res.redirect('/');
		}
	})	


	
})

app.get('/profiles/admin/updateorder',function(req, res){
	var odata
	var idata
	db.orders.find({}, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find({}, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('updateorder',{ person : "admin", orders : odata , issues : idata}) 
				}
			})
		}
	})
}) 

app.get('/profiles/admin/updateissue',function(req, res){
	var odata
	var idata
	db.orders.find({}, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find({}, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('updateissue',{ person : "admin", orders : odata , issues : idata}) 
				}
			})
		}
	})
}) 

app.get('/updateordersubmit',function(req,res){
	var upid = req.query.udig
	var nstatus = req.query.stat

	db.orders.findAndModify({
	    query: { uid: upid },
	    update: { $set: { status: nstatus } },
	    new: true
	}, function (err, doc, lastErrorObject) {
	})
	db.orders.find({}, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find({}, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('admin',{ person : 'admin' , orders : odata , issues : idata}) 
				}
			})
		}
	})
})

app.get('/updateissuesubmit',function(req,res){
	var upid = req.query.udig
	var nstatus = req.query.stat

	db.issues.findAndModify({
	    query: { uid: upid },
	    update: { $set: { status: nstatus } },
	    new: true
	}, function (err, doc, lastErrorObject) {
	})
	db.orders.find({}, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find({}, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('admin',{ person : 'admin' , orders : odata , issues : idata}) 
				}
			})
		}
	})
})

app.listen(7000, function(){
	console.log("server started.")
})