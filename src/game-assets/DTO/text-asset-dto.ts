export class textAssetDto{
    assetId:string;
    assetClassifier:string
    assetName:string;
    assetType:string;
    isCorrectAnswer:boolean;
}

export type textAssetArray= textAssetDto[]