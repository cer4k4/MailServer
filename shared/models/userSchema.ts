import { Schema, model } from "mongoose";
import { UserRoles } from "./enum";
import baseModel from "./baseModel"
const userSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String },
  role:     { type: String, default: UserRoles.USER, required: true },
  password: { type: String, required: true },
  ...baseModel,
});

const UserModel = model("User", userSchema);



export = {UserModel};