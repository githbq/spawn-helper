//跨平台 执行命令
import * as spawn from 'cross-spawn-async'
import * as childProcess from 'child_process'
import * as  color from 'cli-color'
const { exec } = childProcess

export default {
    addEvent(obj, eventName, options, cb) {
        obj.on(eventName, (data) => {
            cb && cb(data)
        })
    },
    /**
     * 
     * @param {cmd,deps,spawnOptions} options 
     */
    create(options) {
        let result = spawn(options.cmd, options.deps || [], Object.assign(options.spawnOptions, {}))
        this.addEvent(result.stdout, 'data', options, options.stdoutCallback)
        this.addEvent(result.stderr, 'data', options, options.stderrCallback)
        this.addEvent(result, 'close', options, options.closeCallback)
        return result
    },
    /**
     * 
     * @param {命令名称} name 
     * @param {cwd} options 
     */
    run(name, options) {
        return new Promise((resolve, reject) => {
            let result = this.create({
                deps: options.deps,
                cmd: name,
                spawnOptions: { cwd: options.cwd },
                stdoutCallback: (data) => {
                    options.stdoutCallback && options.stdoutCallback(data)
                },
                stderrCallback: (data) => {
                    options.stdoutCallback && options.stdoutCallback(data)
                },
                closeCallback: (data) => {
                    resolve(data)
                }
            })
        })
    },
    /**
     * 
     * @param cmd 
     * @param options {onStdout,onStderr,preventDefault:false}
     */
    exec(cmd: string, options: any = {}) {
        return new Promise((resolve, reject) => {
            let child = exec(cmd, options, function (err, stdout, stderr) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve({ stdout, stderr })
                }
            })
            child.stdout.on('data', function (chunk) {
                const msg = chunk.toString()
                options.preventDefault !== true && console.log(color.yellow(msg))
                options.onStdout && options.onStdout(msg)
            })
            child.stderr.on('data', function (chunk) {
                const msg = chunk.toString()
                options.preventDefault !== true && console.log(color.yellowBright(msg))
                options.onStderr && options.onStderr(msg)
            })
        })
    }
}