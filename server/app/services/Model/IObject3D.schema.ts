import { Schema } from "mongoose";

export const object3DSchema: Schema = new Schema({
    path: String,
    color: String,
    position: [Number],
    rotation: [Number],
    scale: [Number],
    type: String,
    transparent: Boolean,
    index: Number,
},                                               { _id: false });
