import { Request, Response } from 'express'
import db from '../database/connection';
import { comparePassword } from './../utils/generateCompareHash';
import generateToken from '../utils/generateToken';

export default class AuthController {

        async login(request:Request,response:Response){
        try {
            const {email,password} =request.body

            if(!email || !password){
                
                return response.status(400).json({error:"Password and email fields required"})
            }

            const user = await db('users')
                .where({email: email})            
                .select(['users.id','users.password']);

            const userId = user[0];
            const hashPassword = user[1];
               
           if(user.length ===0){
            return response.status(400).json({error:"Not user"})
           }

            if(! comparePassword(password,hashPassword)){
            return response.status(400).json({error:"Password and email not validated"})
            }

           const token =generateToken(userId)
           console.log('Gerado é : ' +token)
           return  response.json(token)
        } catch (error) {
            return response.status(400).json({error:"Erro Geral"})
        }
     }
    }
