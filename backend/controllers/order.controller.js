import Order from "../models/order.model.js";

export const getAllUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({user: req.user._id})
        // populate is for getting the product details
        .populate({
            path: 'products.product',
            select: 'name image' // select the fields we want to display
        })
        .sort({createdAt: -1}); // newest orders

        const formattedOrder = orders.map(order => ({
            _id: order._id,
            createdAt: order.createdAt,
            totalAmount: order.totalAmount,
            products: order.products.map(item => ({
                _id: item._id,
                name: item.product.name,
                image: item.product.image,
                price: item.price,
                quantity: item.quantity
            }))
        }));

        res.status(200).json({orders: formattedOrder});
        
    } catch (error) {
        console.log("Error getting all user orders", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const getUserOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user._id,
        })
        .populate({
            path: 'products.product',
            select: 'name image'
        }).
        populate({
            path: 'coupon',
            select: 'code discountPercentage'
        })

        if(!order) {
            return res.status(404).json({message: "Order not found"});
        }

        const formattedOrder = {
            _id: order._id,
            createdAt: order.createdAt,
            totalAmount: order.totalAmount,
            products: order.products.map(item => ({
                _id: item._id,
                name: item.product.name,
                image: item.product.image,
                price: item.price,
                quantity: item.quantity
            })),
            coupon: order.coupon ? {
                code: order.coupon.code,
                discountPercentage: order.coupon.discountPercentage
            } : null
        };

        res.status(200).json({order: formattedOrder});

    } catch (error) {
        console.log("Error getting user order by id", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}
