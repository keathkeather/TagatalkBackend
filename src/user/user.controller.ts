import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
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
}
