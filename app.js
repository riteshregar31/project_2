const express=require('express');
const app=express();
const path=require('path')
const mongoose=require('mongoose');
const Userinfo=require('./models/Userinfo');
const methodOverride = require('method-override');
const { userInfo } = require('os');
app.use(methodOverride('_method'));
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
app.set('views',path.join(__dirname,'views'))
// app.use(express.static(path.join(__dirname, 'public')))


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



app.post('/userinfo', (async (req, res, next) => {
  const hr = new Userinfo(req.body.sr);
    // console.log(hr);
    await hr.save();
    // req.flash('success', 'Welcome! Your account is created');
    res.redirect(`/userinfo/${hr._id}`)
  }))




app.get('/userinfo/:id',async(req,res)=>{
  const {id}=req.params;
  const sr=await Userinfo.findById(id);
//   var idd={idno:'565989623265'};
//   console.log(req.params.id)

// await  Userinfo.findOneAndUpdate(
//     { _id: req.params.id }, 
//     { $push: { showid: idd  } },
//  );
 

  res.render('./shows/showuser',{sr})
})




app.get('/userinfo/:id/editp',async (req,res)=>{
  const {id}=req.params;
  const sr=await Userinfo.findById(id);
  res.render('./shows/editp',{sr})
})





app.get('/delete/wishlist/:id/:showid',async (req,res)=>{
  const {id,showid}=req.params;
  var idd={idno:showid};
const sr=await Userinfo.findById(id);
await  Userinfo.findOneAndUpdate(
  { _id: req.params.id }, 
  { $pull: { showid: idd  } },
);
res.send('sfsfd')
})





app.put('/userinfo/:id', async(req, res) => {
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
  
});





app.get('/userinfo/:id/add/:showid',async(req,res)=>{
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

})





app.get('/showinfo/:id',(req,res)=>{  
    const {id}=req.params;
    // console.log(id)
    // const rest= axios.get(` https://api.tvmaze.com/shows/${id}`)
    // console.log(res)
    
    res.render('shows/show',{id});
  })




  app.get('/seasons/:id/episodes',(req,res)=>{

    const {id}=req.params;
    res.render('shows/episodes',{id})
  })




  app.get('/people/:id',(req,res)=>{
    const {id}=req.params;
    res.render('shows/person',{id})
  })

  app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', { err })
  
  })

app.listen(8000,()=>{
    console.log('port 8k open')
})