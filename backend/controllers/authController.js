const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateOTP = require("../utils/otpGenerator");
const { default: sendEmail } = require("../config/mailer");

const JWT_SECRET = process.env.JWT_SECRET;

let otpStore = {};

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();

    otpStore[email] = {
      otp,
      password: hashedPassword,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await sendEmail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ message: "Error Sending OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({
        message: "No OTP Found",
      });
    }

    if (record.expires < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (record.otp != otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const user = new User({
      email,
      password: record.password,
    });

    await user.save();

    delete otpStore[email];

    return res.status(200).json({
      message: "User Registered Successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error verifying OTP",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        id: user._id,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
    });
  }
};