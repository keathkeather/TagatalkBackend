export class courTreeDTO {
    gameUnit: string;
    gameUnitNumber: number;
    gameLesson: string;
    gameLessonNumber: number;
  
    constructor(data: Partial<courTreeDTO>) {
      this.gameUnit = data.gameUnit;
      this.gameUnitNumber = data.gameUnitNumber;
      this.gameLesson = data.gameLesson;
      this.gameLessonNumber = data.gameLessonNumber;
    }
  }