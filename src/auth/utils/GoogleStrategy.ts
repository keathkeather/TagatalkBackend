import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import{ Profile, Strategy} from 'passport-google-oauth20'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){

    constructor(){
        super({
            clientID: '669600535698-56rq6d99hk1ul3sojqcenjilrgpu9nf9.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'https://localhost:3000/auth/google/redirect',
            scope: ['profile', 'email'],
        })
    }
    
    async validate(accessToken: string, refreshToken: string, profile: Profile){

            
    }

}