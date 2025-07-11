import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { envVariableKeys } from "src/common/const/env.const";

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware{
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}
    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            next();
            return;
        }
        
        try {
            const token = this.validateBearerToken(authHeader);
            const decodedPayload = this.jwtService.decode(token);
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>(decodedPayload.type === 'refresh' ? envVariableKeys.refreshTokenSecret : envVariableKeys.accessTokenSecret )
            });
            req.user = payload;
            next();
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                throw new UnauthorizedException('토큰이 만료 됐습니다.');
            }

            next();
        }
    }

    validateBearerToken(rawToken: string) {
        const bearerSplit = rawToken.split(' ');
        
        if (bearerSplit.length !== 2) {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
        }
    
        const [bearer, token] = bearerSplit;

        return token;
    }
}