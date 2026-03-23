const rateLimit = require("express-rate-limit");
const shortenLimiter = rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:{
        message:"Too manny Requests,Please Try again later"
    },
    standardHeaders:true,
    legacyHeaders:false
});
module.exports = shortenLimiter;