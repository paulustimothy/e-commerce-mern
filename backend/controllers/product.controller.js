import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({products});
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);   
        res.status(500).json({message: "Internal server error"});
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if(featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts));
        }

        // if not in the redis, fetch from the database
        // .lean is used to return plain javascript objects instead of mongoose documents
        // which is faster and easier to work with
        featuredProducts = await Product.find({isFeatured: true}).lean();

        if(!featuredProducts){  
            return res.status(404).json({message: "No featured products found"});
        }

        // store in redis for future quick access
        await redis.set("featured_products", JSON.stringify(featuredProducts));

        res.status(200).json(featuredProducts);

    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const createProduct = async (req, res) => {
    try {
        const {name, description, price, image, category} = req.body;

        let cloudinaryImage = null;

        if(image){
            cloudinaryImage = await cloudinary.uploader.upload(image, {folder: "products"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryImage.secure_url ? cloudinaryImage.secure_url : "",
            category,
        })

        res.status(201).json(product);
        
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params;

        const product = await Product.findById(id);

        if(!product){
            return res.status(404).json({message: "Product not found"});
        }

        if(product.image){
            // delete the image from cloudinary
            const publicId = product.image.split("/").pop().split(".")[0]; 
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
            } catch (error) {
                console.log("Error in deleting product image from cloudinary", error.message);
            }
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({message: "Product deleted successfully"});

    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const getRecommendations = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: {size: 3}
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    price: 1,
                    description: 1,
                }
            }
        ])

        res.status(200).json({products});
    } catch (error) {
        console.log("Error in getRecommendations controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const getProductsByCategory = async (req, res) => {
    const {category} = req.params;

    try {
        const products = await Product.find({category});

        if(!products){
            return res.status(404).json({message: "No products found"});
        }

        res.status(200).json({products});
        
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    const {id} = req.params;

    try {
        const product = await Product.findById(id);

        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.status(200).json(updatedProduct);
        }else{
            return res.status(404).json({message: "Product not found"});
        }
        
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

async function updateFeaturedProductsCache() {
    try {
        const featuredProducts = await Product.find({isFeatured: true}).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in updateFeaturedProductsCache", error.message);
    }
}
