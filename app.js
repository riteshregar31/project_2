const express=require('express');
const app=express();
const path=require('path')








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
app.listen(8000,()=>{
    console.log('port 8k open')
})