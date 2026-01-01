import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Images } from "src/entity/images.entity";
import { Repository } from "typeorm";
import type { Request, Response } from "express";

@Injectable()
export class UserGuard implements CanActivate {
    constructor(@InjectRepository(Images) private readonly imagesRepository: Repository<Images>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>()
        const res = context.switchToHttp().getResponse<Response>()

        try {

            const user_id = req.cookies.user_id
            if (!user_id) throw new NotFoundException()

            const exist = await this.imagesRepository.find({ where: { user_id: user_id } })
            if (!exist || exist.length == 0) {
                throw new NotFoundException()
            }

            res.cookie('user_id', user_id, { maxAge: 1000 * 24 * 60 * 60 * 1000 })
            return true

        } catch (err) {
            if (err instanceof NotFoundException) {
                
                const user_id = crypto.randomUUID()
                req.cookies.user_id = user_id

                res.cookie('user_id', user_id, { maxAge: 1000 * 24 * 60 * 60 * 1000 })
                return true
            }
            return false
        }
    }
}