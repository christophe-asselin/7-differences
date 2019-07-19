import { injectable } from "inversify";
import { Document } from "mongoose";
import "reflect-metadata";
import { IUser } from "../../../common/IUser";
import userModel from "./Model/IUser.model";

@injectable()
export class UserService {

    public async getUsernames(): Promise<IUser[]> {
        return userModel.find({}).then((userModels: (IUser & Document)[]) => {
            const users: IUser[] = [];
            userModels.forEach((model: (IUser & Document)) => {
                users.push({ username: model.username, userId: model.userId });
            });

            return users;
        });
    }

    public async isAvailable(username: string): Promise<boolean> {
        return userModel.countDocuments({ username: username }).then((count: number) => {
            return (count === 0);
        }).catch((err: Error) => {
            return false;
        });
    }

    public async addUser(username: string): Promise<string> {
        if (!(await this.isAvailable(username))) {
            return "";
        }
        const user: IUser = { username: username, userId: "0" };
        const createdUser: IUser & Document = new userModel(user);

        return createdUser.save().then((savedUser: IUser) => {
            return savedUser.username;
        }).catch((err: Error) => {
            return "";
        });
    }

    public async setId(id: string, name: string): Promise<void> {
        userModel.updateOne({ username: name }, { userId: id }).then(() => { return; }).catch(() => { return; });
    }

    public async removeUser(id: string): Promise<string> {
        return new Promise<string>((resolve: (value: string) => void) => {
            // tslint:disable-next-line: no-any // err pas de type dans definition
            userModel.findOneAndDelete({ userId: id }, (err: any, res: (IUser & Document) | null) => {
                resolve(res ? (res as IUser).username : "");
            });
        });
    }
}
