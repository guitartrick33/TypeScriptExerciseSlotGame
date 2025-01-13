import * as PIXI from "pixi.js";
import { GameController } from "./GameController";

export class PlayerProfile
{
    bet: number;
    denom: number;
    currentCredits: number;

    currentBetIndex: number;
    betSteps: number[] = [100, 200, 300, 500, 1000]

    winnings: number = 0;

    constructor(denom: number, currentCredits: number)
    {
        this.currentBetIndex = 0;
        this.denom = denom;
        this.currentCredits = currentCredits;
        this.currentBetIndex = 0;
        this.bet = this.betSteps[this.currentBetIndex];
    }

    //INCREASES BET FROM THE BET STEPS VALUE
    IncreaseBet()
    {
        this.currentBetIndex++;
        if(this.currentBetIndex >= this.betSteps.length)
        {
            this.currentBetIndex = 0;
        }
        this.bet = this.betSteps[this.currentBetIndex];
    }

    //DECREASES BET FROM THE BET STEPS VALUE
    DecreaseBet()
    {
        this.currentBetIndex--;
        if(this.currentBetIndex < 0)
        {
            this.currentBetIndex = this.betSteps.length - 1;
        }
        this.bet = this.betSteps[this.currentBetIndex];
    }

    //EMULATES REAL LIFE SCENARIO
    BetValue(): number
    {
        return this.bet * this.denom;
    }

    //CHECKS WHETHER THE PLAYER HAS ENOUGH CREDITS TO PLAY
    CanBet(): boolean
    {
        if(this.currentCredits - this.bet * this.denom >= 0)
        {
            this.currentCredits -= this.BetValue();
            return true;
        }
        return false;
    }

    //ADD WINNINGS TO YOUR CURRENT CREDITS
    CollectWinnings()
    {
        this.currentCredits += this.winnings;
        this.winnings = 0;
    }
}