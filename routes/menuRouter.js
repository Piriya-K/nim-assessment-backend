const { Router } = require("express");
const menuController = require("../controllers/menuController");

const menuRouter = Router();

menuRouter.get("/", menuController.getAll);
menuRouter.get("/:id", menuController.getOne);
menuRouter.post("/", menuController.create);

// Menu Routes - Update menu item
menuRouter.put("/:id", menuController.update);

module.exports = menuRouter;
