import "dotenv/config.js"
import {BackupScript} from "./components/BackupScript.js";
import {MongoBackupScript} from "./scripts/MongoBackupScript.js";
import {MySQLBackupScript} from "./scripts/MySQLBackupScript.js";

const MONGO_URL = process.env.MONGO_URL!;

const MYSQL_HOST = process.env.MYSQL_HOST!;
const MYSQL_USERNAME = process.env.MYSQL_USERNAME!;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD!;


await BackupScript.run([
    new MongoBackupScript({
        scriptId: 'raspberry',
        url: MONGO_URL,
        database: 'bibliotheca_news'
    }),
    new MySQLBackupScript({
        scriptId: 'raspberry',
        host: MYSQL_HOST,
        username: MYSQL_USERNAME,
        password: MYSQL_PASSWORD,
        database: 'news_data'
    }),
    new MySQLBackupScript({
        scriptId: 'raspberry',
        host: MYSQL_HOST,
        username: MYSQL_USERNAME,
        password: MYSQL_PASSWORD,
        database: 'keycloak'
    })
]);