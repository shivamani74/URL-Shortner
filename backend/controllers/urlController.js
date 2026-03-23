const Url = require("../models/Url");
const encode = require("../utils/base62");
const mongoose = require("mongoose");
const redisClient = require("../config/redis");
const hashUrl = require("../utils/hashUrls");
const clickQueue = require("../queues/clickQueue");

exports.shortenUrl = async (req, res) => {
  try {
    const { url, customCode } = req.body;

    const userId = req.user?.userId || req.user?.id; 

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({
        message: "Invalid URL provided"
      });
    }

    if (customCode) {

      const isValid = /^[a-zA-Z0-9]{3,10}$/.test(customCode);

      if (!isValid) {
        return res.status(400).json({
          message: "Custom code must be 3-10 characters"
        });
      }

      const exists = await Url.findOne({ shortCode: customCode });

      if (exists) {
        return res.status(400).json({
          message: "Custom code already taken"
        });
      }

      const newUrl = new Url({
        shortCode: customCode,
        originalUrl: url,
        urlHash: hashUrl(url),
        userId
      });

      await newUrl.save();

      return res.status(200).json({
        message: "Custom URL created successfully",
        shortUrl: `http://localhost:5000/${customCode}`
      });
    }


    const hashedUrl = hashUrl(url);

    const existing = await Url.findOne({
      urlHash: hashedUrl,
      userId
    });

    if (existing) {
      return res.status(200).json({
        message: "URL already exists",
        shortUrl: `http://localhost:5000/${existing.shortCode}`
      });
    }

    const objectId = new mongoose.Types.ObjectId();
    const num = parseInt(objectId.toString().slice(-8), 16);
    const shortCode = encode(num);

    const newUrl = new Url({
      _id: objectId,
      shortCode,
      urlHash: hashedUrl,
      originalUrl: url,
      userId 
    });

    await newUrl.save();

    return res.status(200).json({
      message: "URL shortened successfully",
      shortUrl: `http://localhost:5000/${shortCode}`
    });

  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    console.log("CODE:", code);

    const cachedUrl = await redisClient.get(code);

    if (cachedUrl) {
      console.log("Cache HIT");

      await clickQueue.add({
        shortCode: code,
        timestamp: Date.now()
      });

      return res.redirect(cachedUrl);
    }

    console.log("Cache MISS");

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({
        message: "URL Not Found"
      });
    }

   await redisClient.set(code, url.originalUrl, "EX", 3600);

    await clickQueue.add({
      shortCode: code,
      timestamp: Date.now()
    });

    return res.redirect(url.originalUrl);

  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getUrlStats = async (req, res) => {
  try {

    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        message: "Short code is required"
      });
    }

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).json({
        message: "No such short code exists"
      });
    }

    return res.status(200).json({
      shortCode: code,
      clicks: url.clicks,
      message: "Stats fetched successfully"
    });

  } catch (error) {

    return res.status(500).json({
      message: "Error occurred while fetching stats",
      error: error.message
    });

  }
};
exports.getMyUrls = async (req, res) => {
  const urls = await Url.find({ userId: req.user.userId });
  res.json(urls);
};
