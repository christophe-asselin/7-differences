import { injectable } from "inversify";
import "reflect-metadata";
import { IFreeGame } from "../../../common/IFreeGame";

@injectable()
export class Identification3DService {

    public generateResponse(freeGame: IFreeGame, index: number): boolean {

        for (const object of freeGame.modifiedObjects) {
            if (object.index === +index) {
                return true;
            }
        }

        return false;
    }

}
