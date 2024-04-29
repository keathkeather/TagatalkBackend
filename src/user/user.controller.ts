import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

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
}
