import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Unit } from '@prisma/client';
import { UnitService } from '../unit/unit.service';

@Injectable()
export class LessonService {
    constructor(private prisma:PrismaService ){}

    async getAllLessons(){
        return this.prisma.lesson.findMany();
    }
    async getLessonById(lessonId:string){
        try{
            const lesson = await this.prisma.lesson.findUnique({
                where:{
                    id:lessonId
                }
            })
            if(!lesson){
                throw new Error('Lesson not found')
            }
            return lesson;
        }catch(error){
            console.log(error)
            throw new Error('Error while fetching lesson')
        }
    }
    async createLesson(lessonName:string,unitId:string){
        try{
            
            const maxLessonNumber = await this.prisma.lesson.findMany({
                take:1,
                where:{
                    unitId:unitId
                   
                },
                orderBy:{
                    lessonNumber:'desc'
                },
                select:{
                    lessonNumber:true
                }
            });
            const newLessonNumber = maxLessonNumber.length > 0? maxLessonNumber[0].lessonNumber + 1 : 1;
            const lesson = await this.prisma.lesson.create({
                data:{
                    lessonName:lessonName,
                    unitId:unitId,
                    lessonNumber:newLessonNumber
                }
            })

            if(!lesson){
                throw new Error('Error while creating lesson')
            }
            return lesson;
        }catch(error){
            console.log(error)
            throw new Error('Error while creating lesson')
        }
    }

    async getLessonByLessonNumber(lessonNumber:number){
       try{
            const lesson = await this.prisma.lesson.findFirst({
                where:{
                    lessonNumber:lessonNumber
                }
            })
            if(!lesson){
                throw new Error('Lesson not found')
            }
            return lesson;

       }catch(error){
              console.log(error)
              throw new Error('Error while fetching lesson')
       }
    }


}
