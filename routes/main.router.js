import { Router } from "express";
import postRoutes from "./post.router.js";
import userRoutes from "./user.router.js";

const mainRoutes = Router();

mainRoutes.use("/post", postRoutes);
mainRoutes.use("/user", userRoutes);

export default mainRoutes;
