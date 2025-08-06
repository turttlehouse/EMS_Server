import { Sequelize } from "sequelize-typescript";

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USERNAME;
const dbPass = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

// Check if all required environment variables are set
// console.log("Database Configuration:", {
//     dbName,
//     dbUser,
//     dbPass,
//     dbHost,
//     dbPort
// });

if (!dbName || !dbUser || !dbPass || !dbHost) {
    throw new Error("Database configuration environment variables are missing.");
}

// sequelize instance
const sequelize = new Sequelize({
    database: dbName,
    username: dbUser,
    password: dbPass,
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
    models: [__dirname + "/models"]
});


//Configuration check
sequelize
.authenticate()
.then(()=>{
    console.log('Database connected successfully')
})
.catch((err)=>{
    console.log('Error connecting to database : ',err)
})



//migration
sequelize.sync({force : false})
.then(()=>{
    console.log('Migration completed : Database synchronized successfully')
})
.catch((err)=>{
    console.log('Migration Error : ',err)
})


//exporting the sequelize instance
export default sequelize
