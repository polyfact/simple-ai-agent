import { generate } from "polyfact";
import { search } from "./wikipedia";

import EXAMPLES from "./example.json";

type Line = {
    type: "Question" | "Thought" | "Action" | "Observation";
    arg: string;
}

type Action = {
    type: "Search" | "Calculate" | "Finish";
    arg: string;
}

class Agent {
    history: string;

    question: string;

    constructor(question: string) {
        this.question = question;
        this.history = EXAMPLES.join("\n\n") + "\n\nQuestion: " + question;
    }

    parseLine(line: string): Line {
        const [type, arg] = line.split(": ");

        if (![ "Question", "Thought", "Action", "Observation" ].includes(type)) {
            throw new Error("Unknown line type");
        }

        return {
            type: type as Line["type"],
            arg
        }
    } 

    parseAction(action: string): Action {
        const [type, arg] = action.split("[");

        if (![ "Search", "Calculate", "Finish" ].includes(type)) {
            throw new Error("Unknown action type");
        }

        return {
            type: type as Action["type"],
            arg: arg.split("]")[0]
        }
    }

    async executeAction(action: Action): Promise<string> {
            if (action.type === "Search") {
                console.log("Searching for " + action.arg);
                return await search(action.arg);
            } else if (action.type === "Calculate") {
                try {
                    const result = eval(action.arg.replace(/[^0-9\+\-\*\/]/g, ''));
                    return `The result of expression is ${result}`;
                } catch (e) {
                    return `Error while evaluating expression. Please make sure your query match with /[0-9\\/+*- ]*/.`;
                }
            } else {
                return "Unknown action. Possible actions are Search[], Calculate[] and Finish[].";
            }
    }

    async execute(): Promise<string> {
        while (true) {
            const result = await generate(this.history, { stop: ["\nObservation:"] });

            console.log(result);

            this.history += "\n" + result;

            const lastLine = this.parseLine(result.trim().split("\n").slice(-1)[0]);

            if (lastLine.type !== "Action") {
                throw new Error("Expected action");
            }
        
            const action = this.parseAction(lastLine.arg);

            if (action.type === "Finish") {
                return action.arg;
            }

            const actionResult = await this.executeAction(action);

            console.log("Observation: " + actionResult);

            this.history += "\nObservation: " + actionResult;
        }
    }
}


(async () => {
    console.log("Question: " + process.argv[2]);
    const answer = await new Agent(process.argv[2]).execute();
    console.log("\x1b[32mAnswer: " + answer +" \x1b[0m");
})()
