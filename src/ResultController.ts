import * as PIXI from 'pixi.js';
import { GameController } from './GameController';
import { Symbol } from './Symbol';
import { EventHandler } from './EventHandler';

export class ResultController
{
    resultCoefs: Map<string, SingleResult>;

    resultArray: string[][];

    listWinningMessages: string[];
    listWinningSymbols: Symbol[][];
    listWinningColors: string[];


    totalWinnings: number = 0;

    MINIMUM_MATCHES: number = 3;

    
    line1: number[][] = [
        [1,1,1,1,1],
        [0,0,0,0,0],
        [0,0,0,0,0]
    ];
    
    line2: number[][] = [
        [0,0,0,0,0],
        [1,1,1,1,1],
        [0,0,0,0,0]
    ];
    
    line3: number[][] = [
        [0,0,0,0,0],
        [0,0,0,0,0],
        [1,1,1,1,1]
    ];

    line4: number[][] = [
        [1,0,0,0,1],
        [0,1,0,1,0],
        [0,0,1,0,0]
    ];

    line5: number[][] = [
        [0,0,1,0,0],
        [0,1,0,1,0],
        [1,0,0,0,1]
    ];
    
    listLines: [number[][], string] [] = [
        [this.line1, "#FFFF00"], 
        [this.line2, "#008000"], 
        [this.line3, "#FF0000"],
        [this.line4, "#00008B"],
        [this.line5, "#A020F0"]

    ];
    
    constructor()
    {
        this.resultCoefs = new Map();
        this.resultArray = [];
        this.listWinningMessages = [];
        this.listWinningSymbols = [];
        this.listWinningColors = [];

        this.FillDictionaryWithCoefs();
    }

    //COEFFICIENT EXAMPLES - NO CLUE HOW MAATHS WORK
    FillDictionaryWithCoefs()
    {
        this.resultCoefs.set('Apple', new SingleResult(15, 1.25))
        this.resultCoefs.set('Banana', new SingleResult(20, 1.25))
        this.resultCoefs.set('Bar', new SingleResult(25, 1.25))
        this.resultCoefs.set('Cherry', new SingleResult(50, 1.25))
        this.resultCoefs.set('Diamond', new SingleResult(75, 1.25))
        this.resultCoefs.set('Orange', new SingleResult(100, 1.25))
        this.resultCoefs.set('Seven', new SingleResult(150, 1.25))
    }

    //CHECKS A LINE AND RETURNS 1S POSITIONS - THAT WOULD BE THE WINNING LINE
    CheckLineValidity(array: any[][]): [number,number][]
    {
        let temp: [number, number][] = [];

        for (let j = 0; j < array[0].length; j++) {
            for (let i = 0; i < array.length; i++) {
                if (array[i][j] == 1) {
                    temp.push([i, j]);
                }
            }
        }
        return temp;
    }

    //FIRST SYMBOL ON THE LINE - OTHERS SYMBOLS TO BE COMPARED TO
    GetInitialLineSymbol(symbols: Symbol[], line: number[][]): string
    {
        let res: string = "";

        for(let i = 0; i < symbols.length; i++)
        {
            if(symbols[i].symbolID[1] - 1 == this.CheckLineValidity(line)[0][0] && symbols[i].symbolID[0] == this.CheckLineValidity(line)[0][1])
            {
                res = symbols[i].alias;
            }
        }
        
        return res;
    }
    
    //CREATES RESULTS BASED ON REEL COMBINATION AND SYMBOL MATCHES - WORKS WITH ANY LINE YOU ADD AS LONG AS ITS ROWS x REELS
    CheckLineResult(symbols: Symbol[], bet: number)
    {
        const MINIMUM_MATCHES = GameController.Singleton().config.minNumbersToMatch;
        
        this.listWinningMessages = [];
        this.listWinningSymbols = [];
        this.listWinningColors = [];
        this.totalWinnings = 0;
        
        for(let line = 0; line < this.listLines.length; line++)
            {
                let matches = 0;
                let selectedLineToCheck = this.listLines[line];
                let selectedSymbol = this.GetInitialLineSymbol(symbols, selectedLineToCheck[0]);
                let winningSymbols = [];
                let lineValidity = this.CheckLineValidity(selectedLineToCheck[0]);
            
            innerLineLoop: for (let i = 0; i < lineValidity.length; i++) 
                {
                    let row = lineValidity[i][0];
                    let reel = lineValidity[i][1];
                

                for(let j = 0; j < symbols.length; j++)
                {
                    if(symbols[j].symbolID[1] - 1 == row && symbols[j].symbolID[0] == reel) //gets the symbol on the correct line's position
                    {
                        if(symbols[j].alias == selectedSymbol || symbols[j].isWild) //checks whether the new symbol is equal to the initial symbol or WILD
                        {
                            matches++;
                            winningSymbols.push(symbols[j]);
                        }
                        else
                        {
                            break innerLineLoop;
                        }
                    }
                }
            }
            
            if(matches >= MINIMUM_MATCHES)
            {
                const result = this.resultCoefs.get(selectedSymbol);
                //for some reason typescript does not check if it's undefined or not dynamically so this check is necessary - still don't understand it but ok..
                if (result) 
                {
                    const creditsWon = result.GetResultWinningsInCredits(bet, matches);

                    let message = `Win on line ${line + 1}: ${matches}x${selectedSymbol} - ${creditsWon} credits won!`;
                    this.listWinningMessages.push(message);
                    this.listWinningSymbols.push(winningSymbols);
                    this.listWinningColors.push(selectedLineToCheck[1]);
                    this.totalWinnings += creditsWon;
                }   
            }
        }
        GameController.Singleton().eventHandler?.eventEmiter.emit('AccumulateWinnings', this.totalWinnings)
    }
}

export class SingleResult
{
    basicCoef: number;
    multiplier: number;

    constructor( basicCoef: number, multiplier: number)
    {
        this.basicCoef = basicCoef;
        this.multiplier = multiplier;
    }

    GetResultWinningsInCredits(bet:number, nrOfMatches: number): number
    {
        let temp = this.basicCoef;
        temp += this.basicCoef * bet + (this.multiplier * nrOfMatches); //this is a really bad way of calculating wins - will do for now
        return temp / 10;
    }
}