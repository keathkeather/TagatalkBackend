export class textAssetDto{
    assetId:string;
    assetClassifier:string
    assetName:string;
    assetType:string;
    textContent:string;
    isCorrectAnswer:boolean;
}

export type textAssetArray= textAssetDto[]