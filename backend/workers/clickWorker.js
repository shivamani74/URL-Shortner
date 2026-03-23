const mongoose = require("mongoose");
const clickQueue = require("../queues/clickQueue");
const Url = require("../models/Url");

mongoose.connect("mongodb+srv://shivamaniboina_db_user:iCFDU9G9U9LMS46o@cluster0.1p2ctiw.mongodb.net/?appName=Cluster0")
.then(() => {
    console.log("Worker MongoDB Connected");
})
.catch((err) => {
    console.log("MongoDB connection error:", err);
});

clickQueue.process(async (job) => {


    const { shortCode } = job.data;

    await Url.updateOne(
        { shortCode },
        { $inc: { clicks: 1 } }
    );


});

