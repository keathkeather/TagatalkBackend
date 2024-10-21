import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { adminGuard } from '../auth/guards/admin.guard';
import { adminJwtGuard } from '../auth/guards/adminJwt.guard';
@Controller('v1/admin')
export class AdminController {
    constructor(private adminService: AdminService) {}
    @Get('users')
    @UseGuards(adminJwtGuard)
    async getAllUsers(@Req() request:Request){
        return this.adminService.getAllUsers(request);
    }

    @Get('reports')
    @UseGuards(adminJwtGuard)

    async getAllReports(@Req() request:Request){
        return this.adminService.getAllReports(request);
    }
    @Get('feedbacks')
    @UseGuards(adminJwtGuard)
    async getAllFeedbacks(@Req() request:Request){
        return this.adminService.getAllFeedbacks(request);
    }
    @Put('updateAdmin/:authId')
    async updateAdmin(@Param('authId') authId:string){
        return this.adminService.promoteUserToAdmin(authId);
    }
    @Put('banUser/:authId')
    @UseGuards(adminJwtGuard)
    async banUserById(@Param('authId') authId:string, @Body('month') month:number, @Body('days') days:number,@Req() request:Request){
        return this.adminService.banUserById(authId, month, days,request);
    }
    @Get('bannedUsers')
    @UseGuards(adminJwtGuard)
    async getAllBannedUsers(@Req() request:Request){
        return this.adminService.getAllBannedUsers(request);
    }
    @Put('banUserIndefinitely/:authId')
    @UseGuards(adminJwtGuard)
    async banUserIndefinitely(@Param('authId') authId:string,request:Request){
        return this.adminService.banUserIndefinitely(authId,request);
    }
    @Put('unbanUser/:authId')
    @UseGuards(adminJwtGuard)
    async unbanUser(@Param('authId') authId:string,@Req() request:Request){
        return this.adminService.unBanUserById(authId,request);
    }
    @Put('deleteUser/:authId')
    @UseGuards(adminJwtGuard)
    async deleteUser(@Param('authId') authId:string,@Req() request:Request){
        return this.adminService.deleteUserById(authId,request);
    }
    @Put('deleteReport/:reportId')
    @UseGuards(adminJwtGuard)
    async deleteReport(@Param('reportId') reportId:string,@Req() request:Request){
        return this.adminService.deleteReportById(reportId,request);
    }
    @Put('deleteFeedback/:feedbackId')
    @UseGuards(adminJwtGuard)
    async deleteFeedback(@Param('feedbackId') feedbackId:string,@Req() request:Request){
        return this.adminService.deleteFeedbackById(feedbackId,request);
    }
    @Delete('deleteUserPermanently/:authId')
    @UseGuards(adminJwtGuard)
    async deleteUserPermanently(@Param('authId') authId:string,@Req() request:Request){
        return this.adminService.deleteUserPermanently(authId,request);
    }
    @Put('restoreUser/:userId')
    @UseGuards(adminJwtGuard)
    async restoreUser(@Param('userId') userId:string,@Req() request:Request){
        return this.adminService.restoreDeletedUser(userId,request);
    }
    @Put('restoreReport/:reportId')
    @UseGuards(adminJwtGuard)
    async restoreReport(@Param('reportId') reportId:string,@Req() request:Request){
        return this.adminService.restoreDeletedReport(reportId,request);
    }
    @Put('restoreFeedback/:feedbackId')
    @UseGuards(adminJwtGuard)
    async restoreFeedback(@Param('feedbackId') feedbackId:string,@Req() request:Request){
        return this.adminService.restoreDeletedFeedback(feedbackId,request);
    }
    @Get('deletedUsers')
    @UseGuards(adminJwtGuard)
    async getDeletedUsers(@Req() request:Request){
        return this.adminService.getAllDeletedUsers(request);
    }
    @Get('deletedReports')
    @UseGuards(adminJwtGuard)
    async getDeletedReports(@Req() request:Request){
        return this.adminService.getAllDeletedReports(request);
    }
    @Get('deletedFeedbacks')
    @UseGuards(adminJwtGuard)
    async getDeletedFeedback(@Req() request:Request){
        return this.adminService.getAllDeletedFeedbacks(request);
    }
    @Put('promoteUserToAdmin/:authId')
    @UseGuards(adminJwtGuard)
    async promoteUserToAdmin(@Param('authId') authId:string){
        return this.adminService.promoteUserToAdmin(authId);
    }
    @Post('unban-users')
    @UseGuards(adminJwtGuard)
    async unbanUsers(request:Request) {
        return  this.adminService.handleUserUnban(request);
    }

    @Post('createLoginSummary/:period')
    async createLoginSummary(@Param('period') period: 'DAY' | 'WEEK' | 'MONTH') {
      return this.adminService.createLoginSummary(period);
    }
    @Get('fetchLoginSummary/:period')
    @UseGuards(adminJwtGuard)
    async fetchLoginSummary(@Param('period') period: 'DAY' | 'WEEK' | 'MONTH') {
      return this.adminService.getLoginSummary(period);
    }

    @Get('getProgressSumary')
    @UseGuards(adminJwtGuard)
    async getProgressSummary(){
        return this.adminService.getProgressSummary();
    }

    @Post('createProgressSummary')
    async createProgressSummary() {
      return this.adminService.createProgressSummary();
    }

    @Get('getWeeklyProgressCountPerSkill')
    @UseGuards(adminJwtGuard)
    async getWeeklyProgressCountPerSkill(){
        return this.adminService.getWeeklyProgressCountPerSkill();
    }
   




}
