const mongoose  = require("mongoose");
const UrlSchema = new mongoose.Schema({
    shortCode:{
        type:String,
        required:true,
        unique:true
    },
    originalUrl:{
        type:String,
        require:true
    },
    urlHash:{
        type:String,
        unique:true
    },
    clicks:{
        type:Number,    
        default:0
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});
module.exports = mongoose.model("Url",UrlSchema);   