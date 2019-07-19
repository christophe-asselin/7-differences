import { ICoordinate } from "../../../common/ICoordinate";
import { Bitmap } from "./Bitmap/Bitmap";

export interface ISimpleIdentification {
    coordinate: ICoordinate;
    originalImage: Bitmap;
    modifiedImage: Bitmap;
}
