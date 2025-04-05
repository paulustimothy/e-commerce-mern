import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const {products, couponCode} = req.body;

        //  if products is not an array or empty, return an error
        if(!Array.isArray(products) || products.length === 0){
            return res.status(400).json({message: "Invalid or empty products array"});
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // Convert to cents
            totalAmount += amount;

            // return to stripe
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount,
                }
            }
        })

        let coupon = null;
        if(couponCode){
            coupon = await Coupon.findOne({code: couponCode, isActive: true, userId: req.user._id});
            if(coupon){
                totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100); //in cents
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card", "paypal", "amazon_pay"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/purchase-cancel?session_id={CHECKOUT_SESSION_ID}`,
            discounts: coupon 
            ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                }
            ] 
            : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(products.map((product) => ({
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                }))),
            }
        })

        if(totalAmount >= 20000){
            await createNewCoupon(req.user._id);
        }

        res.status(200).json({id: session.id, totalAmount: totalAmount / 100});

    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({message: "Error creating checkout session"});
    }
}

export const checkoutSuccess = async (req, res) => {
    try {
        const {sessionId} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if(session.payment_status === "paid"){
            if(session.metadata.couponCode){
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode, userId: session.metadata.userId
                }, {
                    isActive: false,
                })
            }
        }

        //create a new order
        const products = JSON.parse(session.metadata.products);
        const newOrder = new Order({
            user: session.metadata.userId,
            products: products.map((product) => ({
                productId: product.id,
                price: product.price,
                quantity: product.quantity,
            })),
            totalAmount: session.amount_total / 100,
            stripeSessionId: sessionId,            
        })

        await newOrder.save();

        res.status(200).json({
            success: true,
            message: "Payment successful, order created, and coupon applied if applicable",
            orderId: newOrder._id,
        })

    } catch (error) {
        console.error("Error processing checkout success:", error);
        res.status(500).json({
            success: false,
            message: "Error processing checkout success",
        })
    }
}

async function createStripeCoupon(discountPercentage){
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })

    return coupon.id;
}

async function createNewCoupon(userId){
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: userId,
    })

    await newCoupon.save();
    return newCoupon;
}

