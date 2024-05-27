import { connectDb } from "./db/index.db.js"
import { app } from "./app.js"
import dotenv from "dotenv"
import { client } from "./db/redis.db.js"

dotenv.config({
    path: "./.env"
})

try {
    await client.connect()
    console.log("Redis connection established!");
} catch (error) {
    console.log(`Redis connection error :: ${error}`);
}

try {
    connectDb()
        .then(() => {
            app.listen(process.env.PORT, () => {
                console.log("Server is listening at ::", process.env.PORT);
            })
        })
} catch (error) {
    console.log("Server is not started :: ", error);
}

