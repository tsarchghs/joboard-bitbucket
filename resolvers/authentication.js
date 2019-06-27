const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const configs = require("../configs");
const fileHandling = require("../modules/fileApi");
const nodemailer = require("nodemailer");
const saltRounds = 10;
var mailgun = require('mailgun-js')(configs.mailgun);


const createToken = (userId) => {
	const token = jwt.sign({
		userId: userId
	},configs.jwt_secret);
	return token
}

const login = async (root,args,context,info) => {
	if (!args.email || !args.password){
		throw new Error("Invalid credentials!")
	}
	const user = await context.db.query.user({where:{email:args.email}});
	if (!user){
		throw new Error("Invalid credentials");
	}
	const validPassword = await bcrypt.compare(args.password,user.password);
	if (!validPassword){
		throw new Error("Invalid credentials");	
	}
	return {
		user: user,
		token: createToken(user.id),
		expiresIn: 1
	};
}

const register = async (root,args,context,info) => {
	var hasLogo; 
	var logo;
	if (!args.email || !args.password 
		|| (!args.company || !(args.company.email || args.company.name || args.company.email))
		){
		throw new Error("Please check that all of your arguments are not empty!")
	}
	const hashed_password = await bcrypt.hash(args.password,saltRounds);
	var userParams = {
		email: args.email,
		password: hashed_password,
		company: {
			create: {
				email: args.company.email,
				name: args.company.name,
				website: args.company.website
			}
		},
		role: "NORMAL"
	}
	// delete userParams["company"]["create"]["job"];
	// // if (args.company.job){
		// // 	delete args.company.job["company"]
		// // 	userParams["company"]["create"]["jobs"] = {
			// // 		create: {...args.company.job,expiresIn:new Date()}
			// // 	}
			// // }
	if (args.company.logo){
		console.log(145);
		logo = await fileHandling.processUpload(args.company.logo,"png",context);
		userParams.company.create.logo = { connect: { id: logo.id } }
	}
	console.log(userParams.company.create.logo,123);
	let user = await context.db.mutation.createUser({data:userParams},`
		{
			id
			company {
				id
			}
		}
	`);
	console.log(user.company)
	let job = await context.db.mutation.updateJob({
		where:{id: args.job},
		data: {
			company: { connect: { id: user.company.id } }
		}
	})
	console.log(user,context.db.mutation.createUser,33);
	return {
		user,
		token: createToken(user.id),
		expiresIn: 1
	};
}
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    auth: {
        user: 'gjergjk71@gmail.com',
        pass:'gjergji.123'
    }
});

const forgetPassword = async (root,args,context) => {
	if (!args.email){
		throw new Error("email arg can't be empty");
	}
	let user = await context.db.query.user({where:{email:args.email}});
	if (!user){
		return {
			success: false,
			error: `No user found with email ${args.email}`
		}
	}
	const token = jwt.sign({
		forgotPassword: user.id
	},configs.jwt_forgotPassword_secret);
	var data = {
	  from: 'Mailgun Sandbox <postmaster@sandbox7c10cba56e9a4f0f9b23c09194475167.mailgun.org>',
	  to: `${user.first_name} ${user.last_name} <${user.email}>`,
	  subject: `UX-Stories: Forgot password`,
	  text: `Here it is ${`localhost:3000/reset/${token}`}!`
	};
	console.log(data);
	mailgun.messages().send(data,(err,body) => {
		console.log(err,body);
	});
	return {success:true}
}

const verifyForgotPassword = async (root,args,context) => {
	if (!args.token){
		throw new Error("Token can't be empty");
	}
	return await jwt.verify(args.token,configs.jwt_forgotPassword_secret,(err,decoded) => {
		return {valid:!err}
	})
}

const resetPassword = async (root,args,context) => {
	if (!args.token || !args.new_password || !args.repeat_new_password){
		throw new Error("token,new_password or repeat_new_password can't be empty");
	}
	if (!(args.new_password === args.repeat_new_password)){
		return {
			success:false,
			error: "Password do not match"
		}
	}
	const decoded = await jwt.verify(args.token,configs.jwt_forgotPassword_secret,(err,decoded) => {
		if (err) return new Error("Invalid token");
		return decoded
	});
	console.log(decoded);
	if (decoded.message){
		return {
			success: false,
			error: decoded.message
		};
	}
	try {
		const user = await context.db.mutation.updateUser({
			data:{
				password: await bcrypt.hash(args.new_password,saltRounds)
			},
			where:{id:decoded.forgotPassword}
		});
	} catch (error){
		return {success:false,error}
	}
	return {success:true}

}

module.exports = {
	login,
	createToken,
	register,
	forgetPassword,
	verifyForgotPassword,
	resetPassword
}