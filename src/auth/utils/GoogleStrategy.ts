import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { access } from "fs";
import{ Profile, Strategy} from 'passport-google-oauth20'
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    

    constructor(private authService: AuthService){

        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email'],
        })
    }
    
    async validate(accessToken: string, refreshToken: string, profile: Profile){
        console.log(accessToken)
        console.log(profile)
        console.log(profile.emails[0].value)
        const user = await this.authService.validateGoogleUser(
            accessToken,
            {
                email: profile.emails[0].value, 
                displayName: profile.displayName,
                role: "USER"
            }
        )
        console.log('validate')
        return user || null;
            
    }

}