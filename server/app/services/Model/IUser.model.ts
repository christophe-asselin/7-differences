import { model, Document, Model, Schema } from "mongoose";
import { IUser } from "../../../../common/IUser";

const userSchema: Schema = new Schema({
    username: String,
    userId: String,
});

const userModel: Model<IUser & Document> = model<IUser & Document>("User", userSchema);

export default userModel;
