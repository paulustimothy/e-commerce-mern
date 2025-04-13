import Product from "../models/product.model.js";

export const getAllCartItems = async (req, res) => {
    try {
        const productIds = req.user.cartItems.map(item => item.product);
        
        const products = await Product.find({ _id: { $in: productIds } });

        const cartItems = products.map(product => {
            const cartItem = req.user.cartItems.find(
                item => item.product.toString() === product._id.toString()
            );
            return {
                ...product.toJSON(),
                quantity: cartItem ? cartItem.quantity : 1
            };
        });

        res.status(200).json({ cartItems });
    } catch (error) {
        console.error("Error getting cart items:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Find if product already in cart
        const existingItemIndex = user.cartItems.findIndex(
            item => item.product.toString() === productId
        );

        // -1 means not found
        if (existingItemIndex > -1) {
            // Increment quantity if already in cart
            user.cartItems[existingItemIndex].quantity += 1;
        } else {
            user.cartItems.push({
                product: productId,
                quantity: 1
            });
        }
        
        await user.save();
        res.status(200).json(user.cartItems);
    } catch (error) {
        console.error("Error adding to cart:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const clearCart = async (req, res) => {
    try {
        const user = req.user;

        if(!req.body.productId){
            user.cartItems = [];
        }else{
            user.cartItems = user.cartItems.filter((item) => item.id !== req.body.productId);
        }

        await user.save();
        res.status(200).json(user.cartItems);
    } catch (error) {
        console.log("Error clearing cart", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const updateCartItem = async (req, res) => {
    try {
        const {id:productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;


        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem){
            if(quantity <= 0){
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();
                res.status(200).json(user.cartItems);
            }

            existingItem.quantity = quantity;
            await user.save();
            res.status(200).json(user.cartItems);
        }else{
            res.status(404).json({message: "Item not found in cart"});
        }
    } catch (error) {
        console.log("Error updating cart item", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}


