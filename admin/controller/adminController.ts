import model from "../../shared/models/userSchema";
import { SuccessResponse }  from "../../shared/interfaces/responseInterface";
import auth from "../../middleware/authentication.middleware";
import { systemErrors, UserRoles } from "../../shared/models/enum"
import { hash, compare } from "bcrypt";
import { Request, Response } from "express";
import { RequestWithUser } from "../../shared/interfaces/request-with-payload.interface";
import { IUser } from "../../shared/models/user.interface";
import { ObjectId } from "mongodb";

async function updateUserByAdmin(req: RequestWithUser,res: Response) {
  try {
    const userId = req.params["userId"]
    const updateData = req.body;
    let user = await model.UserModel.findById(userId) as IUser
    if (!user){
      const response = new SuccessResponse({},false,404,systemErrors.USERNOTFOUNDED)
      return res.status(404).json(response);
    }
    if (updateData.newPassword) {
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
    
    if (updateData.role) {
      if (! await checkRoles(updateData.role)){
        const response = new SuccessResponse({},false,404,systemErrors.ROLENOTEXIST)
        return res.status(404).json(response);
      }
      user.role = updateData.role
    }
    if (updateData.fullName) {
      user.fullName = updateData.fullName
    }
    const result = await model.UserModel.updateOne({ _id: user }, { $set: {username:user.username,fullName:user.fullName,password:user.password,role:user.role} });
    const response = new SuccessResponse(result)
    return res.status(200).json(response);
  } catch (error) {
    console.log("Server Error UpdateUserByAdmin",error)
    const response = new SuccessResponse({},false,500,systemErrors.SERVERERROR)
    return res.status(500).json(response);
  }
}



async function getUserByAdmin(req:RequestWithUser, res:Response) {
  try {
    const id = req.params["userId"]
    const user = await model.UserModel.findById(id);
    if (!user) {
      const response = new SuccessResponse({},false,404,systemErrors.USERNOTFOUNDED)
      return res.status(404).json(response);
    } else {
      const response = new SuccessResponse(user)
      return res.status(200).json(response);
    }
  } catch (error) {
    console.log("Server Error GetUserByAdmin",error)
    const response = new SuccessResponse({},false,500,systemErrors.SERVERERROR)
    return res.status(500).send(response);
  }
}


async function deleteUser(req:RequestWithUser, res:Response) {
  try {
    const id = req.params["userId"]
    const user = await model.UserModel.findByIdAndDelete(id);
    if (!user) {
      const response = new SuccessResponse({},false,404,systemErrors.USERNOTFOUNDED)
      return res.status(404).json(response);
    } else {
      const response = new SuccessResponse(user)
      return res.status(200).json(response);
    }
  } catch (error) {
    console.log("Server Error DeleteUser",error)
    const response = new SuccessResponse({},false,500,systemErrors.SERVERERROR)
    return res.status(500).send(response);
  }
}


async function allUser(req:RequestWithUser, res:Response) {
  try {
    let limit = Number(req.params["limit"])
    if (!limit || limit <= 0){
      limit = Number(10)
    }
    let page = Number(req.params["page"])
    if (!page || page <= 0){
      page = Number(1)
    }
    const offset = (page - 1) * limit
    const allUsers = await model.UserModel.find({}).skip(offset).limit(limit);
    const response = new SuccessResponse(allUsers)
    return res.status(200).json(response);
  } catch (error) {
    console.log("Server Error AllUser",error)
    const response = new SuccessResponse({},false,500,systemErrors.SERVERERROR)
    return res.status(500).send(response);
  }
}





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






async function checkRoles(role:string) {
  for (let r of Object(UserRoles).values){
    if (role === r) {
      return true
    }
  }
  return false
}


export = { getUserByAdmin , updateUserByAdmin , deleteUser , allUser , getUser,registerUser,updateUser,loginUser};
