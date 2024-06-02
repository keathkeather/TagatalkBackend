import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class SkillService {
    constructor(private prisma: PrismaService) {}
    async getAllSkills(){
        return this.prisma.skill.findMany();
    }

    async getSkillByName(skillName:string){ 
        try{
            const skill = await  this.prisma.skill.findFirst({
                where:{
                    skillName:skillName
                }
            });
            if(!skill){
                throw new InternalServerErrorException('Skill not found');
            }
            return skill;
        }catch(error){
            console.log(error);
            throw new InternalServerErrorException('Error while fetching skill by name');
        }
    }


    async createSkill(skillName:string){
        try{
            return this.prisma.skill.create({
                data:{
                    skillName:skillName
                }
            });
        }catch(error){
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    
}
