import { Router } from "express";

import {
  getCategoriesController,
  addCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/category.controller.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";


const router = Router();

router.use(requireAuth);

router.get("/", getCategoriesController);
router.post("/", addCategoryController);
router.patch("/:id", updateCategoryController);
router.delete("/:id", deleteCategoryController);

export default router;