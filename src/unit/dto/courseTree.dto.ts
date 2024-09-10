
export class courseTreeDto{
    unitId:string
    isComplete:boolean;
    lesson:lesson
}
class lesson{
    lessonId:string
    isComplete:boolean;
}


export type courseTreeArray = courseTreeDto[]