const mongoose = require("../db.js");

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  items: [
    {
      item: {
        type: mongoose.Schema.ObjectId,
        ref: "MenuItems"
      },

      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  status: {
    type: String,
    required: true,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
orderSchema.set("toJSON", {
  virtuals: true
});
orderSchema.statics.calcTotal = (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

// order model
const Order = mongoose.model("Order", orderSchema);

const getAll = async () => {
  // populate each item
  const orders = await Order.find().populate("items.item");

  return orders;
};

const getOne = async (id) => {
  const order = await Order.findById(id).populate("items.item");
  return order;
};

const create = async (body) => {
  const order = await Order.create(body);
  return order;
};

const update = async (id, body) => {
  const order = await Order.findByIdAndUpdate(id, body, { new: true });
  return order;
};

const remove = async (id) => {
  const order = await Order.findByIdAndDelete(id);
  return order.id;
};

const getByStatus = async (status) => {
  const orders = await Order.find({ status }).populate("items");
  return orders;
};

const getTotalSales = async (reqBody) => {
  let matchStage = null;

  // Parse startDate and endDate from reqBody if provided
  if (reqBody.startDate && reqBody.endDate) {
    const { startDate, endDate } = reqBody;
    const [startYear, startMonth] = startDate.split("-");
    const [endYear, endMonth] = endDate.split("-");

    matchStage = {
      $match: {
        createdAt: {
          $gte: new Date(startYear, startMonth - 1),
          $lte: new Date(endYear, endMonth, 0, 23, 59, 59, 999)
        }
      }
    };
  }

  // Define the pipeline array
  const pipeline = [
    // Add the match stage conditionally based on startDate and endDate
    ...(matchStage ? [matchStage] : []),

    // Unwind the items array to work with individual items
    { $unwind: "$items" },

    // Perform a $lookup to join with MenuItems on the _id field
    {
      $lookup: {
        from: "menuitems",
        localField: "items.item", // field in Order.items to join on
        foreignField: "_id", // field in MenuItems to join on
        as: "joinedMenuItem"
      }
    },

    // Unwind the array created by $lookup
    { $unwind: "$joinedMenuItem" },

    // Project to compute the multiplication and add to a new field
    {
      $project: {
        multipliedResult: {
          $multiply: ["$items.quantity", "$joinedMenuItem.price"]
        }
      }
    },

    // Group to compute the sum across all documents
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$multipliedResult" }
      }
    }
  ];

  const totalSales = await Order.aggregate(pipeline);

  // Formatting totalSales
  const formattedTotalSales =
    totalSales.length > 0 ? totalSales[0].totalSales : 0;

  return { total: Number(formattedTotalSales.toFixed(2)) };
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  getByStatus,
  getTotalSales,
  Order
};
