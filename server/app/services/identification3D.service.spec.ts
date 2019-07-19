import { expect } from "chai";
import { Game3DType } from "../../../common/Game3DType";
import { GameState, GameType } from "../../../common/GameEnum";
import { IFreeGame } from "../../../common/IFreeGame";
import { IObject3D } from "../../../common/IObject3D";
import { Identification3DService } from "./identification3D.service";

class TestObject3D {
    public index: number;

    public constructor(index: number) {
        this.index = index;
    }
}

describe("Identification3DService", () => {
    const identification3DService: Identification3DService = new Identification3DService();

    describe("generateResponse", () => {
        const NAME: string = "Test";

        const freeGame: IFreeGame = {
            _id: "1",
            name: NAME,
            type: GameType.FREE,
            game3Dtype: Game3DType.GEOMETRIC,
            originalImageURL: "",
            scoreSolo: [],
            scoreDuo: [],
            originalObjects: [],
            modifiedObjects: [],
            state: GameState.NOT_WAITING,
        };

        const N_OBJECTS: number = 3;
        for (let i: number = 0; i < N_OBJECTS; ++i) {
            const object: TestObject3D = new TestObject3D(i);
            (freeGame.modifiedObjects as IObject3D[]).push(object as IObject3D);
        }

        it("should return true if one of the modified objects has the index passed as an argument", () => {
            const OBJECT_3: number = 2;
            expect(identification3DService.generateResponse(freeGame, 0)).to.equal(true);
            expect(identification3DService.generateResponse(freeGame, 1)).to.equal(true);
            expect(identification3DService.generateResponse(freeGame, OBJECT_3)).to.equal(true);
        });

        it("should return false if none of the modified objects has the index passed as an argument", () => {
            const INDEX: number = 3;
            expect(identification3DService.generateResponse(freeGame, INDEX)).to.equal(false);
        });
    });
});
