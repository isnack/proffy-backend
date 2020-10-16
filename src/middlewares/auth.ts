import  { Request, Response, NextFunction} from 'express'
import  jwt from "jsonwebtoken";
import  { promisify }  from "util";

export const auth = async (req:Request, res:Response, next:NextFunction) => {
  const authHeader = req.headers.authorization;

  

  if (!authHeader) {
    return res.status(401).send({ error: "No token provided" });
  }
  const token = authHeader.split('Bearer ')[1]
  console.log("qual é o token ?" +token)
  //const [scheme, token] = authHeader.split(" ");

  try {
    const decoded:any = await promisify(jwt.verify)(token, "secret");
      
    res.locals.userId = decoded.id;
    console.log(res.locals.userId)
    return next();
  } catch (err) {
    console.log(err +" erro back")
    return res.status(401).send({ error: err });
  }
};

