import { Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import configurationLoader from "./utils/configurationLoader.js";
// import config from "./config.js";

class Load extends Client {
    constructor(config) {
        super({
            intents: [
                "GUILDS",
                "GUILD_MESSAGES",
                "GUILD_MESSAGE_REACTIONS",
                "DIRECT_MESSAGES",
                "DIRECT_MESSAGE_REACTIONS",
                "DIRECT_MESSAGE_TYPING",
            ],
        });
        this.commands = new Collection();
        this.jobs = [];
        this.config = config;
    }

    async execute() {

        const directories = readdirSync(process.cwd() + "/lib/commands/");
        directories.forEach(async (dir) => {
            const commands = readdirSync(process.cwd() + "/lib/commands/" + dir + "/");
            commands
                .filter((cmd) => cmd.split(".").pop() === "js")
                .forEach(async (cmd) => {
                    const Load = await import(`./commands/${dir}/${cmd}`);
                    const Command = await new Load.default(this);
                    this.commands.set(Command.help.name, Command);
                    console.log(`Command ${Command.help.name} loaded.`);
                });
        });

        const eventFiles = readdirSync(process.cwd() + "/lib/events/");
        eventFiles.forEach(async (file) => {
            const eventName = file.split(".")[0];
            const event = new (await import(`./events/${file}`)).default(this);
            this.on(eventName, (...args) => event.execute(...args));
            console.log(`Event ${eventName} loaded.`);
        });

        const backgroundTasks = readdirSync(process.cwd() + "/lib/jobs/");
        backgroundTasks
            .filter((task) => task.split(".").pop() === "js")
            .forEach(async (task) => {
                const Task = await import(`./jobs/${task}`);
                const Job = await new Task.default(this);
                this.jobs.push(Job.name, Job);
                console.log(`Job ${Job.name} loaded.`);
            });

        await this.login(this.config.BOT_TOKEN);
        await this.backgroundTasks();
    }

    async backgroundTasks() {
        console.log("Background tasks runnung.");
        try {
            //RUN JOBS HERE
        } catch (err) {
            console.log(err);
        }
    }
}

// new Load().execute();

(async function () {
    const config = await configurationLoader();
    new Load(config).execute();
})();

/*
import configurationLoader from "./utils/configurationLoader.js";
import appFactory from "./app.js";
import discordClient from "./discord.js";

(async function () {
    const config = await configurationLoader();
    const discord = await discordClient(config);
    const server = appFactory(config, discord);
    server.listen(config.PORT || 3000, "0.0.0.0", (err) => {
        if (err) {
            server.log.error(err);
            process.exit(1);
        }
    });
})();
*/