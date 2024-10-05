export class textAssetDto{
    assetId:string;
    gameId:string;
    assetClassifier:string
    assetName:string;
    assetType:string;
    textContent:string;
    isCorrectAnswer:boolean;
}

export type textAssetArray= textAssetDto[]