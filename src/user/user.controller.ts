import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
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

}
