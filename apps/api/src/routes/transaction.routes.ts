import { Router } from "express";
import {
  addTransactionController,
  deleteTransactionController,
  getTransactionController,
  updateTransactionController,
} from "../controllers/transaction.controller.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = Router();
router.use(requireAuth)


router.post("/", addTransactionController);
router.get("/", getTransactionController);
router.patch("/:id", updateTransactionController);
router.delete("/:id", deleteTransactionController);

export default router;
