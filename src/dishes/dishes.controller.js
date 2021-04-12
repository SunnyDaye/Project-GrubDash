const { resolveSoa } = require("dns");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to mak4e the tests pass

// TODO: Implement List /dishes

function list(req, res, next) {
    res.json({ data: dishes });
}


// TODO: Imeplement create /dishes

//check to see

function hasName(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name && name.length > 0) {
        res.locals.name = name;
        return next();
    }
    next({ status: 400, message: "A 'name' property is required." });

}

function hasDescription(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description && description.length > 0) {
        res.locals.description = description;
        return next();
    }
    next({ status: 400, message: "A 'description' property is required." });

}
function hasPrice(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (price && price > 0 && typeof(price) == 'number') {
        res.locals.price = price;
        return next();
    }
    next({ status: 400, message: "A 'price' property is required." });

}
function hasImage(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (image_url && image_url.length > 0) {
        res.locals.image_url = image_url;
        return next();
    }
    next({ status: 400, message: "A 'image_url' property is required." });

}

function create(req,res){
    const newDish = {
        id: nextId(),
        name: res.locals.name,
        description: res.locals.description,
        price: res.locals.price,
        image_url: res.locals.image_url,
    };

    dishes.push(newDish);
    res.status(201).json({data: newDish});
}

// TODO: Imeplement Read /dishes/:dishId
function dishExists(req,res,next){
    const dishId =  req.params.dishId;
    const foundDish =  dishes.find((dish)=>dish.id===dishId);
    if(foundDish){
        res.locals.dish = foundDish;
        next();
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`,
      });
}

function read(req,res){
    res.json({data: res.locals.dish });
}

// TODO: Implement Update /dishes/:dishId

function update(req,res, next){
    const foundDish = res.locals.dish;
    const {data: {id = null, name, description, price, image_url} = {}} = req.body;
    if(id === foundDish.id || id == null || id.length === 0){
        foundDish.name = name;
        foundDish.description = description;
        foundDish.price = price;
        foundDish.image_url = image_url;
        res.json({data: foundDish});
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${foundDish.id}`,
    })
}

module.exports = {
    list,
    create: [hasName,hasDescription,hasPrice,hasImage,create],
    read: [dishExists,read],
    update: [dishExists,hasName,hasDescription,hasPrice,hasImage,update],
};