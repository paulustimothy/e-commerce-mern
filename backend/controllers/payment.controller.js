import { stripe } from "../lib/stripe.js";
import { sendOrderConfirmationEmail } from "../lib/emailService.js";
import snap from "../lib/midtrans.js";

import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";


export const createCheckoutSession = async (req, res) => {
    try {
        const {products, couponCode, paymentMethod = "stripe"} = req.body;

        // Validate products
        if(!Array.isArray(products) || products.length === 0){
            return res.status(400).json({message: "Invalid or empty products array"});
        }

        let totalAmount = 0;

        // Calculate total amount and prepare items for both payment gateways
        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // Convert to cents for Stripe
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1,
            }
        });

        // Check for coupon and apply discount
        let coupon = null;
        if(couponCode){
            coupon = await Coupon.findOne({code: couponCode, isActive: true, userId: req.user._id});
            if(coupon){
                totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
            }
        }

        // Common metadata for both payment methods
        const metadata = {
            userId: req.user._id.toString(),
            couponCode: couponCode || "",
            products: JSON.stringify(products.map((product) => ({
                id: product._id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
            }))),
        };

        // STRIPE PAYMENT HANDLING
        if (paymentMethod === "stripe") {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: lineItems,
                mode: "payment",
                success_url: `${process.env.FRONTEND_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/purchase-cancel?session_id={CHECKOUT_SESSION_ID}`,
                discounts: coupon 
                    ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }] 
                    : [],
                metadata
            });

            if(totalAmount >= 20000){
                await createNewCoupon(req.user._id);
            }

            return res.status(200).json({
                id: session.id, 
                totalAmount: totalAmount / 100,
                paymentMethod: "stripe"
            });
        }
        
        // MIDTRANS PAYMENT HANDLING
        if (paymentMethod === "midtrans") {
            const midtransOrderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            
            // Prepare items for Midtrans (no conversion needed)
            const itemDetails = products.map(item => ({
                id: item._id.toString(),
                name: item.name,
                price: Math.round(item.price),
                quantity: item.quantity
            }));
            
            // Add discount as a line item if applicable
            const midtransTotal = products.reduce((sum, item) => 
                sum + (Math.round(item.price) * item.quantity), 0);
            
            let finalAmount = midtransTotal;
            if (coupon) {
                const discountAmount = Math.round((midtransTotal * coupon.discountPercentage) / 100);
                finalAmount -= discountAmount;
                
                // Add negative item for the discount
                itemDetails.push({
                    id: 'discount',
                    name: `Coupon Discount (${coupon.discountPercentage}%)`,
                    price: -discountAmount,
                    quantity: 1
                });
            }

            // Create Midtrans transaction
            const transaction = await snap.createTransaction({
                transaction_details: {
                    order_id: midtransOrderId,
                    gross_amount: finalAmount
                },
                credit_card: {
                    secure: true
                },
                customer_details: {
                    first_name: req.user.name,
                    email: req.user.email
                },
                item_details: itemDetails,
                callbacks: {
                    finish: `${process.env.FRONTEND_URL}/purchase-success?midtrans_order_id=${midtransOrderId}`,
                    error: `${process.env.FRONTEND_URL}/purchase-cancel`
                },
                metadata
            });

            if(totalAmount >= 20000){
                await createNewCoupon(req.user._id);
            }

            return res.status(200).json({
                token: transaction.token,
                orderId: midtransOrderId,
                totalAmount: finalAmount,
                paymentMethod: "midtrans"
            });
        }

        return res.status(400).json({message: "Invalid payment method"});

    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({message: "Error creating checkout session"});
    }
}

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId, midtransOrderId } = req.body;

        // Check for existing order first
        let existingOrder;
        if (sessionId) {
            existingOrder = await Order.findOne({ stripeSessionId: sessionId });
        } else if (midtransOrderId) {
            existingOrder = await Order.findOne({ midtransOrderId });
        }

        if (existingOrder) {
            return res.status(200).json({
                success: true,
                message: "Order already processed",
                orderId: existingOrder._id,
                status: existingOrder.status,
                alreadyExists: true
            });
        }

        // Handle Stripe payment
        if (sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            
            if (!session) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid session ID"
                });
            }

            if (session.payment_status === "paid") {
                const couponCode = session.metadata.couponCode;

                if (couponCode) {
                    const coupon = await Coupon.findOne({ code: couponCode });
                    if (coupon) {
                        if (coupon.userId) {
                            // User-specific coupon
                            await Coupon.findOneAndUpdate(
                                { code: couponCode, userId: session.metadata.userId },
                                { isActive: false }
                            );
                        } else {
                            // Global coupon
                            await Coupon.findOneAndUpdate(
                                { code: couponCode, userId: null },
                                { $inc: { usedCount: 1 } }
                            );
                            
                            if (coupon.usageLimit !== null && coupon.usedCount + 1 >= coupon.usageLimit) {
                                await Coupon.findOneAndUpdate(
                                    { code: couponCode },
                                    { isActive: false }
                                );
                            }
                        }
                    }
                }

                // Create Stripe order
                const products = JSON.parse(session.metadata.products);
                const newOrder = new Order({
                    user: session.metadata.userId,
                    products: products.map((product) => ({
                        product: product.id,
                        price: product.price,
                        quantity: product.quantity,
                    })),
                    totalAmount: session.amount_total / 100,
                    stripeSessionId: sessionId,
                    coupon: session.metadata.couponCode ? 
                        await Coupon.findOne({
                            code: session.metadata.couponCode,
                            userId: session.metadata.userId
                        }) : null
                });

                await newOrder.save();

                // Send confirmation email
                const user = await User.findById(session.metadata.userId);
                if (user) {
                    try {
                        await sendOrderConfirmationEmail(newOrder, user.email);
                    } catch (emailError) {
                        console.error("Error sending confirmation email:", emailError);
                    }
                }

                return res.status(200).json({
                    success: true,
                    message: "Payment successful and order created",
                    orderId: newOrder._id,
                    alreadyExists: false
                });
            }
        }

        // Handle Midtrans payment
        if (midtransOrderId) {
            try {
                const transaction = await snap.transaction.status(midtransOrderId);
                
                if (!transaction) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid transaction ID"
                    });
                }

                // Only create order if payment is successful
                if (transaction.transaction_status === 'settlement' || 
                    (transaction.transaction_status === 'capture' && transaction.fraud_status === 'accept')) {
                    
                    const { userId, products: productsJson, couponCode } = transaction.metadata;
                    const parsedProducts = JSON.parse(productsJson);

                    // Deactivate coupon if used
                    if (couponCode) {
                        await Coupon.findOneAndUpdate(
                            { code: couponCode, userId },
                            { isActive: false }
                        );
                    }

                    // Create new order
                    const newOrder = new Order({
                        user: userId,
                        products: parsedProducts.map(product => ({
                            product: product.id,
                            price: product.price,
                            quantity: product.quantity
                        })),
                        totalAmount: transaction.gross_amount,
                        midtransOrderId,
                        coupon: couponCode ? 
                            await Coupon.findOne({ code: couponCode }) : null
                    });

                    await newOrder.save();

                    // Send confirmation email
                    const user = await User.findById(userId);
                    if (user) {
                        try {
                            await sendOrderConfirmationEmail(newOrder, user.email);
                        } catch (emailError) {
                            console.error("Error sending confirmation email:", emailError);
                        }
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Payment successful and order created",
                        orderId: newOrder._id,
                        alreadyExists: false
                    });
                }

                // Return current transaction status if payment is not completed
                return res.status(200).json({
                    success: true,
                    message: "Payment is " + transaction.transaction_status,
                    status: transaction.transaction_status,
                    alreadyExists: false
                });
                
            } catch (error) {
                console.error("Error checking Midtrans transaction:", error);
                return res.status(400).json({
                    success: false,
                    message: "Error checking transaction status"
                });
            }
        }

        return res.status(400).json({
            success: false,
            message: "Missing session ID or transaction ID"
        });

    } catch (error) {
        console.error("Error processing checkout success:", error);
        res.status(500).json({
            success: false,
            message: "Error processing checkout success",
            error: error.message
        });
    }
};

export const handleMidtransNotification = async (req, res) => {
    try {
        const notification = await snap.transaction.notification(req.body);

        // Extract notification data
        const {
            order_id: midtransOrderId,
            transaction_status: transactionStatus,
            fraud_status: fraudStatus,
            metadata
        } = notification;

        let order = await Order.findOne({ midtransOrderId });
        
        // If order doesn't exist and transaction is completed, create new order
        if (!order && (transactionStatus === 'settlement' || 
                      (transactionStatus === 'capture' && fraudStatus === 'accept'))) {
            
            const { userId, products, couponCode } = metadata;
            const parsedProducts = JSON.parse(products);
            
            // Create new order with completed status
            order = new Order({
                user: userId,
                products: parsedProducts.map(product => ({
                    product: product.id,
                    price: product.price,
                    quantity: product.quantity
                })),
                totalAmount: notification.gross_amount,
                midtransOrderId,
                coupon: couponCode ? await Coupon.findOne({ code: couponCode }) : null
            });

            await order.save();
            
            // Deactivate coupon if used
            if (couponCode) {
                await Coupon.findOneAndUpdate(
                    { code: couponCode, userId },
                    { isActive: false }
                );
            }

            // Send confirmation email
            const user = await User.findById(userId);
            if (user) {
                try {
                    await sendOrderConfirmationEmail(order, user.email);
                } catch (emailError) {
                    console.error("Error sending confirmation email:", emailError);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Notification processed",
            orderId: order?._id,
        });

    } catch (error) {
        console.error('Notification Error:', error);
        res.status(500).json({
            success: false,
            message: "Error processing notification",
            error: error.message
        });
    }
};

async function createStripeCoupon(discountPercentage){
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })

    return coupon.id;
}

async function createNewCoupon(userId){
    await Coupon.findOneAndDelete({userId});

    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: userId,
    })

    await newCoupon.save();
    return newCoupon;
}



