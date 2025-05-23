import Coupon from "../models/coupon.model.js";

export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findOne({userId: req.user._id, isActive: true});
        res.status(200).json({coupons});
    } catch (error) {
        console.log("Error getting coupons", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const validateCoupon = async (req, res) => {
    try {
        const {couponCode} = req.body;
        let coupon = await Coupon.findOne({
            code: couponCode, 
            isActive: true, 
            userId: req.user._id
        });

        if(!coupon){
            coupon = await Coupon.findOne({
                code: couponCode,
                isActive: true,
                userId: null, 
                $or: [
                    { usageLimit: null }, 
                    { usedCount: { $lt: "$usageLimit" } } //$lt means less than
                ]
            });
        }

        if(!coupon){
            return res.status(404).json({message: "Coupon not found"});
        }

        if(coupon.expirationDate < new Date()){
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({message: "Coupon expired"});
        }

        res.status(200).json({
            message: "Coupon validated",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
        });
    } catch (error) {
        console.log("Error validating coupon", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}
