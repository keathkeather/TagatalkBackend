export class fileAssetDto{
    assetId:string;
    gameId:string;
    assetClassifier:string;
    assetType:string;
    filename:string;
    fileUrl: string;
    isCorrectAnswer:boolean;
}

export type fileAssetArray= fileAssetDto[]