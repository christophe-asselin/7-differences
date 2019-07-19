import { Schema } from "mongoose";

export const object3DThemeSchema: Schema = new Schema({
    path: String,
    position: [Number],
    scale: [Number],
    rotation: [Number],
    transparent: Boolean,
    index: Number,
},                                                    { _id: false });
