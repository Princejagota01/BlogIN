const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config();
const userRoutes = require('./routes/user.routes.js')
const authRoutes = require('./routes/auth.route.js')
const postRoutes = require('./routes/post.route.js')
const commentRoutes = require('./routes/comment.route.js')
const cookieParser = require('cookie-parser')
const path = require('path')

mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log('DB connected successfully')
})
.catch((err)=>{
    console.log(err);
})

const __drname = path.resolve();

const app = express();

app.use(express.json())
app.use(cookieParser())

app.listen(3000,()=>{
    console.log('Serer started at port ',3000)
})

app.use('/api/user',userRoutes)
app.use('/api/auth',authRoutes)
app.use('/api/post',postRoutes)
app.use('/api/comment',commentRoutes);

app.use(express.static(path.join(__drname, '/frontend/dist')));

app.get('*', (req,res)=>{
    res.sendFile(path.join(__drname, 'frontend', 'dist','index.html'));
})
