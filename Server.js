const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookie_Parser = require('cookie-parser')

const app = express()
const port = 80

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/UserAuthentication');
}

app.use(cookie_Parser())
app.use(express.urlencoded({ extended: true }))

app.set('view engine','pug')
app.set('views', path.join(__dirname,"HTML"))

const user_Schema = new mongoose.Schema({
    FullName:{
        type:String,
        required:true
    },
    Email: { 
        type: String,
        required: true
    },
    Password: String,
    token: [
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
})

user_Schema.methods.generateAuthToken = async function (req, res) {
    const token = jwt.sign({_id: this._id}, "Thisisaprivatesecretkeyforthisproject")
    this.token = this.token.concat({token})
    await this.save()
    return token
}

const user = mongoose.model('User', user_Schema)

const auth = async (req, res, next) => {
    try {
        const token = await req.cookies.account
        const verify_User = jwt.verify(token, "Thisisaprivatesecretkeyforthisproject")

        req.current_user = await user.findOne({_id:verify_User._id})

        next()

    } catch(err) {
        res.redirect("/Register")
    }
}

app.get('/', auth, (req,res) => {
    const current_user = req.current_user
    res.status(200).render('index.pug', {current_user})
})

app.get('/Store', auth, (req,res) => {
    
    res.status(200).render('Store.pug', {current_user})
})

app.get('/Register', (req,res) => {
    res.status(200).render('Register.pug')
})

app.get('/Login', (req,res) => {    
    res.status(200).render('Login.pug')
})

app.get('/Logout', auth, (req,res) => {
    res.clearCookie('account')
    res.redirect('/')
})

app.post('/logging_in', async (req,res) => {
    
    var email = req.body.Email;
    var password = req.body.Password;

    var user = mongoose.model("User", user_Schema)
    
    var User_email = await user.findOne({Email:email});
    console.log(User_email)

    const decrypted_pass = await bcryptjs.compare(password, User_email.Password);

    if(decrypted_pass){
        const token = await User_email.generateAuthToken();
        res.cookie("account", token)

        res.status(200).redirect('/')
    } else {
        res.json({
            message: "Incorrect password"
        })
    }
})

app.post('/createAccount', async (req, res) => {
    console.log(req.body.FullName)
    if (req.body.Password == req.body.confirm_Password){
        const salt = bcryptjs.genSaltSync(10)
        const encrypted_pass = bcryptjs.hashSync(req.body.Password, salt)
        const current_User = new user({FullName: req.body.FullName, Email: req.body.Email, Password: encrypted_pass})

        await current_User.save()
        res.redirect("/Login")
    }
})

app.listen(port, ()=>{
    console.log(`Server hosted on http://localhost`)
}) 