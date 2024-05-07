import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) {}

    @Get('users')
    async getAllUsers(){
        return this.adminService.getAllUsers();
    }

    @Get('reports')
    async getAllReports(){
        return this.adminService.getAllReports();
    }
    @Get('feedbacks')
    async getAllFeedbacks(){
        return this.adminService.getAllFeedbacks();
    }
    @Put('banUser/:authId')
    async banUserById(@Param('authId') authId:string, @Body('month') month:number, @Body('days') days:number){
        return this.adminService.banUserById(authId, month, days);
    }
    @Get('bannedUsers')
    async getAllBannedUsers(){
        return this.adminService.getAllBannedUsers();
    }
    @Put('banUserIndefinitely/:authId')
    async banUserIndefinitely(@Param('authId') authId:string){
        return this.adminService.banUserIndefinitely(authId);
    }
    @Put('unbanUser/:authId')
    async unbanUser(@Param('authId') authId:string){
        return this.adminService.unBanUserById(authId);
    }
    @Put('deleteUser/:authId')
    async deleteUser(@Param('authId') authId:string){
        return this.adminService.deleteUserById(authId);
    }
    @Put('deleteReport/:reportId')
    async deleteReport(@Param('reportId') reportId:string){
        return this.adminService.deleteReportById(reportId);
    }
    @Put('deleteFeedback/:feedbackId')
    async deleteFeedback(@Param('feedbackId') feedbackId:string){
        return this.adminService.deleteFeedbackById(feedbackId);
    }
    @Delete('deleteUserPermanently/:authId')
    async deleteUserPermanently(@Param('authId') authId:string){
        return this.adminService.deleteUserPermanently(authId);
    }
    @Put('restoreUser/:userId')
    async restoreUser(@Param('userId') userId:string){
        return this.adminService.restoreDeletedUser(userId);
    }
    @Put('restoreReport/:reportId')
    async restoreReport(@Param('reportId') reportId:string){
        return this.adminService.restoreDeletedReport(reportId);
    }
    @Put('restoreFeedback/:feedbackId')
    async restoreFeedback(@Param('feedbackId') feedbackId:string){
        return this.adminService.restoreDeletedFeedback(feedbackId);
    }
    @Get('deletedUsers')
    async getAllDeletedUsers(){
        return this.adminService.getAllDeletedUsers();
    }
    @Get('deletedReports')
    async getAllDeletedReports(){
        return this.adminService.getAllDeletedReports();
    }
    @Get('deletedFeedbacks')
    async getAllDeletedFeedbacks(){
        return this.adminService.getAllDeletedFeedbacks();
    }
    @Put('promoteUserToAdmin/:authId')
    async promoteUserToAdmin(@Param('authId') authId:string){
        return this.adminService.promoteUserToAdmin(authId);
    }
    @Post('unban-users')
    async unbanUsers() {
        return  this.adminService.handleUserUnban();
    }



}
