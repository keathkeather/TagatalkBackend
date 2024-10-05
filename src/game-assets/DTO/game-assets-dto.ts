import { textAssetDto } from './text-asset-dto';
import { fileAssetDto } from './file-asset-dto';
export type fileAssetArray = fileAssetDto[];
export type textAssetArray = textAssetDto[];

export class gameAssetsDto {
    gameId: string;
    fileAssets: fileAssetArray;
    textAssets: textAssetArray;
}