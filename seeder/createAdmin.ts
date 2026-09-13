import { IUser } from "../shared/models/user.interface";
import model from "../shared/models/userSchema";
import { configFile } from "../config/config";
import { hash } from "bcrypt";
import { UserRoles } from "../shared/models/enum";

export async function addAdmin() {
    try{
        const adminFound = await model.UserModel.findOne({"username":configFile.adminUsername})
        if (adminFound) {
            return
        }
        const admin1:IUser = {
            username: configFile.adminUsername || "",
            password: configFile.adminPassword || "",
            role: UserRoles.ADMIN,
            userId: "",
            fullName: "Admin",
        }
        admin1.password = await hash(String(admin1.password), 10);
        const result = await model.UserModel.create(admin1 as any);
    } catch(err){
        console.log("Erroor To Add Admin",err)
        return err
    }

}