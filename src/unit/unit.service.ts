import { Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Unit } from '@prisma/client';
import { SkillService } from '../skill/skill.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Game,Lesson } from '@prisma/client';
import { UserProgressService } from '../user-progress/user-progress.service';
@Injectable()
export class UnitService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly skillService:SkillService,
        private readonly jwtService:JwtService,
        private readonly  userService:UserService, 
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
      
    async getUnitByUnitNumber(unitNumber:number){
        try{
            const unit = await this.prisma.unit.findFirst({
                where:{
                    unitNumber:unitNumber
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

    async getCourseTree(request: Request, skillName: string) {
      try {
        const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1], {
          secret: process.env.SECRET_KEY,
        });
        const user = await this.userService.getUserById(decoded.authId);
    
        const units = await this.prisma.unit.findMany({
          where: {
            skill: {
              skillName: skillName,
            },
          },
          include: {
            lesson: {
              include: {
                game: true,
              },
            },
          },
        });
    
        // * fetch user Progress
        const userProgress = await this.userProgressService.getUserProgressById(user.userId);
    
        // * map to get check if the game is complete
        const gameProgressMap = new Map(userProgress.map((progress) => [progress.gameId, progress.isCompleted]));
    
        for (const unit of units) {
          if (unit.lesson.length === 0) {
            // If there are no lessons, set isComplete to false
            unit['isComplete'] = false;
            continue;
          }
    
          for (const lesson of unit.lesson) {
            const allGamesComplete = lesson.game.every((game) => gameProgressMap.get(game.id) === true);
            lesson['isComplete'] = allGamesComplete;
          }
    
          const allLessonsComplete = unit.lesson.every((lesson) => lesson['isComplete'] === true);
          unit['isComplete'] = allLessonsComplete;
        }
    
        const filteredUnits = [];
        let showNextUnit = true;
        for (const unit of units) {
          if (unit['isComplete'] || showNextUnit) {
            filteredUnits.push(unit);
            showNextUnit = unit['isComplete'];
          }
        }
    
        return filteredUnits;
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException('Error while fetching course tree');
      }
    }
    
    
}
