const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

// Analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    // Check cache first
    const cachedData = cache.get('dashboardAnalytics');
    if (cachedData) {
      return res.json(cachedData);
    }

    const db = require('../config/db').getDB();

    // Get all data in parallel
    const [
      activeUsers,
      totalProducts,
      totalRevenueData,
      monthlySalesData,
      inventoryMetrics,
      customerSegment
    ] = await Promise.all([
      
      // Active users
      db.collection("users").countDocuments(),

      // Total products
      db.collection("products").countDocuments(),

      // Total revenue and orders
      db.collection('orders').aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 }
          }
        }
      ]).toArray(),

      // Monthly sales data
      db.collection('orders').aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$orderDate" },
              month: { $month: "$orderDate" }
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            revenue: 1,
            orders: 1
          }
        },
        {
          $sort: { year: 1, month: 1 }
        }
      ]).toArray(),

      // Inventory metrics
      db.collection('products').aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$stock" },
            averageStock: { $avg: "$stock" },
            lowStock: {
              $sum: {
                $cond: [{ $lt: ["$stock", 10] }, 1, 0]
              }
            },
            outOfStock: {
              $sum: {
                $cond: [{ $eq: ["$stock", 0] }, 1, 0]
              }
            }
          }
        }
      ]).toArray(),

      // Customer segments
      db.collection('orders').aggregate([
        {
          $group: {
            _id: "$userId",
            totalSpent: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: "$totalAmount" },
            lastOrderDate: { $max: "$orderDate" }
          }
        },
        {
          $addFields: {
            daysSinceLastOrder: {
              $divide: [
                { $subtract: [new Date(), "$lastOrderDate"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $addFields: {
            segment: {
              $switch: {
                branches: [
                  {
                    case: { $lt: ["$daysSinceLastOrder", 500] },
                    then: "Regular"
                  }
                ],
                default: "At Risk"
              }
            }
          }
        }
      ]).toArray()
    ]);

    // Build response
    const totalOrders = totalRevenueData[0]?.totalOrders || 0;
    const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;

    const analyticsData = {
      activeUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlySalesData,
      inventoryMetrics: inventoryMetrics[0],
      customerSegment: {
        totalCustomers: customerSegment.length,
        averageOrderValueFromAll: 
          customerSegment.reduce((acc, curr) => acc + curr.averageOrderValue, 0) / 
          customerSegment.length || 0,
      },
      conversionRate: totalOrders && activeUsers 
        ? (totalOrders / activeUsers) * 100 
        : "0.00",
    };

    // Cache the data
    cache.set('dashboardAnalytics', analyticsData, 300);
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

module.exports = router;