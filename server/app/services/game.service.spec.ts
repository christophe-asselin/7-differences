import { expect } from "chai";
import { GameService } from "./game.service";

const service: GameService = new GameService();

// Pas de tests unitaires a faire, communique seulement avec la BD (tests d'integration)
describe("GameService", () => {

  it("should create", () => {
    // tslint considere comme inutilise
    // tslint:disable-next-line: no-unused-expression
    expect(service).to.be.ok;
  });

});
