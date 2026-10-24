import { Router } from "express";
import {
  createUserDataController,
  deleteUserDataController,
  listUserDataController,
  updateUserDataController,
} from "../controllers/user-data.controller.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/:resource", listUserDataController);
router.post("/:resource", createUserDataController);
router.patch("/:resource/:id", updateUserDataController);
router.delete("/:resource/:id", deleteUserDataController);

export default router;
