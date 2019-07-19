import { Component, OnDestroy, OnInit } from "@angular/core";

import { Subscription } from "rxjs";
import { GameEvent, GameMode } from "../../../../common/GameEnum";
import { IGameMessage } from "../../../../common/IGameMessage";
import { SocketEvent } from "../../../../common/SocketEvent";
import { SocketService } from "../services/socket.service";

@Component({
  selector: "app-game-messages",
  templateUrl: "./game-messages.component.html",
  styleUrls: ["./game-messages.component.css"],
})
export class GameMessagesComponent implements OnInit, OnDestroy {

  public messages: string[];

  private onMessage: Subscription;

  public constructor(private socketService: SocketService) {
    this.messages = [];
  }

  public ngOnInit(): void {
    this.onMessage = this.socketService.onEvent<IGameMessage>(SocketEvent.NEW_MESSAGE).subscribe((message: IGameMessage) => {
      const newMessage: string = this.generateMessage(message);
      this.messages.push(newMessage);
    });
  }

  public ngOnDestroy(): void {
    this.onMessage.unsubscribe();
  }

  private generateMessage(message: IGameMessage): string {
    const now: Date = new Date();
    const PADDING: number = 2;
    const time: string = now.getHours().toString().padStart(PADDING, "0") + ":"
      + now.getMinutes().toString().padStart(PADDING, "0") + ":"
      + now.getSeconds().toString().padStart(PADDING, "0");

    let newMessage: string = time;
    switch (message.event) {
      case GameEvent.CONNECT:
        newMessage += " - " + message.username + " vient de se connecter.";
        break;
      case GameEvent.DISCONNECT:
        newMessage += " - " + message.username + " vient de se déconnecter.";
        break;
      case GameEvent.DIFFERENCE_FOUND:
        newMessage += " - Différence trouvée" + (message.nPlayers === GameMode.DUO ? " par " + message.username : "") + ".";
        break;
      case GameEvent.ERROR_IDENTIFICATION:
        newMessage += " - Erreur" + (message.nPlayers === GameMode.DUO ? " par " + message.username : "") + ".";
        break;
      case GameEvent.BEST_SCORE:
        newMessage += " - " + message.username + " obtient la " + message.position
          + " place dans les meilleurs temps du jeu " + message.gameName + " " + message.nPlayers + ".";
        break;
      default: break;
    }

    return newMessage;
  }

}
