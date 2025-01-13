import * as PIXI from 'pixi.js';
import { EventEmitter } from 'pixi.js';
import { GameController } from "./GameController";
import { UIManager } from './UIManager';


export class EventHandler
{
    public static instance: EventHandler;

    eventEmiter: EventEmitter;
    gameController: GameController;
    uiManager: UIManager;

    public static Singleton(gameController: GameController, uiManager: UIManager): EventHandler {
        if (!EventHandler.instance) {
            EventHandler.instance = new EventHandler(gameController, uiManager);
        }
        return EventHandler.instance;
    }

    public static SetSingleton(existingInstance: EventHandler): void {
        if(this.instance === null)
        {
            EventHandler.instance = existingInstance;
        }
    }

    constructor(gameController: GameController, uiManager: UIManager)
    {
        this.eventEmiter = new EventEmitter();
        this.gameController = gameController;
        this.uiManager = uiManager;
    }

     async InitializeEventListener()
    {
        //ON REELS STOP SPINNING
        this.eventEmiter.on('StopSpin', () => {
            this.gameController.SignalSpinEnd();
        });


        //CHECK RESULTS -> IF WINNINGS - ACCUMULATE THEM
        this.eventEmiter.on('AccumulateWinnings', (data) => {
            this.gameController.AccumulateWinnings(data);
            if(data > 0)
            {
                this.uiManager.UpdateSpinButtonText("COLLECT");
                this.uiManager.UpdateWinningsText(data.toString());
                
                //IF MORE THAN 1 LINE WON -> CAROUSEL THROUGH LIST OF WINNINGS
                if(this.gameController.resultController.listWinningMessages.length > 1)
                {
                    let count = 0;

                    //DISPLAY FIRST WINNING
                    this.uiManager.UpdateInfoText(this.gameController.resultController.listWinningMessages[count]);
                    this.gameController.UpdateSymbolFrames(true, count);

                    //IF MORE THAN 1 LINE -> 4 SECONDS CAROUSEL
                    const interval = 4000;
                    this.gameController.lineWinIntervalID = setInterval(() => {
                        this.gameController.UpdateSymbolFrames(false, count);
                        count++
                        if(count >= this.gameController.resultController.listWinningMessages.length)
                        {
                            count = 0;
                        }

                        this.uiManager.UpdateInfoText(this.gameController.resultController.listWinningMessages[count]);
                        this.gameController.UpdateSymbolFrames(true, count);

                    }, interval);
                }
                //IF ONLY ONE WIN -> DISPLAY IT
                else
                {
                    this.uiManager.UpdateInfoText(this.gameController.resultController.listWinningMessages[0]);
                    this.gameController.UpdateSymbolFrames(true, 0);
                }
            }
            //NO WINNINGS
            else
            {
                this.uiManager.UpdateInfoText("TRY AGAIN!");
            }
        });



        //START SPINNING
        this.eventEmiter.on('StartSpin', () => {
            clearInterval(this.gameController.lineWinIntervalID);
            this.uiManager.UpdateInfoText("GOOD LUCK");
            this.uiManager.UpdateCreditsText(this.gameController.playerProfile.currentCredits.toString());
            this.gameController.DisableAllSymbolFrames();
        });



        //COLLECT WINNINGS
        this.eventEmiter.on('CollectWinnings', (data) => {
            clearInterval(this.gameController.lineWinIntervalID);
            this.uiManager.UpdateSpinButtonText("SPIN");
            this.uiManager.UpdateInfoText(`COLLECTED ${data} CREDITS!`);
            this.uiManager.UpdateWinningsText("0");
            this.uiManager.UpdateCreditsText(this.gameController.playerProfile.currentCredits.toString());
            this.gameController.DisableAllSymbolFrames();
        });
    }
}
