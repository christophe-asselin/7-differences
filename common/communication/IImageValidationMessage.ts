import { Title } from "./TitleEnum";
import { ICoordinate } from "../ICoordinate";

export interface IImageValidationMessage {
    title: Title;
    body: string;
    differenceRegions?: ICoordinate[][];
}