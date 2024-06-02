import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Unit } from '@prisma/client';
import { UnitService } from '../unit/unit.service';

@Injectable()
export class LessonService {
    constructor(private prisma:PrismaService , @Inject(forwardRef(() => UnitService)) private unitService: UnitService) {}

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
    async createLesson(lessonName:string,unitNumber:number,skillName:string){
        try{
            const unit = await this.unitService.getUnitByUnitNumber(unitNumber);
            if(!unit){
                throw new Error('Unit not found')
            }
            const maxLessonNumber = await this.prisma.lesson.findMany({
                take:1,
                where:{
                    unitId:unit.id,
                    unit:{
                        skill:{
                            skillName:skillName
                        }
                    }
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
                    unitId:unit.id,
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
