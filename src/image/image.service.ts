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

        const exist = await this.imagesRepository.find({ where: { user_id: user_id } })
        if (!user_id || exist.length == 0) {
            user_id = crypto.randomUUID()
        }

        const errors = new Array<string>
        const maxSize = 1 * 1024 * 1024
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']

        for (const file of files) {

            try {
                if (file.size > maxSize) throw new BadRequestException(`Размер файла ${file.originalname} превышает 5Мб`)
                if (!allowedTypes.includes(file.mimetype)) throw new BadRequestException(`Файл ${file.originalname} имеет недопустимый тип`)

                const hash = crypto.createHash('sha256')
                hash.update(process.hrtime.bigint().toString())
                hash.update(crypto.randomBytes(16))
                const fullHash = hash.digest()
                const base64url = fullHash.slice(0, 12).toString('base64url')

                const date = new Date().toISOString().split('T')[0].split('-')
                const filePath = `${date[0]}/${date[1]}/${date[2]}`
                const ext = path.extname(file.originalname)

                await this.imagesRepository.insert({ img_id: base64url, ext: ext, path: filePath, user_id: user_id })
                await this.storeFile(file.buffer, base64url, ext, filePath)

            } catch (err) {
                if (err instanceof BadRequestException) {
                    errors.push(err.message)
                    continue
                }
                throw new InternalServerErrorException('Ошибка обработки файлов')
            }
        }

        return {
            message: `Успешно загружено: ${files.length - errors.length}, ошибок загрузки: ${errors.length}`,
            data: errors
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
}
