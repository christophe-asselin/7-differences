import { NextFunction, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { IUser } from "../../../common/IUser";
import { UserService } from "../services/user.service";
import Types from "../types";

@injectable()
export class UserController {

    public constructor(@inject(Types.UserService) private userService: UserService) { }

    public get router(): Router {
        const router: Router = Router();

        router.get("/connect/:name/",
                   (req: Request, res: Response, next: NextFunction) => {
                        this.userService.addUser(req.params.name).then((username: string) => {
                            res.json(username);
                        }).catch((err: Error) => {
                            res.json("");
                        });
                    });
        router.get("/usernames/",
                   (req: Request, res: Response, next: NextFunction) => {
                        this.userService.getUsernames().then((usernames: IUser[]) => {
                            res.json(usernames);
                        }).catch((err: Error) => {
                            res.json([]);
                        });
                    });

        return router;
    }
}
