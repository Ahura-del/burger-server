const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min:2
    },
    lastName:{
        type:String,
        required:true,
        min:2
    },
    phone:{
        type:String,
    },
    picture:{
        type:String,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        min:4,
        max:1024
    },
    location:{
        type:String,

    },
    verify:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('User' , userSchema)