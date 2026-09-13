import express from "express"
import userController from "../controller/userController"
import middleware from "../../middleware/authentication.middleware"
import { RegisterUserDto } from "../../shared/middlewares/request/create-user.dto";
import { UpdateUserDto } from "../../shared/middlewares/request/update-user.dto";
import { LoginUserDto } from "../../shared/middlewares/request/login-user.dto";
import { DataValidator } from "../../shared/middlewares/data-validator.middleware";
import { UserRoles } from "../../shared/models/enum";





const userRouter= express.Router()

userRouter.post("/create",RegisterUserDto,DataValidator,userController.registerUser)

userRouter.get("/byId",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN,UserRoles.USER]),userController.getUser)

userRouter.patch("/update",middleware.Authorization([UserRoles.ADMIN,UserRoles.USER]),UpdateUserDto,DataValidator,middleware.Authentication,userController.updateUser)

userRouter.post("/login",LoginUserDto,DataValidator,userController.loginUser)

export = userRouter;