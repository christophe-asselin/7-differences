import { Schema } from "mongoose";

export const scoreSchema: Schema = new Schema({
    time: String,
    name: String,
},                                            { _id: false });
