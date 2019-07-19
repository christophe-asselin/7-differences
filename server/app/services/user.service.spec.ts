import { expect } from "chai";
import { UserService } from "./user.service";

let service: UserService;

// Pas de tests unitaires a faire, communique seulement avec la BD (tests d'integration)
describe ("UserService", () => {

    beforeEach(() => {
        service = new UserService();
    });

    it("should create", () => {
        // tslint considere comme inutilise
        // tslint:disable-next-line: no-unused-expression
        expect(service).to.be.ok;
    });

});
