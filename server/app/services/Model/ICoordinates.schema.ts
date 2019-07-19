import { Schema } from "mongoose";

export const coordinatesSchema: Schema = new Schema({
    x: Number,
    y: Number,
},                                                  { _id: false });
