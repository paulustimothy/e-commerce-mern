import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js";

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

    const user = await User.create({email, name, password});

    //authenticate user
    const {accessToken, refreshToken} = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);
    
    res.status(201).json({message: "User created successfully", user});

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internal server error", error: error.message});
    }
}

export const login = async (req, res) => {
    try {
        const {email, password, name} = req.body;
        const user = await User.findOne({
            $or: [{email}, {name}]
        });

        if(user && (await user.comparePassword(password))){
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
