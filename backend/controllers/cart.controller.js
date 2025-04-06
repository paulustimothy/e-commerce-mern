import Product from "../models/product.model.js";

export const getAllCartItems = async (req, res) => {
    try {
        const products = await Product.find({_id: {$in: req.user.cartItems}});

        // add quantity to product
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find(item => item.id === product.id);
            return {...product.toJSON(), quantity: item.quantity};
        })

        res.status(200).json({cartItems});

    } catch (error) {
        console.log("Error getting cart items", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push(productId);
        }
        
        await user.save();
        res.status(200).json(user.cartItems);
        
    } catch (error) {
        console.log("Error adding to cart", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const clearCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;

        if(!productId){
            user.cartItems = [];
        }else{
            user.cartItems = user.cartItems.filter((item) => item.id !== productId);
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


