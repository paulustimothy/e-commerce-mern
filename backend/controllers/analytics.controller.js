import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();
        
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailySales = await getDailySales(startDate, endDate);

        res.status(200).json({
            analyticsData,
            dailySales,
        })

    } catch (error) {
        console.error("Error fetching analytics data:", error);
        res.status(500).json({message: "Error fetching analytics data"});
    }
}

async function getAnalyticsData(){
    const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: {$sum:1},
                    totalRevenue: {$sum: "$totalAmount"},
                }
            }
        ])

        const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0};

        return {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue,
        }
}

async function getDailySales(startDate, endDate){
    try {
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
                        // $gte: greater than or equal to
						$gte: startDate,
                        // $lte: less than or equal to
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
            // sort by date in ascending order
			{ $sort: { _id: 1 } },
		]);

		// example of dailySalesData
		// [
		// 	{
		// 		_id: "2024-08-18",
		// 		sales: 12,
		// 		revenue: 1450.75
		// 	},
		// ]

		const dateArray = getDatesInRange(startDate, endDate);
		// console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

		return dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);

			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});
	} catch (error) {
		throw error;
	}
}

function getDatesInRange(startDate, endDate){
    const dates = [];
    let currentDate = new Date(startDate);

    while(currentDate <= endDate){
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}
