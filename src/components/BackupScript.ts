import {spawn} from "node:child_process";
import {CmdExecute} from "./types.js";

export abstract class BackupScript {

    protected readonly OUTPUT_DIR: string = 'outs';

    protected constructor(
        readonly scriptName: string
    ) {
    }

    private async do(): Promise<void> {
        this.log('Script started');
        await this.run();
        this.log('Script finished');
    }

    abstract run(): Promise<void>;

    protected log(message: string) {
        console.log(`${this.scriptName} - ${message}`);
    }

    protected async cmdExecute(command: string): Promise<CmdExecute> {
        const out: CmdExecute = {};

        const process = spawn('bash', []);

        // wait for process to spawn
        await new Promise(resolve => process.once('spawn', resolve));
        process.stdout.on(`data`, data => out.stdout = data.toString());
        process.stderr.on(`data`, data => out.stderr = data.toString());

        // wait for "command" to execute
        await new Promise(resolve => {
            process.stdin.write(`${command}\n`, `utf8`);
            process.stdin.end(resolve);
        });

        // wait for stdout and stderr stream to end, and process to close
        await Promise.all([
            new Promise(resolve => process.stdout.on('end', resolve)),
            new Promise(resolve => process.stderr.on('end', resolve)),
            new Promise(resolve => process.once(`close`, resolve))
        ]);

        out.code = process.exitCode

        return out as CmdExecute;
    }

    static async run(scripts: BackupScript[]) {
        for (const s of scripts) {
            try {
                await s.do();
            } catch (e: any) {
                e.message = `[${this.name}] ${e.message}`;
                throw e;
            }
        }
    }
}