if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}




const express=require('express');
const app=express();

const path=require('path')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const mongoose=require('mongoose');
const Userinfo=require('./models/Userinfo');
const methodOverride = require('method-override');
// const { userInfo } = require('os');
const flash = require('connect-flash');
app.use(methodOverride('_method'));
const ejsMate=require('ejs-mate');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const secret = process.env.SECRET || 'thisdfdssdfdsfdstet!';
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { isLoggedIn,isAuthor } = require('./islogmiddle');
const User = require('./models/user');
const dburl='mongodb://127.0.0.1:27017/showmanager'
app.use(express.urlencoded({ extended: true }));

main().catch(err => console.log(err));


async function main() {
  await mongoose.connect(dburl);
  console.log("Database connected")

}
const db=mongoose.connection;






// app.engine('ejs',ejsMate)
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));
app.set('view engine','ejs')
app.engine('ejs',ejsMate)
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
  replaceWith: '_'
}))

// app.use(express.static(path.join(__dirname, 'public')))
const sessionConfig = {
  
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req, res, next) => {
  console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})







app.get('/',(req,res)=>{
    // res.send('hello');
    res.render('home');
})



app.get('/newuser',async(req,res)=>{
// const user1=new Userinfo({
//   Name:"Ritesh",
// // showid:[{idno:'54545478454'}]
// })
// user1.save();
// res.send(user1);
// res.render('shows/newuser')
res.render('users/register');
})


app.get('/login', (req, res) => {
  res.render('users/login');
})
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
   
 
  const hr= await Userinfo.findOne({"author":req.user._id})
  if(hr!=null){
   req.flash('success', 'Welcome back!!! ')
   const redirectUrl=req.session.returnTo||`/userinfo/${hr.id}`
   res.redirect(redirectUrl);

  }
  else{
 req.flash('success', 'enter your information ')
   // console.log('i did not have author')
   const redirectUrl='/newuserinfo';
     res.redirect(redirectUrl);
  }

})

app.get('/newuserinfo',(req,res)=>{  
  res.render('shows/newuser');
})
app.post('/register', catchAsync(async (req, res, next) => {
  try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err => {
          if (err) return next(err);
          req.flash('success', 'Account created !!!');
          res.redirect('/login');
      })
  } catch (e) {
      req.flash('error', e.message);
      res.redirect('register');
  }
}));


app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return res.status(500).json({ message: "Error during logout." }); }
    req.flash('success', "Goodbye!");
    res.redirect('/');
  });
 
})

app.post('/userinfo', isLoggedIn, catchAsync(async (req, res, next) => {
  const hr = new Userinfo(req.body.sr);
    // console.log(hr);
    hr.author = req.user._id;
    await hr.save();
    // req.flash('success', 'Welcome! Your account is created');
    res.redirect(`/userinfo/${hr._id}`)
  }))




app.get('/userinfo/:id', isLoggedIn,isAuthor,catchAsync(async(req,res)=>{
  const {id}=req.params;
  const sr=await Userinfo.findById(id);
//   var idd={idno:'565989623265'};
//   console.log(req.params.id)

// await  Userinfo.findOneAndUpdate(
//     { _id: req.params.id }, 
//     { $push: { showid: idd  } },
//  );
 
req.flash('success', 'Welcome back!!! ')
  res.render('./shows/showuser',{sr})
}))




app.get('/userinfo/:id/editp',isLoggedIn,isAuthor,catchAsync(async (req,res)=>{
  const {id}=req.params;
  const sr=await Userinfo.findById(id);
  res.render('./shows/editp',{sr})
}))





app.get('/delete/wishlist/:showid',isLoggedIn,catchAsync(async (req,res)=>{

  const {showid}=req.params;
  // console.log(showid)
  var idd={idno:showid};
  const hr= await Userinfo.findOne({"author":req.user._id})
  if(hr!=null){
   
    const sr=await Userinfo.findById(hr.id);
    await  Userinfo.findOneAndUpdate(
      { _id: hr.id }, 
      { $pull: { showid: idd  } },
    );
    res.redirect(`/userinfo/${sr._id}`)
    console.log(hr)
  }

else{
  res.redirect('/');
}

// res.send('sfsfd')
}))





app.put('/userinfo/:id',isLoggedIn,isAuthor, catchAsync(async(req, res) => {
  const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     req.flash('error', 'this user does not exists');
//     return res.redirect('/');
   
//   }

// const hrr=await Userinfo.findById(id);
// if (!hrr) {
//   req.flash('error', 'this user does not exists');
//   return res.redirect('/');
// }
// console.log({ ...req.body.sr });
   const sr = await Userinfo.findByIdAndUpdate(id, { ...req.body.sr });
  res.redirect(`/userinfo/${sr._id}`);
  
}));





app.get('/userinfo/add/:showid',isLoggedIn,catchAsync(async(req,res)=>{




  const{showid}=req.params;
  var idd={idno:showid};

  const hr= await Userinfo.findOne({"author":req.user._id})
  if(hr!=null){
  //  req.flash('success', 'Welcome back!!! ')
  //  const redirectUrl=`/userinfo/${hr.id}`
  //  res.redirect(redirectUrl);
// const id=hr.id;
const arr=hr.showid;
console.log(arr);
for(show of arr){
  // console.log(show.idno)
  if(show.idno==showid){
    // console.log('its present already')
    req.flash('success', 'you already added to your watchlist ')
    res.redirect(`/showinfo/${showid}`)
    
  }
}
const sr=await Userinfo.findById(hr.id);
await  Userinfo.findOneAndUpdate(
  { _id: hr.id }, 
  { $push: { showid: idd  } },
);
// res.send('sfdsf')
// res.render('./shows/showuser',{sr})
res.redirect(`/userinfo/${sr._id}`)
  }
  else{
//  req.flash('success', 'enter your information ')
//    // console.log('i did not have author')
//    const redirectUrl='/newuserinfo';
//      res.redirect(redirectUrl);
res.redirect('/')
  }
// const {id,showid}=req.params;
// console.log(showid)
// var idd={idno:showid};
// const sr=await Userinfo.findById(id);
// await  Userinfo.findOneAndUpdate(
//   { _id: req.params.id }, 
//   { $push: { showid: idd  } },
// );
// // res.send('sfdsf')
// // res.render('./shows/showuser',{sr})
// res.redirect(`/userinfo/${sr._id}`)

}))





app.get('/showinfo/:id',catchAsync((req,res)=>{  
    const {id}=req.params;
    // console.log(id)
    // const rest= axios.get(` https://api.tvmaze.com/shows/${id}`)
    // console.log(res)
    
    res.render('shows/show',{id});
  }))

app.get('/getprofile',(async(req,res)=>{
  const sr= await Userinfo.findOne({"author":req.user._id})

  res.redirect(`/userinfo/${sr._id}`)

}))


  app.get('/seasons/:id/episodes',catchAsync((req,res)=>{

    const {id}=req.params;
    res.render('shows/episodes',{id})
  }))




  app.get('/people/:id',catchAsync((req,res)=>{
    const {id}=req.params;
    res.render('shows/person',{id})
  }))

  app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
  })
  

  app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', { err })
  
  })

app.listen(8000,()=>{
    console.log('port 8k open')
})