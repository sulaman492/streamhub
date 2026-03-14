import dotenv from "dotenv" 
import connectDB from "./db/db.js"
import { app } from "./app.js";

dotenv.config({
    path:"./.env"
})
console.log(`${process.env.MONGODB_URI}`);

const startServer=async () => {
    try {
        await connectDB()
        const port=process.env.PORT||8000
        app.listen(port,()=>{
            console.log(`app running on port : ${port}`);
        })
    } catch (error) {
        console.log('Mongo db connection failed ',error);
        
    }
}
startServer()
 