import { v2 as cloudinaryV2 } from 'cloudinary'
import { env } from './environment.js'

if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinaryV2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export const cloudinary = cloudinaryV2
