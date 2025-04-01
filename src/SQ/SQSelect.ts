import { DatabaseResult } from "@/types/DatabaseResult";
import { Users } from "./models/users/Users";
import { SQInit } from "./SQInit";

export class SQSelect extends SQInit
{


    public static auth = {
        login: async (email: string, password: string): Promise<DatabaseResult<Users>> =>
        {

            try
            {
                const userresult = await Users.findOne({
                    where: {
                        email: email,
                        password: password,
                        is_active: true
                    }
                })

                if (!userresult)
                {
                    return {
                        message: "User not found",
                    }
                }

                return {
                    message: "User found",
                    data: userresult,
                }

            } catch (error)
            {
                console.error("Error in auth.login: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getUserById: async (id: number): Promise<DatabaseResult<Users>> =>
        {
            try
            {
                const userresult = await Users.findOne({
                    where: {
                        id: id,
                        is_active: true
                    }
                })

                if (!userresult)
                {
                    return {
                        message: "User not found",
                    }
                }

                return {
                    message: "User found",
                    data: userresult,
                }

            } catch (error)
            {
                console.error("Error in auth.getUserById: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        }
    }

}