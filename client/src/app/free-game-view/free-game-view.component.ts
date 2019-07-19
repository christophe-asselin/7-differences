import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from "@angular/core";
import * as THREE from "three";

import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { GameEvent, GameMode, GameType } from "../../../../common/GameEnum";
import { IDuoGame } from "../../../../common/IDuoGame";
import { IFreeGame } from "../../../../common/IFreeGame";
import { IGameMessage } from "../../../../common/IGameMessage";
import { IUser } from "../../../../common/IUser";
import { SocketEvent } from "../../../../common/SocketEvent";
import { Title } from "../../../../common/communication/TitleEnum";
import { Message } from "../../../../common/communication/message";
import { RenderService } from "../game3-d/render.service";
import { FreeDifferenceService} from "../services/free-difference.service";
import { GameService } from "../services/game.service";
import { PopupService } from "../services/popup.service";
import { SocketService } from "../services/socket.service";

@Component({
  selector: "app-free-game-view",
  templateUrl: "./free-game-view.component.html",
  styleUrls: ["./free-game-view.component.css"],
})
export class FreeGameViewComponent implements AfterViewInit, OnInit, OnDestroy {

  private static readonly MAX_DIFFERENCES_SOLO: number = 7;

  @ViewChild("scene3DOriginal")
  private containerOrignalRef: ElementRef<HTMLDivElement>;

  @ViewChild("scene3DModified")
  private containerModifiedRef: ElementRef<HTMLDivElement>;

  @ViewChild("scene3DOriginalLoad")
  private scene3DOriginalLoadRef: ElementRef<HTMLDivElement>;

  @ViewChild("scene3DModifiedLoad")
  private scene3DModifiedLoadRef: ElementRef<HTMLDivElement>;

  public currentGame: IFreeGame;
  public currentDuoGame: IDuoGame;
  public currentUser: IUser;
  public nPlayers: GameMode;

  public elapsedTime: number;
  public errorCoordinateX: string;
  public errorCoordinateY: string;
  public nDifferencesFoundSolo: number;
  public clickFlag: boolean;

  private isInErrorState: boolean;
  private identifiedDifferences: number[];
  private differenceSound: HTMLAudioElement;
  private errorSound: HTMLAudioElement;
  private timerInterval: number;
  private cheatModeOn: boolean;

  private onFreeDifferenceFound: Subscription;
  private onEndDuoGame: Subscription;
  private onLeaveDuoGame: Subscription;

  public constructor(private route: ActivatedRoute,
                     private gameService: GameService,
                     private renderService: RenderService,
                     private freeDifferenceService: FreeDifferenceService,
                     private socketService: SocketService,
                     private popupService: PopupService,
                     private changeDetectorRef: ChangeDetectorRef) {
    this.identifiedDifferences = [];
    this.isInErrorState = false;
    this.differenceSound = new Audio("./assets/diff_sound_short.wav");
    this.errorSound =  new Audio("./assets/identification_error_sound.wav");

    this.currentUser = this.socketService.getUser();
    this.initNPlayers();
    this.elapsedTime = 0;
    this.cheatModeOn = false;

    this.clickFlag = true;

    this.nDifferencesFoundSolo = 0;

  }

  public ngOnInit(): void {
    if (this.nPlayers === GameMode.DUO) {
      this.onFreeDifferenceFound = this.socketService.onEvent<IDuoGame>(SocketEvent.FREE_DIFFERENCE_FOUND)
      .subscribe((game: IDuoGame) => {
        this.currentDuoGame = game;
        this.renderService.restoreDifference(game.object3DIndex as number);
        this.identifiedDifferences.push(game.object3DIndex as number);
      });
      this.onEndDuoGame = this.socketService.onEvent<Message>(SocketEvent.END_DUO_GAME).subscribe((message: Message) => {
        // -- END DUO FREE GAME -- //
        this.endDuoGame(message);
      });
      this.onLeaveDuoGame = this.socketService.onEvent<void>(SocketEvent.QUIT_DUO_GAME).subscribe(() => {
        const message: Message = {title: Title.QUIT, body: "Votre adversaire a quitté la partie."};
        this.endDuoGame(message);
      });
    }
  }

  public ngAfterViewInit(): void {
    this.cheatModeOn = false;
    this.initGame();
    this.initDuoGame();
    this.changeDetectorRef.detectChanges();
  }

  public ngOnDestroy(): void {
    if (this.nPlayers === GameMode.DUO) {
      this.onFreeDifferenceFound.unsubscribe();
      this.onEndDuoGame.unsubscribe();
      this.onLeaveDuoGame.unsubscribe();
    }
  }

  public initNPlayers(): void {
    this.route.params.subscribe((params) => {
      this.nPlayers = params["nPlayers"];
    });
  }

  public initGame(): void {
    this.route.params.subscribe((params) => {
      this.getFreeGame(params["id"]);
    });
  }

  public startTimer(): void {
    const SECOND: number = 1000;
    this.timerInterval = window.setInterval(() => { this.elapsedTime += SECOND; }, SECOND);
  }

  public stopTimer(): void {
    window.clearInterval(this.timerInterval);
  }

  public onSceneClick(offsetX: number, offsetY: number, clientX: number, clientY: number): void {
    if (!this.clickFlag) {
      return;
    }
    const clickPosition: THREE.Vector2 = new THREE.Vector2();
    const MULTIPLIER: number = 2;
    clickPosition.x = (offsetX / this.containerOrignalRef.nativeElement.clientWidth) * MULTIPLIER - 1;
    clickPosition.y = - (offsetY / this.containerOrignalRef.nativeElement.clientHeight) * MULTIPLIER + 1;

    const index: number = this.freeDifferenceService.findClickedObjectIndex(clickPosition);
    const isValidClick: boolean = !this.alreadyIdentified(index) && !this.isInErrorState;
    if (isValidClick) {
      this.freeDifferenceService.compareObjectInScenes(this.currentGame._id, index).subscribe((isDifference: boolean) => {
        if (isDifference) {
          this.onDifferenceFound(index);
        } else {
          this.onIdentificationError(clientX, clientY);
        }
      });
    } else if (this.alreadyIdentified(index)) {
      this.onIdentificationError(clientX, clientY);
    }
  }

  public setClickFlag(): void {
    this.clickFlag = true;
  }

  public resetClickFlag(): void {
    this.clickFlag = false;
  }

  public quitGame(): void {
    if (this.cheatModeOn) { this.renderService.deactivateCheatMode(); }
    try {
      this.popupService.openConfirmationLeaveGameDialog("quitter", this.currentGame._id, GameType.FREE, this.nPlayers);
    } catch (err) {
      this.popupService.openSnackBar("Veuillez patienter SVP");
    }
  }

  private alreadyIdentified(index: number): boolean {

    return (this.identifiedDifferences.includes(index));
  }

  private onDifferenceFound(index: number): void {
    if (this.nPlayers === GameMode.SOLO) {
      this.nDifferencesFoundSolo++;
    }
    this.sendMessage(GameEvent.DIFFERENCE_FOUND);

    this.differenceSound.play().catch(() => { return; });
    if (this.nPlayers === GameMode.SOLO) {
      this.renderService.restoreDifference(index);
      this.identifiedDifferences.push(index);
    } else { /* DUO GAME UPDATE : modified scene, number of difference found and identifiedDifferences */
      this.socketService.freeDifferenceFound(this.currentDuoGame.idDuo, index);
    }
    // -- END SOLO FREE GAME -- //
    if (this.nDifferencesFoundSolo === FreeGameViewComponent.MAX_DIFFERENCES_SOLO) {
      this.endSoloGame();
    }

  }

  public onIdentificationError(clientX: number, clientY: number): void {
    this.sendMessage(GameEvent.ERROR_IDENTIFICATION);

    const WAITINGTIME: number = 1000;
    this.errorCoordinateX = clientX + "px";
    this.errorCoordinateY = clientY + "px";
    this.isInErrorState = true;
    this.errorSound.play().catch((err) => { return; });
    setTimeout(() => {this.isInErrorState = false; }, WAITINGTIME);
  }

  private endDuoGame(message: Message): void {
    if (this.cheatModeOn) { this.renderService.deactivateCheatMode(); }
    this.stopTimer();
    if (message.title === Title.WINNER) {
      this.checkIfNewBestScore();
    }
    this.socketService.modifyGame(SocketEvent.REMOVE_ON_GOING_GAME, this.currentGame._id, GameType.FREE);
    this.popupService.openEndGameDialog(message.body);
  }

  private endSoloGame(): void {
    if (this.cheatModeOn) { this.renderService.deactivateCheatMode(); }
    this.stopTimer();
    this.checkIfNewBestScore();
    this.socketService.modifyGame(SocketEvent.REMOVE_ON_GOING_GAME, this.currentGame._id, GameType.FREE);
    this.popupService.openEndGameDialog("Félicitation vous avez trouvé les 7 différences!");
  }

  private checkIfNewBestScore(): void {
    const time: Date = new Date(this.elapsedTime);
    const PADDING: number = 2;
    const ZERO: string = "0";
    const timeString: string = time.getMinutes().toString().padStart(PADDING, ZERO) + ":"
      + time.getSeconds().toString().padStart(PADDING, ZERO);
    this.socketService.checkIfNewBestScore(this.currentGame._id, GameType.FREE, this.nPlayers, timeString);
  }

  private sendMessage(event: GameEvent): void {
    const message: IGameMessage =  { event: event, gameName: this.currentGame.name, nPlayers: this.nPlayers };
    this.socketService.sendPrivateMessage(message, this.currentGame._id, (this.nPlayers === GameMode.DUO ? this.currentDuoGame.idDuo : -1));
  }

  private  getFreeGame(id: string): void {
    this.gameService.getGame(id, GameType.FREE, this.nPlayers).subscribe((game: IFreeGame) => {
      this.cheatModeOn = false;
      this.currentGame = game;
      if (this.nPlayers === GameMode.SOLO) {
        this.socketService.addGame<IFreeGame>(SocketEvent.NEW_ON_GOING_GAME, game);
      }
      this.renderService.initialize(this.containerOrignalRef.nativeElement, this.containerModifiedRef.nativeElement,
                                    this.currentGame).then(() => {
        this.scene3DOriginalLoadRef.nativeElement.style.display = "none";
        this.scene3DModifiedLoadRef.nativeElement.style.display = "none";
        this.freeDifferenceService.setOriginalSceneObjects(this.renderService.originalObjects);
        this.freeDifferenceService.setCamera(this.renderService.camera);
        this.startTimer();
      }).catch();
    });
  }

  private initDuoGame(): void {
    if (this.nPlayers === GameMode.DUO) {
      this.gameService.getDuoGame(this.currentUser.username).subscribe((game: IDuoGame) => {
        this.currentDuoGame = game;
      });
    }
  }

  @HostListener("window:keydown.t", ["$event"])
  public toogleCheatMode(event: KeyboardEvent): void {
    (this.cheatModeOn) ? this.renderService.deactivateCheatMode() : this.renderService.activateCheatMode();
    this.cheatModeOn = !this.cheatModeOn;
  }

  @HostListener("window:beforeunload", ["$event"])
  public disconnect(event: Event): void {
    setTimeout(() => {
      window.location.href = "/connect";
      event.returnValue = false;
    });
  }
}
