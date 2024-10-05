export class fileAssetDto{
    assetId:string;
    assetClassifier:string;
    assetType:string;
    filename:string;
    fileUrl: string;
    isCorrectAnswer:boolean;
}

export type fileAssetArray= fileAssetDto[]