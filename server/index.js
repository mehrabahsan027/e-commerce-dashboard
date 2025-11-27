const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const NodeCache = require('node-cache');
const compression = require('compression')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000

//middlewares
app.use(express.json());
app.use(compression())
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }

));

const cache = new NodeCache({ stdTTL: 300 });



//connect to database

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //create database and collections

    const db = client.db("e-commerce-dashboard");

    // indexing
    await db.collection("users").createIndex({ lastLogin: -1 })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("products").createIndex({ category: 1 })
    await db.collection("products").createIndex({ stock: 1 })
    await db.collection("orders").createIndex({ orderDate: -1 })


    //dashboard analytics endpoint

    app.get('/api/dashboard/analytics', async (req, res) => {


      try {
        const cachedAnalytics = cache.get('dashboardAnalytics');

        if (cachedAnalytics) {
          return res.json(cachedAnalytics);
        }

        const [activeUsers, totalProducts, totalRevenueData, monthlySalesData, inventoryMetrics, customerSegment] = await Promise.all([



          //active users
          db.collection("users").countDocuments(),

          //total products
          db.collection("products").countDocuments(),

          //total revenue and total orders
          db.collection('orders').aggregate(
            [
              {
                $group:
                {
                  _id: null,
                  totalRevenue: {
                    $sum: "$totalAmount"
                  },
                  totalOrders: {
                    $sum: 1
                  }
                }
              }
            ]
          ).toArray(),



          //monthly sales data
          db.collection('orders').aggregate(
            [
              {
                $group:

                {
                  _id: {
                    year: {
                      $year: "$orderDate"
                    },
                    month: {
                      $month: "$orderDate"
                    }
                  },
                  revenue: {
                    $sum: "$totalAmount"
                  },
                  orders: {
                    $sum: 1
                  }
                }
              },
              {
                $project:

                {
                  _id: 0,
                  year: "$_id.year",
                  month: "$_id.month",
                  revenue: 1,
                  orders: 1
                }
              },
              {
                $sort:

                {
                  year: 1,
                  month: 1
                }
              }
            ]
          ).toArray(),


          //inventory metrics 
          db.collection('products').aggregate([
  {
    $group:
     
      {
        _id: null,
        totalStock: {
          $sum: "$stock"
        },
        averageStock: {
          $avg: "$stock"
        },
        lowStock: {
          $sum: {
            $cond: [
              {
                $lt: ["$stock", 10]
              },
              1,
              0
            ]
          }
        },
        outOfStock: {
          $sum: {
            $cond: [
              {
                $eq: ["$stock", 0]
              },
              1,
              0
            ]
          }
        }
      }
  }
]).toArray(),


//customer segment
db.collection('orders').aggregate([
  {
    $group:
      /**
       * _id: The id of the group.
       * fieldN: The first field name.
       */
      {
        _id: "$userId",
        totalSpent: {
          $sum: "$totalAmount"
        },
        orderCount: {
          $sum: 1
        },
        averageOrderValue: {
          $avg: "$totalAmount"
        },
        lastOrderDate: {
          $max: "$orderDate"
        }
      }
  },
  {
    $addFields:
      /**
       * newField: The new field name.
       * expression: The new field expression.
       */
      {
        daysSinceLastOrder: {
          $divide: [
            {
              $subtract: [
                new Date(),
                "$lastOrderDate"
              ]
            },
            1000 * 60 * 60 * 24
          ]
        }
      }
  },
  {
    $addFields:
      /**
       * newField: The new field name.
       * expression: The new field expression.
       */
      {
        segment: {
          $switch: {
            branches: [
              {
                case: {
                  $lt: [
                    "$daysSinceLastOrder",
                    500
                  ]
                },
                then: "Regular"
              }
            ],
            default: "At Risk"
          }
        }
      }
  }
]).toArray(),















        ])


      const totalOrders = totalRevenueData[0]?.totalOrders || 0;
      const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;

        const analyticsData = {
          activeUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          monthlySalesData,
          inventoryMetrics : inventoryMetrics[0],
          customerSegment : {
            totalCustomers: customerSegment.length,
            averageOrderValueFromAll: customerSegment.reduce((acc, curr) => acc + curr.averageOrderValue, 0) / customerSegment.length || 0,
          },
          conversionRate: totalOrders && activeUsers ? (totalOrders / activeUsers) * 100 : "0.00",
        }

        res.json(analyticsData);

        cache.set('dashboardAnalytics', analyticsData, 300);
      } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });

      }


    })














    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
  res.send('Hello')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})