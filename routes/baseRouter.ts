import express from "express"
import userRouter from "../users/userRoutes/userRouter"
import adminRouter from "../admin/adminRoutes/adminRouter"

const baseRouter = express.Router()
baseRouter.use("/users", userRouter)
baseRouter.use("/admin", adminRouter)

export = baseRouter;