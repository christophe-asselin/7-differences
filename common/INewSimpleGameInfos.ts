import { ICoordinate } from "./ICoordinate";

export interface INewSimpleGameInfos {
    name: string,
    originalImage: File | string,
    modifiedImage: File | string,
    differenceRegions: ICoordinate[][];
}