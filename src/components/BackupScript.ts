import {spawn} from "node:child_process";
import {CmdExecute} from "./types.js";
import {ChildProcessWithoutNullStreams} from "child_process";

export abstract class BackupScript {

    protected readonly OUTPUT_DIR: string = 'outs';

    protected constructor(
        readonly scriptName: string,
        readonly scriptId: string,
    ) {
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

    abstract run(): Promise<void>;

    protected log(message: string) {
        console.log(`${this.scriptName}/${this.scriptId} - ${message}`);
    }

    protected async cmdExecute(commands: string | string[]): Promise<CmdExecute> {
        if (typeof commands == 'string') {
            commands = [commands];
        }

        const out: CmdExecute = {
            stdout: '',
            stderr: ''
        };

        const proc = spawn('bash', []);

        // wait for process to spawn
        await new Promise(resolve => proc.once('spawn', resolve));
        proc.stdout.on(`data`, data => out.stdout += data.toString() + '\n');
        proc.stderr.on(`data`, data => out.stderr += data.toString() + '\n');

        // wait for "command" to execute
        await new Promise(async resolve => {
            for (const c of commands) {
                console.log(`Running ${c}`);
                await new Promise(resolve2 => proc.stdin.end(`${c}\n`, `utf8`, () => resolve2(undefined)));
            }

            resolve(undefined);
        });

        // wait for stdout and stderr stream to end, and process to close
        await Promise.all([
            new Promise(resolve => proc.stdout.on('end', resolve)),
            new Promise(resolve => proc.stderr.on('end', resolve)),
            new Promise(resolve => proc.once(`close`, resolve))
        ]);

        out.code = proc.exitCode

        return out as CmdExecute;
    }

    private async do(): Promise<void> {
        this.log('Script started');
        await this.createOutputDir();
        await this.run();
        this.log('Script finished');
    }

    private async createOutputDir(): Promise<void> {
        this.log(`Creating output directory...`);
        const mkdirRes = await this.cmdExecute(`mkdir -p ${this.OUTPUT_DIR}/${this.scriptName}/`);
        if (mkdirRes.code != 0) {
            throw new Error(`Command mkdir returned error: ${mkdirRes.stderr}`);
        }
    }
}