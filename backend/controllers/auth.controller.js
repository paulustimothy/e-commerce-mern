import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js";
import {sendVerificationEmail} from "../lib/emailService.js";
import crypto from "crypto";

// generate access and refresh tokens
const generateToken = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    
    return {accessToken, refreshToken};
}

// store refresh token in redis
const storeRefreshToken = async(userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7*24*60*60)
}

// set cookies in response
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //prevents client side JS from accessing the cookie
        secure: process.env.NODE_ENV === "production", //only send the cookie over HTTPS in production
        sameSite: "strict", //prevents client side JS from accessing the cookie on different sites
        maxAge: 15 * 60 * 1000, //15 minutes
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
}

export const signup = async (req, res) => {
    const {email, name, password} = req.body;
    
    try {
        const userExists = await User.findOne({email});

    if(userExists){
        return res.status(400).json({message: "User already exists"});
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
        email, 
        name, 
        password,
        verificationToken,
        verificationTokenExpires,
        isVerified: false,
    });

    await sendVerificationEmail(user, verificationToken);
    
    res.status(201).json({
        message: "User created successfully, please verify your email",
        userId: user._id,
    });

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: error.message});
    }
}

export const login = async (req, res) => {
    try {
        const {email, password, name} = req.body;
        const user = await User.findOne({
            $or: [{email}, {name}]
        });

        if(user && (await user.comparePassword(password))){

            if(!user.isVerified){
                return res.status(403).json({
                    message: "Please verify your email address to login",
                    needsVerification: true,
                    userId: user._id
                });
            }

            const {accessToken, refreshToken} = generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.status(200).json({message: "Logged in successfully", user});
        } else {
            return res.status(400).json({message: "Invalid credentials"});
        }

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}

// this will recreate the access token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(401).json({message: "No refresh token found"});
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

        if(storedToken !== refreshToken){
            return res.status(401).json({message: "Invalid refresh token"});
        }

        const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        })

        res.status(200).json({message: "Access token refreshed successfully"});
        
    } catch (error) {
        console.log("Error in refresh token controller", error.message);
        res.status(500).json({message: "Internal server error", error: error.message});

    }
}

export const getUserProfile = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in get user profile controller", error.message);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { token, userId } = req.body;
        
        const user = await User.findOne({
            _id: userId,
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        
        await user.save();
        
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);
        
        res.status(200).json({ message: "Email verified successfully", user });
    } catch (error) {
        console.log("Error in verifyEmail controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const resendVerification = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }
        
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        
        await user.save();
        
        await sendVerificationEmail(user, verificationToken);
        
        res.status(200).json({ message: "Verification email resent successfully" });
    } catch (error) {
        console.log("Error in resendVerification controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
