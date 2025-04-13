import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		stripeSessionId: {
			type: String,
			unique: true,
			sparse: true,
		},
		midtransOrderId: {
			type: String,
			unique: true,
			sparse: true,
		},
		coupon: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Coupon",
		},
	},
	{ timestamps: true }
);

// Create a unique index on stripeSessionId to prevent duplicates
orderSchema.index({stripeSessionId: 1}, {unique: true});
orderSchema.index({midtransOrderId: 1}, {unique: true});

const Order = mongoose.model("Order", orderSchema);

export default Order;