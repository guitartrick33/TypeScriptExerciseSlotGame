import * as PIXI from 'pixi.js';
import { Reel } from './Reel';
import { ResultController } from './ResultController';
import { PlayerProfile } from './PlayerProfile';
import { Symbol } from './Symbol';
import { EventHandler } from './EventHandler';
import { Config } from './Config';

export class GameController
{
    private static instance: GameController;

    config: Config;

    reels: Reel[];
    
    spinTicker: PIXI.Ticker;
    winningsTicker: PIXI.Ticker;

    lineWinIntervalID?: NodeJS.Timeout;
    autoplayIntervalID?: NodeJS.Timeout;

    resultController: ResultController;

    playerProfile: PlayerProfile;

    autoplayEnabled: boolean;

    eventHandler?: EventHandler;

    constructor()
    {
        this.config = new Config();
        this.reels = [];
        this.spinTicker = new PIXI.Ticker;
        this.winningsTicker = new PIXI.Ticker;
        this.resultController = new ResultController();
        this.playerProfile = new PlayerProfile(0.1, 1000); //example values - bet = bet * denom -> 1000* 0.1 => 10 *bet is static, but could be dynamic from an array of bets*    ! can add any currency to it !
        this.autoplayEnabled = false;
    }

    //declares the singleton
    public static Singleton(): GameController {
        if (!GameController.instance) {
            GameController.instance = new GameController();
        }
        return GameController.instance;
    }

    //set existing gamecontroller instance in the index.ts
    public static SetSingleton(existingInstance: GameController): void {
        GameController.instance = existingInstance;
    }

    public SetEventHandler(eventHandler: EventHandler)
    {
        this.eventHandler = eventHandler;
    }


    //UPDATE WINNINGS SYMBOL FRAMES WITH WINNING LINE COLOR
    async UpdateSymbolFrames(enabled: boolean, index: number)
    {
        const winningSymbols = this.resultController.listWinningSymbols[index];
        if (winningSymbols) { 
            for (let i = 0; i < winningSymbols.length; i++) {
                winningSymbols[i].frameSprite.visible = enabled;
                winningSymbols[i].frameSprite.tint = this.resultController.listWinningColors[index];
            }
        }
    }

    //REMOVE ALL WINNING SYMBOL FRAMES DURING COLLECT/PLAY
    async DisableAllSymbolFrames()
    {
        for (let i = 0; i < this.reels.length; i++) 
        {
            for (let j = 0; j < this.reels[i].symbols.length; j++) 
            {
                if(this.reels[i].symbols[j].isActive)
                {
                    this.reels[i].symbols[j].frameSprite.visible = false;
                }
            }
        }
    }   

    //TICKER INITIALIZER FOR REEL SPINS 
    async InitializeSpinTicker()
    {
        this.spinTicker.add((deltaTime) => {
            this.reels.forEach(reel => {
                reel.StartSpin(deltaTime.deltaTime);
            });
        });
    }

    //TRIES TO INITIATE SPIN BASED ON CURRENT CREDITS/WINNINGS
    async TrySpin()
    {
        //checks if there are winnings, if yes -> collect them first before spinning again
        if(this.playerProfile.winnings > 0)
        {
            this.playerProfile.CollectWinnings();
            this.eventHandler?.eventEmiter.emit('CollectWinnings', this.playerProfile.winnings);
            return;
        }

        if(!this.CheckIfSpinning() && this.playerProfile.CanBet())
        {
            this.StartSpin();
            this.eventHandler?.eventEmiter.emit('StartSpin');
        }
    }

    //INITIATE SPIN
    async StartSpin() {

        //reset the reels for spinning
        this.reels.forEach(reel => {
            reel.ResetRotations();
        });
    
        if(this.spinTicker.started) return; // don't initialize another ticker
        
        //create a ticker to server as symbol spin animator
        this.spinTicker.start();
    }

    //CHECKS IF REELS ARE STILL SPINNING
    CheckIfSpinning(): boolean 
    {
        let spinning = false;
        this.reels.forEach(reel => {
            if(reel.isSpinning)
            {
                spinning = true;
            }
        });
        return spinning;
    }

    //CHECK WINNINGS AT THE END OF EVERY SPIN
    SignalSpinEnd()
    {
        if (!this.CheckIfSpinning()) 
        {
            let symbolArray: Symbol[] = [];
        
            for (let i = 0; i < this.reels.length; i++) 
            {
                for (let j = 0; j < this.reels[i].symbols.length; j++) 
                {
                    if(this.reels[i].symbols[j].isActive)
                    {
                        symbolArray.push(this.reels[i].symbols[j]);
                    }
                }
            }
            this.resultController.CheckLineResult(symbolArray, this.playerProfile.BetValue());
        }
    }


    //ACCUMULATE WINNINGS - READY TO COLLECT
    AccumulateWinnings(winnings: number)
    {
        this.playerProfile.winnings = winnings;
    }
}