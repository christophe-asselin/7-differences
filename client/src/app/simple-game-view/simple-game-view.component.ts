import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";

import { Subscription } from "rxjs";
import { GameEvent, GameMode, GameType } from "../../../../common/GameEnum";
import { ICoordinate } from "../../../../common/ICoordinate";
import { IDuoGame } from "../../../../common/IDuoGame";
import { IGameMessage } from "../../../../common/IGameMessage";
import { ISimpleGame } from "../../../../common/ISimpleGame";
import { IUser } from "../../../../common/IUser";
import { SocketEvent } from "../../../../common/SocketEvent";
import { IDifferenceIdentificationMessage } from "../../../../common/communication/IDifferenceIdentificationMessage";
import { Title } from "../../../../common/communication/TitleEnum";
import { Message } from "../../../../common/communication/message";
import { GameService } from "../services/game.service";
import { ImageService } from "../services/image.service";
import { PopupService } from "../services/popup.service";
import { SimpleDifferenceService } from "../services/simple-difference.service";
import { SocketService } from "../services/socket.service";

@Component({
  selector: "app-simple-game-view",
  templateUrl: "./simple-game-view.component.html",
  styleUrls: ["./simple-game-view.component.css"],
})
export class SimpleGameViewComponent implements OnInit, OnDestroy {

  private static readonly MAX_DIFFERENCES_SOLO: number = 7;

  public currentGame: ISimpleGame;
  public currentDuoGame: IDuoGame;
  public currentUser: IUser;
  public nPlayers: GameMode;
  public elapsedTime: number;
  public nDifferencesFoundSolo: number;

  public isError: boolean;
  public errorCoordinateX: string;
  public errorCoordinateY: string;

  private identifiedDifferences: boolean[][];
  private differenceSound: HTMLAudioElement;
  private timerInterval: number;
  private canClick: boolean;
  private errorSound: HTMLAudioElement;

  private onSimpleDifferenceFound: Subscription;
  private onEndDuoGame: Subscription;
  private onLeaveDuoGame: Subscription;

  public constructor(private route: ActivatedRoute,
                     private gameService: GameService,
                     private simpleDifferenceService: SimpleDifferenceService,
                     private socketService: SocketService,
                     private popupService: PopupService,
                     private imageService: ImageService,
                     ) {
    this.initGame();
    this.currentUser = this.socketService.getUser();
    this.initDuoGame();

    this.identifiedDifferences = [];
    const WIDTH: number = 640;
    for (let i: number = 0; i < WIDTH; i++) {
      this.identifiedDifferences[i] = new Array<boolean>(false);
    }

    const DIFF_AUDIO_PATH: string = "./assets/diff_sound_short.wav";
    const ERROR_AUDIO_PATH: string = "./assets/identification_error_sound.wav";
    this.differenceSound = new Audio(DIFF_AUDIO_PATH);
    this.errorSound =  new Audio(ERROR_AUDIO_PATH);

    this.nDifferencesFoundSolo = 0;
    this.isError = false;
    this.elapsedTime = 0;
    this.canClick = true;
  }

  public ngOnInit(): void {
    if (this.nPlayers === GameMode.DUO) {
      this.onSimpleDifferenceFound = this.socketService.onEvent<IDuoGame>(SocketEvent.SIMPLE_DIFFERENCE_FOUND)
      .subscribe((game: IDuoGame) => {
        this.currentDuoGame = game;
        this.currentGame.modifiedImageURL = game.modifiedImageURL as string;
        this.identifiedDifferences = game.identifiedDifferences as boolean[][];
      });
      this.onEndDuoGame = this.socketService.onceEvent<Message>(SocketEvent.END_DUO_GAME).subscribe((message: Message) => {
        // -- END DUO SIMPLE GAME -- //
        this.endDuoGame(message);
      });
      this.onLeaveDuoGame = this.socketService.onEvent<void>(SocketEvent.QUIT_DUO_GAME).subscribe(() => {
        const message: Message = {title: Title.QUIT, body: "Votre adversaire a quitté la partie."};
        this.endDuoGame(message);
      });
    }
  }

  public ngOnDestroy(): void {
    if (this.nPlayers === GameMode.DUO) {
      this.onSimpleDifferenceFound.unsubscribe();
      this.onEndDuoGame.unsubscribe();
      this.onLeaveDuoGame.unsubscribe();
    }
  }

  public onImageClick(offsetX: number, offsetY: number, clientX: number, clientY: number): void {
    const HEIGHT: number = 480;
    const x: number = offsetX;
    const y: number = HEIGHT - offsetY;
    const isAlreadyIdentified: boolean = this.identifiedDifferences[x][y];
    const isValid: boolean = !isAlreadyIdentified && !this.isError;

    if (this.canClick) {
      if (isValid) {
        this.canClick = false;
        this.simpleDifferenceService.checkIfDifference(this.currentGame._id, x, y, this.createFormData())
        .subscribe((message: IDifferenceIdentificationMessage) => {
          if (message.title !== Title.FAIL) {
            if (message.differenceIdentified) {
              this.onDifferenceFound(message);
            } else {
              this.sendMessage(GameEvent.ERROR_IDENTIFICATION);
              this.onIdentificationError(clientX, clientY);
            }
            this.canClick = true;
          }
        });
      } else if (isAlreadyIdentified) {
        this.sendMessage(GameEvent.ERROR_IDENTIFICATION);
        this.onIdentificationError(clientX, clientY);
      }
    }
  }

  public startTimer(): void {
    const second: number = 1000;
    this.timerInterval = window.setInterval(() => { this.elapsedTime += second; }, second);
  }

  public stopTimer(): void {
    window.clearInterval(this.timerInterval);
  }

  public onIdentificationError(offsetX: number, offsetY: number): void {
    const WAITINGTIME: number = 1000;
    this.errorCoordinateX = offsetX + "px";
    this.errorCoordinateY = offsetY + "px";
    this.isError = true;
    this.errorSound.play().catch((err) => { return; });
    setTimeout(() => {
       this.isError = false;
      },
               WAITINGTIME);
  }

  public quitGame(): void {
    try {
      this.popupService.openConfirmationLeaveGameDialog("quitter", this.currentGame._id, GameType.SIMPLE, this.nPlayers);
    } catch (err) {
      this.popupService.openSnackBar("Veuillez patienter SVP");
    }
  }

  private onDifferenceFound(message: IDifferenceIdentificationMessage): void {
    this.sendMessage(GameEvent.DIFFERENCE_FOUND);

    if (this.nPlayers === GameMode.SOLO) {
      this.nDifferencesFoundSolo++;
    }
    this.differenceSound.play().catch(() => { return; });

    for (const coord of message.coordinates as ICoordinate[]) {
      this.identifiedDifferences[coord.x][coord.y] = true;
    }
    this.replacePixels(message.newModifiedImageURL as string);

    // -- END SOLO SIMPLE GAME -- //
    if (this.nDifferencesFoundSolo === SimpleGameViewComponent.MAX_DIFFERENCES_SOLO) {
      this.endSoloGame();
    }
  }

  private replacePixels(newModifiedURL: string): void {
    if (this.nPlayers === GameMode.SOLO) {
      this.currentGame.modifiedImageURL = newModifiedURL;
    } else { // DUO GAME UPDATE : modified image, number of difference found and identifiedDifferences
      this.socketService.simpleDifferenceFound(this.currentDuoGame.idDuo, newModifiedURL, this.identifiedDifferences);
    }
  }

  private createFormData(): FormData {
    const formData: FormData = new FormData();
    formData.append("originalImage", this.imageService.dataUrlToBlob(this.currentGame.originalImageURL));
    formData.append("modifiedImage", this.imageService.dataUrlToBlob(this.currentGame.modifiedImageURL));

    return formData;
  }

  private checkIfNewBestScore(): void {
    const time: Date = new Date(this.elapsedTime);
    const PADDING: number = 2;
    const ZERO: string = "0";
    const timeString: string = time.getMinutes().toString().padStart(PADDING, ZERO) + ":"
      + time.getSeconds().toString().padStart(PADDING, ZERO);
    this.socketService.checkIfNewBestScore(this.currentGame._id, GameType.SIMPLE, this.nPlayers, timeString);
  }

  private sendMessage(event: GameEvent): void {
    const message: IGameMessage =  { event: event, gameName: this.currentGame.name, nPlayers: this.nPlayers };
    this.socketService.sendPrivateMessage(message, this.currentGame._id, (this.nPlayers === GameMode.DUO ? this.currentDuoGame.idDuo : -1));
  }

  private endDuoGame(message: Message): void {
    this.stopTimer();
    if (message.title === Title.WINNER) {
      this.checkIfNewBestScore();
    }
    this.socketService.modifyGame(SocketEvent.REMOVE_ON_GOING_GAME, this.currentGame._id, GameType.SIMPLE);
    this.popupService.openEndGameDialog(message.body);
  }

  private endSoloGame(): void {
    this.stopTimer();
    this.checkIfNewBestScore();
    this.socketService.modifyGame(SocketEvent.REMOVE_ON_GOING_GAME, this.currentGame._id, GameType.SIMPLE);
    this.popupService.openEndGameDialog("Félicitation vous avez trouvé les 7 différences!");
  }

  private initGame(): void {
    this.route.params.subscribe((params: Params) => {
      this.nPlayers = params["nPlayers"];
      this.getSimpleGame(params["id"]);
    });
  }

  private getSimpleGame(id: string): void {
    this.gameService.getGame(id, GameType.SIMPLE, this.nPlayers).subscribe((game: ISimpleGame) => {
      this.currentGame = game;
      if (this.nPlayers === GameMode.SOLO) {
        this.socketService.addGame<ISimpleGame>(SocketEvent.NEW_ON_GOING_GAME, game);
      }
      this.startTimer();
    });
  }

  private initDuoGame(): void {
    if (this.nPlayers === GameMode.DUO) {
      this.gameService.getDuoGame(this.currentUser.username).subscribe((game: IDuoGame) => {
        this.currentDuoGame = game;
      });
    }
  }

  @HostListener("window:beforeunload", ["$event"])
  public disconnect(event: Event): void {
    setTimeout(() => {
      const CONNECTION_SCREEN_URL: string = "/connect";
      window.location.href = CONNECTION_SCREEN_URL;
      event.returnValue = false;
    });
  }
}
