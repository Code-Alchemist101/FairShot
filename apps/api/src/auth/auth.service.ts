import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return null;
        }

        // Remove password from response
        const { passwordHash, ...result } = user;
        return result;
    }

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.create(registerDto);

        // Remove password from response
        const { passwordHash, ...result } = user;

        // Generate token
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            user: result,
            accessToken,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            user,
            accessToken,
            role: user.role,
        };
    }

    async getProfile(userId: string) {
        return this.usersService.findById(userId);
    }
}
