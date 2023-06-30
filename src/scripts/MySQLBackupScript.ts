import {BackupScript} from "../components/BackupScript.js";

type Options = {
    scriptId: string;
    host: string;
    port?: number,
    username: string;
    password: string;
    database?: string;
}

export class MySQLBackupScript extends BackupScript {
    private readonly MYSQLDUMP: string = "./scripts/mysql/bin/mysqldump";
    private readonly MKDIR: string = "mkdir -p";

    private readonly command: string;

    constructor(opts: Options) {
        super(`mysql/${opts.scriptId}/${opts.database || '<all>'}`);

        let output = `${this.OUTPUT_DIR}/mysql/${opts.scriptId}`;
        if(opts.database) output += `_${opts.database}`;

        this.command = `${this.MYSQLDUMP} --host=${opts.host} -port=${opts.port || 3306} --user=${opts.username} --password=${opts.password} `
            + ((!opts.database || opts.database.trim().length == 0) ? '-A' : `${opts.database}`)
            + ` -R -E --triggers --single-transaction > ${output}.sql` ;
    }

    async run(): Promise<void> {
        this.log(`Creating output directory...`);
        const mkdirRes = await this.cmdExecute(`${this.MKDIR} ${this.OUTPUT_DIR}/mysql/`);
        if (mkdirRes.code != 0) {
            throw new Error(`Command ${this.MKDIR} returned error: ${mkdirRes.stderr}`);
        }

        this.log(`Dumping database...`);
        const cmdResult = await this.cmdExecute(this.command);
        if (cmdResult.code != 0) {
            throw new Error(`Command ${this.MYSQLDUMP} returned error: ${cmdResult.stderr}`);
        }
    }
}