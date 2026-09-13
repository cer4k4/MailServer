import express from "express"
import middleware from "../../middleware/authentication.middleware"
import { UpdateUserDto } from "../../shared/middlewares/request/update-user.dto";
import { DataValidator } from "../../shared/middlewares/data-validator.middleware";
import { ParamUserIdDto } from "../../shared/middlewares/request/user-param.dto";
import { ParamGetAllUserDto } from "../../shared/middlewares/request/user-pagination.dto";
import { UserRoles } from "../../shared/models/enum";
import adminController from "../controller/adminController";


const adminRouter= express.Router()

adminRouter.get("/byId/:userId",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN]),ParamUserIdDto,DataValidator,adminController.getUserByAdmin)

adminRouter.put("/update/:userId",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN]),ParamUserIdDto,UpdateUserDto,DataValidator,adminController.updateUserByAdmin)

adminRouter.delete("/delete/:userId",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN]),ParamUserIdDto,DataValidator,adminController.deleteUser)

adminRouter.get("/list/:page/:limit",middleware.Authentication,middleware.Authorization([UserRoles.ADMIN]),ParamGetAllUserDto,DataValidator,adminController.allUser)

export = adminRouter;