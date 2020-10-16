import jwt from 'jsonwebtoken'

const generateToken = (id:number) =>{
    return jwt.sign({ id }, "secret", {
        expiresIn: '3h'
      });
}

export default generateToken
