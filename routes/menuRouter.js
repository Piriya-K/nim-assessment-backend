const { Router } = require("express");
const menuController = require("../controllers/menuController");

const menuRouter = Router();

// Menu Routes - Get menu items by query
menuRouter.get("/search", menuController.getByQuery);
menuRouter.get("/", menuController.getAll);
menuRouter.get("/:id", menuController.getOne);
menuRouter.post("/", menuController.create);

// Menu Routes - Update menu item
menuRouter.put("/:id", menuController.update);

// Menu Routes - Delete menu item
menuRouter.delete("/:id", menuController.remove);

module.exports = menuRouter;
