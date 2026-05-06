import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

export async function saveFile(file: Express.Multer.File, folder: string = 'general') {
  const dir = path.join(UPLOAD_DIR, folder)
  await fs.mkdir(dir, { recursive: true })
  
  const ext = path.extname(file.originalname)
  const filename = `${uuidv4()}${ext}`
  const filepath = path.join(dir, filename)
  
  await fs.writeFile(filepath, file.buffer)
  
  // Return relative path for public access (assuming static middleware is set up)
  return `/uploads/${folder}/${filename}`
}

export async function deleteFile(filepath: string) {
  try {
    const fullPath = path.join(process.cwd(), filepath)
    await fs.unlink(fullPath)
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}
