const express = require('express')
const path = require('path')
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const campground = require('./models/campground');
const app = express();
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.json())
app.use(express.static('src'))

mongoose.connect('mongodb://localhost:27017/campgrounds', {
  
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.get('/', (req, res)=>{
    res.render('home')
})
app.get('/campgrounds', async(req, res)=>{
    const camp = await campground.find({});
    res.render('index', {camp})
})



app.get('/campgrounds/new', (req, res)=>{
    res.render('new')
})

app.get('/campgrounds/:id', async(req, res)=>{
    const {id} = req.params;
    const foundCamp = await campground.findById(id);
    res.render('show', {foundCamp})
})
app.post('/campgrounds', async(req, res)=>{
    const {camp} = req.body
    const newCamp = new campground({title: camp.title, location: camp.location})
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp.id}`)
})

app.get('/campgrounds/:id/edit', async(req, res)=>{
    const {id} = req.params
    const foundCamp = await campground.findById(id)
    res.render('edit', {foundCamp});
})

app.patch('/campgrounds/:id/edit', async(req, res)=>{
    const {id} = req.params
    const {camp} = req.body;
    console.log(camp, id)
    const update = await campground.findByIdAndUpdate(id, {title: camp.title, location: camp.location}, {new: true});
    console.log(update);
    res.redirect(`/campgrounds/${update._id}`)
});

app.delete('/campgrounds/:id/delete', async(req, res)=>{
    const {id} = req.params
    await campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})

app.listen('3000', ()=>{
    console.log('Listening on port 3000')
})

