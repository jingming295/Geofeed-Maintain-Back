import { DatabaseResult } from "@/types/DatabaseResult";
import { Users } from "./models/users/Users";
import { SQInit } from "./SQInit";
import { CryptoUtils } from "@/utils/CryptoUtils";
import { User_Roles } from "./models/users/User_Roles";

export class SQInsert extends SQInit
{

    public static initInsert = {
        insertDefaultUser: async (): Promise<DatabaseResult<null>> =>
        {
            try
            {
                const result = await this.Sequelize.transaction(async (): Promise<DatabaseResult<null>> =>
                {
                    const usersResult = await Users.findAll();
                    if (usersResult.length) return { message: "User already exists" };

                    const password = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'

                    const hashedPassword = CryptoUtils.saltAndToSHA256(password);

                    await User_Roles.create({
                        id: 1,
                        role_name: 'user',
                    })

                    await Users.create({
                        id: 1,
                        user_role_id: 1,
                        email: 'admin@admin.com',
                        password: hashedPassword,
                        is_active: true
                    })

                    return { message: "Default user inserted" };

                })

                return result


            } catch (error)
            {
                console.error('Error inserting default user:', error);
                return { error: true, message: "Error inserting default user" };
            }



        }
    }


}