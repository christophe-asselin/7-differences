import { model, Document, Model, Schema } from "mongoose";
import { IFreeGame } from "../../../../common/IFreeGame";
import { object3DSchema } from "./IObject3D.schema";
import { object3DThemeSchema } from "./IObject3DTheme.schema";
import { scoreSchema } from "./IScore.schema";

const freeGameSchema: Schema = new Schema({
    name: String,
    type: String,
    game3Dtype: String,
    originalImageURL: String,
    scoreSolo: [scoreSchema],
    scoreDuo: [scoreSchema],
    originalObjects: [object3DSchema, object3DThemeSchema],
    modifiedObjects: [object3DSchema, object3DThemeSchema],
    state: String,
});

const freeGameModel: Model<IFreeGame & Document> = model<IFreeGame & Document>("FreeGame", freeGameSchema);

export default freeGameModel;
