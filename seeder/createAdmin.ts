import { IUser } from "../shared/models/user.interface";
import model from "../shared/models/userSchema";
import { configFile } from "../config/config";
import { hash } from "bcrypt";
import { UserRoles } from "../shared/models/enum";
import mailServerService from "../admin/services/mailServer.service";

export async function addAdmin() {
    try{
        const adminFound = await model.UserModel.findOne({"username":configFile.adminUsername})
        if (adminFound) {
            return
        }
        const email = configFile.adminUsername+"@"+configFile.emailAddress
        const admin1:IUser = {
            username: configFile.adminUsername || "admin",
            password: configFile.adminPassword || "123456",
            role: UserRoles.ADMIN,
            userId: "",
            email: email,
            fullName: "Admin",
        }
        admin1.password = await hash(String(admin1.password), 10);
        const result = await model.UserModel.create(admin1 as any);
        console.log(configFile.adminUsername+"@"+configFile.emailAddress,configFile.adminPassword || "123456")
        await mailServerService.addEmail(configFile.adminUsername+"@"+configFile.emailAddress,configFile.adminPassword || "123456")
    } catch(err){
        console.log("Erroor To Add Admin",err)
        return err
    }

}