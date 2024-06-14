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
const secret = process.env.SECRET || 'thisdfdssdfdsfdstet!';
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
res.render('shows/newuser')
})



app.post('/userinfo', catchAsync(async (req, res, next) => {
  const hr = new Userinfo(req.body.sr);
    // console.log(hr);
    await hr.save();
    // req.flash('success', 'Welcome! Your account is created');
    res.redirect(`/userinfo/${hr._id}`)
  }))




app.get('/userinfo/:id',catchAsync(async(req,res)=>{
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




app.get('/userinfo/:id/editp',catchAsync(async (req,res)=>{
  const {id}=req.params;
  const sr=await Userinfo.findById(id);
  res.render('./shows/editp',{sr})
}))





app.get('/delete/wishlist/:id/:showid',catchAsync(async (req,res)=>{
  const {id,showid}=req.params;
  var idd={idno:showid};
const sr=await Userinfo.findById(id);
await  Userinfo.findOneAndUpdate(
  { _id: req.params.id }, 
  { $pull: { showid: idd  } },
);
res.send('sfsfd')
}))





app.put('/userinfo/:id', catchAsync(async(req, res) => {
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





app.get('/userinfo/:id/add/:showid',catchAsync(async(req,res)=>{
const {id,showid}=req.params;
console.log(showid)
var idd={idno:showid};
const sr=await Userinfo.findById(id);
await  Userinfo.findOneAndUpdate(
  { _id: req.params.id }, 
  { $push: { showid: idd  } },
);
// res.send('sfdsf')
// res.render('./shows/showuser',{sr})
res.redirect(`/userinfo/${sr._id}`)

}))





app.get('/showinfo/:id',catchAsync((req,res)=>{  
    const {id}=req.params;
    // console.log(id)
    // const rest= axios.get(` https://api.tvmaze.com/shows/${id}`)
    // console.log(res)
    
    res.render('shows/show',{id});
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