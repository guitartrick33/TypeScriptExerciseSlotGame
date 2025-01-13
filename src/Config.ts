export class Config
{
    nrOfReels:number = 5;
    symbolsPerReel:number = 3;
    
    reelStartPos: [number, number] = [300, 200];
    reelHeight: number = 600;
    reelWidth: number = 250;
    rotations: number = 3;

    wildPositions: number[] = [1,3];

    symbols = ['Apple', 'Banana', 'Bar', 'Cherry', 'Diamond', 'Orange', 'Seven'];

    minNumbersToMatch: number = 3;
}