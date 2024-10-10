export class leaderboardDto{
    name:string;
    userPoints:number;
    userProfileImage:string;
    userId:string;
    rank:number;
}

export type LeaderboardArray = leaderboardDto[];