const mongoose = require("mongoose");
const clickQueue = require("../queues/clickQueue");
const Url = require("../models/Url");

mongoose.connect(process.env.MONGO_DB_URI)
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

