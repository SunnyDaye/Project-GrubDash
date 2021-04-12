const { read } = require("fs");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// Implement list
function list(req, res) {
    res.json({ data: orders });
}

// Implement create
function hasDeliverTo(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo && deliverTo.length > 0) {
        res.locals.deliverTo = deliverTo;
        next();
    }
    next({
        status: 400,
        message: "A 'deliverTo' property is required",
    });
}
function hasMobileNumber(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber && mobileNumber.length > 0) {
        res.locals.mobileNumber = mobileNumber;
        next();
    }
    next({
        status: 400,
        message: "A 'mobileNumber' property is required",
    });
}
function hasDishes(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (dishes && Array.isArray(dishes) && dishes.length > 0) {
        res.locals.dishes = dishes;
        next();
    }
    next({
        status: 400,
        message: "A 'dishes' property is required",
    });
}
function hasQuantity(req, res, next) {
    const dishesProp = res.locals.dishes;
    let allDishesAreValid = true;
    let invalidIndex = null;
    dishesProp.forEach((dish, index) => {
        if(!dish.quantity || typeof(dish.quantity) != 'number' || dish.quantity <= 0){
            allDishesAreValid = false;
            invalidIndex = index;
        }
    });
    if (allDishesAreValid) {
        next();
    }
    next({
        status: 400,
        message: `Each dish must have a valid quantity property. Dish at ${invalidIndex} is missing this property`,
    });
}

function create(req,res){
    const newOrder = {
        id: nextId(),
        deliverTo: res.locals.deliverTo,
        mobileNumber: res.locals.mobileNumber,
        dishes: res.locals.dishes,
        quantity: res.locals.quantity,
    };
    
    orders.push(newOrder);

    res.status(201).json({data: newOrder});
}

// Implement read
function orderExists(req,res,next){
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order)=>order.id===orderId);
    if(foundOrder){
        res.locals.order = foundOrder;
        next();
    }
    next({
        status: 404,
        message: `Order ${orderId} does not exist.`,
    });
}

function getOrder(req,res){
    res.json({data: res.locals.order});
}

// Implement update
function hasStatus(req,res,next){
    const {data: {status} = {}} = req.body;
    if(status && status.length > 0 && (status == 'pending' || status == 'preparing' || status == 'out-for-delivery') ){
        res.locals.status = status;
        next();
    }
    next({
        status: 400,
        message: 'Order must have a status of pending, preparing, out-for-delivery, delivered. Delivered orders cannot be changed.',
    });
}
function update(req,res,next){
    const {data: {id = null} = {}} = req.body;
    const {order,deliverTo, mobileNumber,status,dishes} = res.locals;
    if(id === order.id || id == null || id.length === 0){
        order.deliverTo = deliverTo;
        order.mobileNumber = mobileNumber;
        order.status = status;
        order.dishes = dishes;
        res.json({data: order});
    }
    next({
        status: 400,
        message: `Order id does not match route id. Dish: ${id}, Route: ${order.id}`,
    });

}

// Implement delete

function destroy(req,res,next){
    const { orderId } = req.params;
    const foundOrder = res.locals.order;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1 && foundOrder.status == 'pending') {
    orders.splice(index, 1);
    res.sendStatus(204);
  }
  next({
      status: 400,
      message: "An order cannot be deleted unless it is pending."
  });
  
}

module.exports = {
    list,
    create: [hasDeliverTo,hasMobileNumber,hasDishes,hasQuantity,create],
    getOrder: [orderExists,getOrder],
    update: [orderExists,hasDeliverTo,hasMobileNumber,hasDishes,hasQuantity,hasStatus,update],
    delete: [orderExists,destroy],
};