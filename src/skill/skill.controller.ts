import { Body, Controller, Get, Post } from '@nestjs/common';
import { SkillService } from './skill.service';

@Controller('v1/skill')
export class SkillController {
    constructor(private skillService:SkillService) {}

    @Get('getAllSkills')
    async getAllSkills(){
        return this.skillService.getAllSkills();
    }

    @Post('createSkill')
    async createSkill(@Body('skillName') skillName:string){
        return this.skillService.createSkill(skillName);
    }

}
