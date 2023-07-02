import {BackupScript} from "../components/BackupScript.js";

type Options = {
    scriptId: string;
    url: string;
    database?: string;
}

export class MongoBackupScript extends BackupScript {

    private readonly MONGODUMP: string = "./scripts/mongodump";

    private readonly command: string;

    constructor(opts: Options) {
        super(`mongo`, `${opts.scriptId}/${opts.database || '<all>'}`);

        let output = `${this.OUTPUT_DIR}/${this.scriptName}/${opts.scriptId}`;
        if(opts.database) output += `_${opts.database}`;

        this.command = `${this.MONGODUMP} --uri="${opts.url}" `
            + (opts.database ? `--db=${opts.database}` : '')
            + ` --archive=${output}.gz --gzip`;
    }

    async run(): Promise<void> {
        this.log(`Dumping database...`);
        const cmdResult = await this.cmdExecute(this.command);
        if (cmdResult.code != 0) {
            throw new Error(`Command ${this.MONGODUMP} returned error: ${cmdResult.stderr}`);
        }
    }
}