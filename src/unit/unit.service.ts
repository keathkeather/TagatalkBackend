import { Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SkillService } from '../skill/skill.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserProgressService } from '../user-progress/user-progress.service';
import { filter } from 'rxjs';
import { GameAssetsService } from '../game-assets/game-assets.service';
@Injectable()
export class UnitService {
    @Inject()
    private gameAssetService:GameAssetsService
    constructor(
        private readonly prisma: PrismaService,
        private readonly skillService:SkillService,
        private readonly jwtService:JwtService,
        @Inject(forwardRef(() => UserProgressService)) private readonly userProgressService: UserProgressService) {}

    async getAllUnits() {
        return this.prisma.unit.findMany();
    }
    async createUnit(unitName: string, skillName: string) {
        try {
          const skill = await this.skillService.getSkillByName(skillName);
      
          // Query the maximum unitNumber from the Unit table
          const maxUnitNumber = await this.prisma.unit.findMany({
            take: 1,
            where:{
              skill:{
                skillName:skillName
              }
            },
            orderBy: {
              unitNumber: 'desc',
            },
            select: {
              unitNumber: true,
            },
          });
          // Determine the new unitNumber
          const newUnitNumber = maxUnitNumber.length > 0 ? maxUnitNumber[0].unitNumber + 1 : 1;
      
          // Create the new unit with the calculated unitNumber
          const unit = await this.prisma.unit.create({
            data: {
              unitName: unitName,
              skillId: skill.id,
              unitNumber: newUnitNumber,    
            },
          });
      
          if (!unit) {
            throw new InternalServerErrorException('Error while creating unit');
          }
      
          return unit;
        } catch (error) {
          console.error(error);
          throw new InternalServerErrorException('Error while creating unit');
        }
      }
      
    async getUnitByUnitNumber(unitNumber:number,skillName:string){
        try{
            const unit = await this.prisma.unit.findFirst({
                where:{
                    unitNumber:unitNumber,
                    skill:{
                        skillName:skillName
                    }
                }
            })
            if(!unit){
                throw new InternalServerErrorException('Error while fetching unit')
            }
            return unit;
        }catch(error){
            console.log(error)
            throw new InternalServerErrorException('Error while fetching unit')
        }
    }
    async getCourseTree(request:Request , skillName:string){
      const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
      const userId = decoded.authId;
      
      const units = await this.prisma.unit.findMany({
        where:{
          skill:{
            skillName:skillName
          }
        },
        include:{
          lesson:{
            include:{
              game:true
            }
          }
        }
      })
      const userProgress = await this.userProgressService.getUserProgressById(userId);
      const lessonProgressMap = new Map(userProgress.map((progress) => [progress.lessonId, progress.isCompleted]));
      let showNextUnit = true;
      const filteredUnits = [];
      for(const unit of units){
        if(unit.lesson.length === 0){
          unit['isComplete'] = false;
          continue;
        }
        
        for(const lesson of unit.lesson){
          lesson['isComplete'] = lessonProgressMap.get(lesson.id) === true;
          for(const game of lesson.game){
            game['isComplete'] = lessonProgressMap.get(game.id) === true;
            game['gameAssets'] = await this.gameAssetService.fetchAllAssets(game.id);
          }
        }

        const allLessonsComplete = unit.lesson.every((lesson) => lesson['isComplete'] === true);
        unit['isComplete'] = allLessonsComplete;
        if(unit['isComplete']||showNextUnit){
          filteredUnits.push(unit);
          
          showNextUnit = unit['isComplete'];
        }
      }
      
        return filteredUnits;
    }
    // async getCourseTree(request: Request, skillName: string) {
    //   try {
    //     const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1], {
    //       secret: process.env.SECRET_KEY,
    //     });
    //     const userID = decoded.authId;
    //     const units = await this.prisma.unit.findMany({
    //       where: {
    //         skill: {
    //           skillName: skillName,
    //         },
    //       },
    //       include: {
    //         lesson: {
    //           include: {
    //             game: true,
    //           },
    //         },
    //       },
    //     });
    
    //     // * fetch user Progress
    //     console.log(userID);
    //     const userProgress = await this.userProgressService.getUserProgressById(userID);
    
    //     // * map to get check if the game is complete
    //     const gameProgressMap = new Map(userProgress.map((progress) => [progress.gameId, progress.isCompleted]));
    //     console.log(gameProgressMap)
    //     for (const unit of units) {
    //       if (unit.lesson.length === 0) {
    //         // If there are no lessons, set isComplete to false
    //         unit['isComplete'] = false;
    //         continue;
    //       }
    
    //       for (const lesson of unit.lesson) {
    //         const allGamesComplete = lesson.game.every((game) => gameProgressMap.get(game.id) === true);
    //         lesson['isComplete'] = allGamesComplete;
    //       }
    
    //       const allLessonsComplete = unit.lesson.every((lesson) => lesson['isComplete'] === true);
    //       unit['isComplete'] = allLessonsComplete;
    //     }
    
    //     const filteredUnits = [];
    //     let showNextUnit = true;
    //     for (const unit of units) {
    //       if (unit['isComplete'] || showNextUnit) {
    //         filteredUnits.push(unit);
    //         showNextUnit = unit['isComplete'];
    //       }
    //     }
    
    //     return filteredUnits;
    //   } catch (error) {
    //     console.log(error);
    //     throw new InternalServerErrorException('Error while fetching course tree');
    //   }
    // }
    
    
}
