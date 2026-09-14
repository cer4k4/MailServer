import express from "express"
import adminRouter from "../admin/adminRoutes/adminRouter"

const baseRouter = express.Router()
baseRouter.use("/admin", adminRouter)

export = baseRouter;