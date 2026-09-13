import model from "../../shared/models/userSchema";
import { SuccessResponse }  from "../../shared/interfaces/responseInterface";
import auth from "../../middleware/authentication.middleware";
import { systemErrors, UserRoles } from "../../shared/models/enum"
import { hash, compare } from "bcrypt";
import { Request, Response } from "express";
import { RequestWithUser } from "../../shared/interfaces/request-with-payload.interface";
import { IUser } from "../../shared/models/user.interface";
import { ObjectId } from "mongodb";



async function registerUser(req:Request, res:Response) {
  try {
    const body = req.body
    const username = body.username;
    const userFound = await model.UserModel.findOne({username});
    if (userFound) {
      const response = new SuccessResponse({},false,409,systemErrors.USERNAMEEXISTED)
      return res.status(409).json(response);
    }
    const fullName = body.fullName;
    const password = body.password;
    const hashedPassword = await hash(String(password), 10);
    const newUser = await model.UserModel.create({
      username,
      fullName,
      password: hashedPassword,
    });
    const response = new SuccessResponse({username: newUser.username, fullName: newUser.fullName, role: newUser.role},true,201,systemErrors.SUCCESSFUL)
    return res.status(201).json(response);
  } catch (error) {
    console.log("Server Error RegisterUser",error)
    const response = new SuccessResponse({},false,500,systemErrors.SERVERERROR)
    return res.status(500).json(response);
  }
}

async function updateUser(req: RequestWithUser,res: Response) {
  try {
    const updateData = req.body;
    const user = (req.user) as IUser
    if (updateData.newPassword) {
      if (! await compare(updateData.password,user.password)) {
        const response = new SuccessResponse({},false,400,systemErrors.PASSWORDWRONG)
        return res.status(400).json(response);
      }
      const hashedPassword = await hash(updateData.newPassword, 10);
      user.password = hashedPassword
    }
    if (updateData.username){
      if (await model.UserModel.findOne({username:updateData.username})) {
        const response = new SuccessResponse({},false,409,systemErrors.USERNAMEEXISTED)
        return res.status(409).json(response);
      }
      user.username = updateData.username
    }
    user.fullName = updateData.fullName
    let id = new ObjectId(user.userId);
    const result = await model.UserModel.updateOne({ _id: id }, { $set: {username:user.username,fullName:user.fullName,password:user.password} });
    const response = new SuccessResponse(result,true,200,systemErrors.UPDATESUCCESSFUL)
    return res.status(200).json(response);
  } catch (error) {
    console.log("Server Error UpdateUser",error)
    const response = new SuccessResponse({},false,500,systemErrors.SERVERERROR)
    return res.status(500).json(response);
  }
}

async function getUser(req:RequestWithUser, res:Response) {
  try {
    const user = req.user as IUser
    const response = new SuccessResponse({"username":user.username,"fullName":user.fullName})
    return res.status(200).json(response);
  } catch (error) {
    console.log("Server Error GetUser",error)
    const response = new SuccessResponse({},false,500,systemErrors.SERVERERROR)
    return res.status(500).json(response);
  }
}

async function loginUser(req:Request, res:Response) {
  try {
    const username = req.body.username || '';
    const password = req.body.password || '';
    const userFound = await model.UserModel.findOne({username});
    if (!userFound) {
      const response = new SuccessResponse({},false,404,systemErrors.USERNOTFOUNDED)
      return res.status(404).json(response);
    }
    if ( ! compare(password,userFound.password as string)) {
      const response = new SuccessResponse({},false,400,systemErrors.PASSWORDWRONG)
      return res.status(400).json(response);
    }
    const user:IUser = {
      userId: userFound.id,
      username: username,
      password: password,
      role: UserRoles.USER,
      fullName: userFound.fullName as string,
    };
    const response = new SuccessResponse(auth.generateToken(user))
    return res.json(response);
  } catch (error) {
    console.log("Server Error LoginUser",error)
    const response = new SuccessResponse({},false,500,systemErrors.SERVERERROR)
    return res.status(500).json(response);
  }
}










export = {getUser,registerUser,updateUser,loginUser};
