const express = require("express");
const {shortenUrl,redirectUrl,getUrlStats,getMyUrls} = require("../controllers/urlController.js");
const router = express.Router();
const shortenListener = require("../middleware/rateLimiter.js");
const authMiddleware = require("../middleware/authMiddleware.js");

router.post("/shorten",authMiddleware, shortenListener, shortenUrl);

router.get("/my-urls", authMiddleware, getMyUrls);   
router.get("/stats/:code", getUrlStats);             

router.get("/:code", redirectUrl);                  
module.exports = router;