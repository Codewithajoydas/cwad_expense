import { Router } from "express";

import {
  getAccountsController,
  addAccountController,
  updateAccountController,
  deleteAccountController,
} from "../controllers/account.controller.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = Router();

router.use(requireAuth)

router.get("/", getAccountsController);
router.post("/", addAccountController);
router.patch("/:id", updateAccountController);
router.delete("/:id", deleteAccountController);

export default router;