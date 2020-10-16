import bcrypt from 'bcrypt'

const saltRounds = 15;

const generateHash  = async (myPlaintextPassword:string)  =>{

   const hash = await  bcrypt.hash(myPlaintextPassword,saltRounds);

   return hash
}

 export async function comparePassword  (myPlaintextPassword:string,hashDatabasePassword:string) {

    const isTruePassword = await bcrypt.compare(myPlaintextPassword,hashDatabasePassword)
    return isTruePassword;
}

export default generateHash