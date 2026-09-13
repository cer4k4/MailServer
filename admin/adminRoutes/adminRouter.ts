import express from "express"
import middleware from "../../middleware/authentication.middleware"
import { UpdateUserDto } from "../../shared/middlewares/request/update-user.dto";
import { DataValidator } from "../../shared/middlewares/data-validator.middleware";
import { ParamUserIdDto } from "../../shared/middlewares/request/user-param.dto";
import { ParamGetAllUserDto } from "../../shared/middlewares/request/user-pagination.dto";
import { UserRoles } from "../../shared/models/enum";
import adminController from "../controller/adminController";
import userController from "../../users/controller/userController";
import { RegisterUserDto } from "../../shared/middlewares/request/create-user.dto";
import { LoginUserDto } from "../../shared/middlewares/request/login-user.dto";


const adminRouter= express.Router()
adminRouter.post("/create",RegisterUserDto,DataValidator,userController.registerUser)

adminRouter.get("/byId/:userId",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN]),ParamUserIdDto,DataValidator,adminController.getUserByAdmin)

adminRouter.put("/update/:userId",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN]),ParamUserIdDto,UpdateUserDto,DataValidator,adminController.updateUserByAdmin)

adminRouter.delete("/delete/:userId",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN]),ParamUserIdDto,DataValidator,adminController.deleteUser)

adminRouter.get("/list/:page/:limit",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN]),ParamGetAllUserDto,DataValidator,adminController.allUser)

adminRouter.get("/",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN,UserRoles.USER]),userController.getUser)

adminRouter.post("/login",LoginUserDto,DataValidator,userController.loginUser)

export = adminRouter;