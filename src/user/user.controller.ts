import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Req,Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Request,Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @Get('getAllUser')
    async getAllUser(){
        return this.userService.getAllUser();
    }
    @Get('getUserById/:userId')
    async getUserById(@Param('userId')userID:string){
      return  this.userService.getUserById(userID);    
    }
    @Get('getUserByEmail/:email')
    async getUserByEmail(@Param('email')email:string){
        return this.userService.getUserByEmail(email);
    }
    @Put('addUserName')
    @UseGuards(JwtAuthGuard)
    async addUsername(@Req() request:Request, @Body('name') username:string ){
        // console.log(request, username)
        return this.userService.addUserName(request, username);
    
    }

    @Put('editUser')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('Profile', {
        limits: {
          fileSize: 2 * 1024 * 1024, // 2MB
        },
      }))
    async editUser(@UploadedFile() Files,@Req() request:Request, @Body('name') username:string , @Body('profileDescription') profileDescription:string ){
        return await this.userService.editUserProfile(Files,request,username,profileDescription)
    
    }

    @Get('getUserData')
    @UseGuards(JwtAuthGuard)
    async getUserData(@Req() request:Request){
        return this.userService.getUserData(request);
    }   
    // @Post('addUserProgress')
    // @UseGuards(JwtAuthGuard)
    // async addUserProgress(@Req() request:Request, @Body('gameId') gameId: string,@Res() response:Response){
    //     return  this.userService.addUserProgress(request,gameId,response);
    // }
    // @Post('addAllProgress/:userId')
    // async adduserProgress(@Param('userId') userId:string){
    //     return this.userService.addAllGamesToUserProgress(userId)
    // }
    // @Get('getAllGamesForUser/:gameSkill')
    // @UseGuards(JwtAuthGuard)
    // async getAllGamesForUser(@Req() request:Request , @Param('gameSkill') gameSkill:string){
    //     return this.userService.getGameForUser(request,gameSkill)
    // }
    // @Get('getAllGamesForCourseTree/:gameSkill')
    // @UseGuards(JwtAuthGuard)
    // async getAllGamesForCourseTree(@Req() request:Request, @Param('gameSkill') gameSkill:string){
    //     return this.userService.getUserCourseTree(request,gameSkill)
    // }
    // @Get('getLesson/:gameSkill')
    // @UseGuards(JwtAuthGuard)
    // async getUserLessons(@Req() request:Request, @Param('gameSkill') gameSkill:string){
    //     return this.userService.getUserGamesPerLesson(request,gameSkill)
    // }
   

}
