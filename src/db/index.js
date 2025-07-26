const mongoose = require('mongoose');

const {DB_NAME} = require("../constants");

const connectdb = async()=>{
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(connectioninstance.connection.port);
        console.log(`mongodb successfully connected !! DB:HOST  ${connectioninstance.connection.host}`);
    } catch (error) {
        console.log("mongodb connection err:",error)
        process.exit(1)
    }
}

module.exports = connectdb;