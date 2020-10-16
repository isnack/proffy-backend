import { Request, Response } from 'express'
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';
import generateHash from '../utils/generateCompareHash';

interface ScheduleItem {
    week_day: number,
    from: string;
    to: string;
}



export default class ClassesController {

    async index(request: Request, response: Response){
        const filters = request.query;
		
		const subject = filters.subject as string;
		const week_day = filters.week_day as string;
		const time = filters.time as string;

        if(!filters.week_day || !filters.subject || !filters.time){
            return response.status(400).json({
                error: 'Missing filters to search classes'
            });
        }
       
        const timeInMinutes = convertHourToMinutes(time)

       const classes = await db('classes')
      .whereExists(function() {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('class_schedule.class_id = classes.id')
          .whereRaw('class_schedule.week_day = ??', [Number(week_day)])
          .whereRaw('class_schedule.from <= ??', [timeInMinutes])
          .whereRaw('class_schedule.to > ??', [timeInMinutes])
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users.id')
      .select(['classes.*', 'users.*']);
      console.log(classes)
    return response.json(classes);
    }

    async indexPaginate(request:Request, response:Response){
        const filters = request.query;
        
        let offSet = Number(filters.page as string);
        const limit  = Number(filters.quantityRegisters as string);

        if ((offSet) < 1) offSet = 1;

        const subject = filters.subject as string;
		const week_day = filters.week_day as string;
		const time = filters.time as string;

        if(!filters.page || !filters.quantityRegisters || !filters.week_day || !filters.subject || !filters.time ){
            return response.status(400).json({
                error: 'Missing filters to search classes'
            });
        }

        const timeInMinutes = convertHourToMinutes(time)   

        const classes = await db('classes')
        .whereExists(function() {
          this.select('class_schedule.*')
          
            .from('class_schedule')
            .whereRaw('class_schedule.class_id = classes.id')
            .whereRaw('class_schedule.week_day = ??', [Number(week_day)])
            .whereRaw('class_schedule.from <= ??', [timeInMinutes])
            .whereRaw('class_schedule.to > ??', [timeInMinutes])
        })
        .where('classes.subject', '=', subject)          
        
        .join('users', 'classes.user_id', '=', 'users.id')  
        .select([ 'classes.*', 'users.*' ])             
        .paginate({perPage:limit,currentPage:offSet})
        
        const newClassesWithSchedules = {...classes}
  
        const schedules = classes.data.map( async (classItem,index) => { 
                const result = await  db('class_schedule').select(['class_schedule.*']).from('class_schedule')
                .where('class_schedule.class_id',  classItem.id).then(schedules =>{return  schedules})                  
                newClassesWithSchedules.data[index].schedules=result
                return  result
        })      
       
       await Promise.all(schedules)        
    
        return await response.json(newClassesWithSchedules)
    }


    async create  (request: Request,response :Response) {

       
        const {
            name,
            avatar,
            whatsapp,
            bio,
            email,
            password,
            subject,
            cost,
            schedule
        } = request.body;
        const hashPassword = await generateHash(password)
        const trx = await db.transaction();
    
        try {
            
            const insertedUsersIds =   await trx('users').insert({
                name,
                avatar,
                email,
                password:hashPassword,
                whatsapp,
                bio                
            }).returning('id');
          
            const user_id = insertedUsersIds[0];
            
            const insertedClassesIds =   await trx('classes').insert({
                subject,
                cost,
                user_id,        
            }).returning('id');
        
            const class_id = insertedClassesIds[0];
            
            const classSchedule = schedule.map((scheduleItem :ScheduleItem)=>{
                console.log(class_id)
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to : convertHourToMinutes(scheduleItem.to)
                }
            })
        
            await trx('class_schedule').insert(classSchedule)
            

            await trx.commit();
            return response.status(201).send()
        
    
        } catch (error) {
            await trx.rollback();
           
            return response.status(400).json({
                error: error,
            })
        }
    
     }
}