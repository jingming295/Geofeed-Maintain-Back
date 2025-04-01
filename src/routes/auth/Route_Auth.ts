import { Application, Request } from "express";
import { InputControl } from "../tools/InputControl";
import { ReturnCode } from "../tools/ReturnCode";
import { CommonResponse } from "@/types/CommonResponse";
import { Routes } from "../Routes";
import { CryptoUtils } from "../tools/CryptoUtils";
import { SQSelect } from "@/SQ/SQSelect";
import { SessionDataUser } from "@/types/session";

export class Route_Auth extends Routes
{
    static routeName = "/auth";
    public static setRoute(app: Application): void
    {
        app.post(`${this.routeName}/login`, (req, res) => this.middleware(req, res, this.login));

        app.post(`${this.routeName}/verifyuser`, (req, res) => this.middleware(req, res, this.verifyUser));
    }


    private static login = async (req: Request): Promise<CommonResponse<SessionDataUser>> =>
    {
        const body: { email: string, password: string } = req.body;
        if (req.session.user) return this.buildResponse(ReturnCode('OPSuccess'), "Already logged in", req.session.user);
        const validateEmail = InputControl.validateEmail(body.email);
        const validatePassword = InputControl.validatePassword(body.password);

        if (!validateEmail.pass)
        {
            return this.buildResponse(ReturnCode('InputVerificationFailed'), validateEmail.message);
        }

        if (!validatePassword.pass)
        {
            return this.buildResponse(ReturnCode('InputVerificationFailed'), validatePassword.message);
        }


        const hashedPassword = CryptoUtils.saltAndToSHA256(body.password);

        const authResult = await SQSelect.auth.login(body.email, hashedPassword);

        if (authResult.error)
        {
            return this.buildResponse(ReturnCode('ISE'), authResult.message);
        }

        if (!authResult.data)
        {
            return this.buildResponse(ReturnCode('AuthorizationFailed'), "User not found");
        }

        const userData = {
            id: authResult.data.id,
            email: authResult.data.email,
            role: authResult.data.user_role_id,
            avatar: authResult.data.avatar,
            activated: authResult.data.is_active,
        }

        req.session.user = userData; // 将用户数据存储在会话中

        return this.buildResponse(ReturnCode('OPSuccess'), "Login successful", userData);

    }


    private static verifyUser = async (req: Request): Promise<CommonResponse<SessionDataUser>> =>
    {
        try
        {
            // 从会话中获取用户数据
            const sessionUser = req.session.user;

            // 如果会话中没有用户数据，返回未登录状态
            if (!sessionUser)
            {
                return this.buildResponse(ReturnCode('NotFound'), "User Not Logged In");
            }

            // 从数据库重新获取最新的用户信息
            const updatedUserData = await SQSelect.auth.getUserById(sessionUser.id);

            if (!updatedUserData.data)
            {
                // 如果用户在数据库中不存在或被删除，清除会话并返回错误
                req.session.destroy(err =>
                {
                    if (err)
                    {
                        console.error("Failed to destroy session:", err);
                    }
                });
                return this.buildResponse(ReturnCode('NotFound'), "User Not Found");
            }

            // 更新会话中的用户数据
            req.session.user = {
                id: updatedUserData.data.id,
                email: updatedUserData.data.email,
                role: updatedUserData.data.user_role_id,
                avatar: updatedUserData.data.avatar,
                activated: updatedUserData.data.is_active,
            };

            // 返回最新的用户数据
            return this.buildResponse(ReturnCode('OPSuccess'), "Valid User", req.session.user);
        } catch (error)
        {
            console.error("Error in verifyUser:", error);
            return this.buildResponse(ReturnCode('ISE'), "Internal Server Error");
        }
    };


}