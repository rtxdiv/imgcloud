import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Images } from 'src/entity/images.entity';
import { Repository } from 'typeorm';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Images) private imagesRepository: Repository<Images>,
    ) {}
    envPath = process.env.STORAGE_PATH || path.join(process.cwd(), 'cloud')
    storagePath = path.isAbsolute(this.envPath)? this.envPath : path.join(process.cwd(), this.envPath)


    async upload(files: Array<Express.Multer.File>, user_id: string) {

        if (files.length == 0) throw new BadRequestException('Файлы не отправлены')

        const errors = new Array<string>
        const images = new Array<string>
        const maxSize = 5 * 1024 * 1024
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']

        for (const file of files) {

            try {
                const fileName = Buffer.from(file.originalname, 'binary').toString('utf-8')

                if (!allowedTypes.includes(file.mimetype)) throw new BadRequestException(`Файл ${fileName} имеет недопустимый тип`)
                if (file.size > maxSize) throw new BadRequestException(`Размер файла ${fileName} превышает 5Мб`)

                const hash = crypto.createHash('sha256')
                hash.update(process.hrtime.bigint().toString())
                hash.update(crypto.randomBytes(16))
                const fullHash = hash.digest()
                const base64url = fullHash.slice(0, 12).toString('base64url')
                const date = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Moscow' }).split(' ')[0].split('-')
                const filePath = `${date[0]}/${date[1]}/${date[2]}`
                const ext = path.extname(file.originalname)

                await this.imagesRepository.insert({ img_id: base64url, ext: ext, path: filePath, user_id: user_id })
                await this.storeFile(file.buffer, base64url, ext, filePath)

                images.push(base64url)

            } catch (err) {
                if (err instanceof BadRequestException) {
                    errors.push(err.message)
                    continue
                }
                throw new InternalServerErrorException('Ошибка обработки файлов')
            }
        }

        return {
            images: images,
            errors: errors
        }
    }

    private async storeFile(buffer: Buffer, id: string, ext: string, filePath: string) {

        const fullPath = path.join(this.storagePath, filePath)
        if (!fs.existsSync(fullPath)) {
            await fs.promises.mkdir(fullPath, { recursive: true })
        }

        await fs.promises.writeFile(path.join(fullPath, id + ext), buffer)
    }


    async getPath(id: string) {
        const image = await this.imagesRepository.findOne({ where: { img_id: id } })
        if (!image) throw new NotFoundException('Изображение не найдено')
        const filePath = path.join(this.storagePath, image.path, image.img_id) + image?.ext
        return filePath
    }

    async getAll(user_id: string) {
        if (!user_id) return []
        const images = await this.imagesRepository.find({ where: { user_id: user_id }, order: { id: 'ASC' } })
        return images
    }

    async delete(user_id: string, img_id: string) {
        if (!user_id || !img_id) throw new BadRequestException()

        const image = await this.imagesRepository.findOne({ where: { img_id: img_id } })
        if (!image || image.user_id !== user_id) throw new BadRequestException()

        await this.imagesRepository.remove(image)
        try {
            await fs.promises.unlink(path.join(this.storagePath, image.path, image.img_id) + image.ext)
        } catch {
            return
        }
    }
}
