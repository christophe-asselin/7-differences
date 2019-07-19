import { ICoordinate } from "../ICoordinate";
import { Title } from "./TitleEnum";

export interface IDifferenceIdentificationMessage {
    title: Title;
    differenceIdentified: boolean;
    newModifiedImageURL?: string;
    coordinates?: ICoordinate[];
}