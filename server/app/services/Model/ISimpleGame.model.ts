import { model, Document, Model, Schema } from "mongoose";
import { ISimpleGame } from "../../../../common/ISimpleGame";
import { coordinatesSchema } from "./ICoordinates.schema";
import { scoreSchema } from "./IScore.schema";

const simpleGameSchema: Schema = new Schema({
    name: String,
    type: String,
    originalImageURL: String,
    modifiedImageURL: String,
    differenceRegions: [[coordinatesSchema]],
    scoreSolo: [scoreSchema],
    scoreDuo: [scoreSchema],
    state: String,
});

const simpleGameModel: Model<ISimpleGame & Document> = model<ISimpleGame & Document>("SimpleGame", simpleGameSchema);

export default simpleGameModel;
