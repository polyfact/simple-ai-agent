import fs from "fs";
import * as t from "io-ts";
import { kv, generate } from "polyfact";
import fetch from "node-fetch";

const EXAMPLES = [
    "Question: What is the elevation range for the area that the eastern sector of the Colorado orogeny extends into?\nThought: I need to search Colorado orogeny, find the area that the eastern sector of the Colorado orogeny extends into, then find the elevation range of the area.\nAction: Search[Colorado orogeny]\nObservation: The Colorado orogeny was an episode of mountain building (an orogeny) in Colorado and surrounding areas.\nThought: It does not mention the eastern sector. So I need to look up eastern sector.\nAction: Lookup[eastern sector]\nObservation: (Result 1 / 1) The eastern sector extends into the High Plains and is called the Central Plains orogeny.\nThought: The eastern sector of Colorado orogeny extends into the High Plains. So I need to search High Plains and find its elevation range.\nAction: Search[High Plains]\nObservation: High Plains refers to one of two distinct land regions\nThought: I need to instead search High Plains (United States).\nAction: Search[High Plains (United States)]\nObservation: The High Plains are a subregion of the Great Plains. From east to west, the High Plains rise in elevation from around 1,800 to 7,000 ft (550 to 2,130 m).[3]\nThought: High Plains rise in elevation from around 1,800 to 7,000 ft, so the answer is 1,800 to 7,000 ft.\nAction: Finish[1,800 to 7,000 ft]",
    "Question: Musician and satirist Allie Goertz wrote a song about the \"The Simpsons\" character Milhouse, who Matt Groening named after who?\nThought: The question simplifies to \"The Simpsons\" character Milhouse is named after who. I only need to search Milhouse and find who it is named after.\nAction: Search[Milhouse]\nObservation: Milhouse Mussolini Van Houten is a recurring character in the Fox animated television series The Simpsons voiced by Pamela Hayden and created by Matt Groening.\nThought: The paragraph does not tell who Milhouse is named after, maybe I can look up \"named after\".\nAction: Lookup[named after]\nObservation: (Result 1 / 1) Milhouse was named after U.S. president Richard Nixon, whose middle name was Milhous.\nThought: Milhouse was named after U.S. president Richard Nixon, so the answer is Richard Nixon.\nAction: Finish[Richard Nixon]",
    "Question: Which documentary is about Finnish rock groups, Adam Clayton Powell or The Saimaa Gesture?\nThought: I need to search Adam Clayton Powell and The Saimaa Gesture, and find which documentary is about Finnish rock groups.\nAction: Search[Adam Clayton Powell]\nObservation: Could not find [Adam Clayton Powell]. Similar: [’Adam Clayton Powell III’, ’Seventh Avenue (Manhattan)’, ’Adam Clayton Powell Jr. State Office Building’, ’Isabel Washington Powell’, ’Adam Powell’, ’Adam Clayton Powell (film)’, ’Giancarlo Esposito’].\nThought: To find the documentary, I can search Adam Clayton Powell (film).\nAction: Search[Adam Clayton Powell (film)]\nObservation: Adam Clayton Powell is a 1989 American documentary film directed by Richard Kilberg. The film is about the rise and fall of influential African-American politician Adam Clayton Powell Jr.[3][4] It was later aired as part of the PBS series The American Experience.\nThought: Adam Clayton Powell (film) is a documentary about an African-American politician, not Finnish rock groups. So the documentary about Finnish rock groups must instead be The Saimaa Gesture.\nAction: Finish[The Saimaa Gesture]",
    "Question: What profession does Nicholas Ray and Elia Kazan have in common?\nThought: I need to search Nicholas Ray and Elia Kazan, find their professions, then find the profession they have in common.\nAction: Search[Nicholas Ray]\nObservation: Nicholas Ray (born Raymond Nicholas Kienzle Jr., August 7, 1911 - June 16, 1979) was an American film director, screenwriter, and actor best known for the 1955 film Rebel Without a Cause.\nThought: Professions of Nicholas Ray are director, screenwriter, and actor. I need to search Elia Kazan next and find his professions.\nAction: Search[Elia Kazan]\nObservation: Elia Kazan was an American film and theatre director, producer, screenwriter and actor.\nThought: Professions of Elia Kazan are director, producer, screenwriter, and actor. So profession Nicholas Ray and Elia Kazan have in common is director, screenwriter, and actor.\nAction: Finish[director, screenwriter, actor]",
    "Question: Which magazine was started first Arthur’s Magazine or First for Women?\nThought: I need to search Arthur’s Magazine and First for Women, and find which was started first.\nAction: Search[Arthur’s Magazine]\nObservation: Arthur’s Magazine (1844-1846) was an American literary periodical published in Philadelphia in the 19th century.\nThought: Arthur’s Magazine was started in 1844. I need to search First for Women next.\nAction: Search[First for Women]\nObservation: First for Women is a woman’s magazine published by Bauer Media Group in the USA.[1] The magazine was started in 1989.\nThought: First for Women was started in 1989. 1844 (Arthur’s Magazine) < 1989 (First for Women), so Arthur’s Magazine was started first.\nAction: Finish[Arthur’s Magazine]",
    "Question: Were Pavel Urysohn and Leonid Levin known for the same type of work?\nThought: I need to search Pavel Urysohn and Leonid Levin, find their types of work, then find if they are the same.\nAction: Search[Pavel Urysohn]\nObservation: Pavel Samuilovich Urysohn (February 3, 1898 - August 17, 1924) was a Soviet mathematician who is best known for his contributions in dimension theory.\nThought: Pavel Urysohn is a mathematician. I need to search Leonid Levin next and find its type of work.\nAction: Search[Leonid Levin]\nAction: Search[Leonid Levin]\nObservation: Leonid Anatolievich Levin is a Soviet-American mathematician and computer scientist.\nThought: Leonid Levin is a mathematician and computer scientist. So Pavel Urysohn and Leonid Levin have the same type of work.\nAction: Finish[yes]"
];

async function search(query: string) {
    const page = await generate("Here's a query for you to search: " + query + "\n\nOn which wikipedia page can you find the answer? Only answer with the title of the page and nothing else. Don't explain anything. Don't add any prefix. Only answer with the name of the article");

    const escaped_query = new URLSearchParams({
        action: "opensearch",
        format: "json",
        search: page,
        limit: "1",
        namespace: "0"
    }).toString();

    const res = await fetch(`https://en.wikipedia.org/w/api.php?${escaped_query}`).then(res => res.json());
        
    if (res[1].length === 0) {
        console.log(res);
        return "No wikipedia article found. The query inside Search[] should be the name of a valid wikipedia article. Try something more broader.";
    }

    const title = res[1][0];
    console.log(title);

    const escaped_query2 = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "revisions",
        rvprop: "content",
        rvsection: "0",
        titles: title,
        exintro: "1",
        explaintext: "1",
    }).toString();

    const res2 = await fetch(`https://en.wikipedia.org/w/api.php?${escaped_query2}`).then(res => res.json());

    const summary = await generate(`Explain the data below to answer to this query: "${query}":"\n\n${(Object.values(res2.query.pages)[0] as any).revisions[0]['*']}`);

    return summary;
}

(async () => {
    let conv = EXAMPLES.join("\n\n") + "\n\nQuestion: " + process.argv[2];

    console.log("Question: " + process.argv[2]);

    while (true) {
        conv += "\n";
        const res = await generate(conv, { stop: ["\nObservation:"] });
        
        conv += res;
        console.log(res);

        const last_line = res.split("\n").slice(-1)[0];
        if (last_line.startsWith("Answer:")) {
            break;
        }
        if (last_line.startsWith("Action:")) {
            const action = last_line.split("Action: ")[1]


            let [func, arg] = action.split("[");

            if (!arg) {
                const observation = "Observation: Unknown action. Possible actions are Search[], Calculate[] and Finish[].";
                conv += "\n" + observation;

                console.log(observation);
                continue;
            }
            arg = arg.slice(0, -1);

            if (func === "Search") {
                const search_res = await search(arg);
                console.log("Observation: " + search_res);
                conv += "\nObservation: " + search_res;
            } else if (func === "Calculate") {
                let result: number;
                try {
                    result = eval(arg.replace(/[^0-9\+\-\*\/]/g, ''));
                    const observation = `Observation: Result of expression is ${result}`;
                    console.log(observation);
                    conv += "\n" + observation;
                } catch (e) {
                    const observation = `Observation: Error while evaluating expression. Please make sure your query match with /[0-9\\/+*- ]*/.`;
                    console.log(observation);
                    conv += "\n" + observation;
                }
            } else if (func === "Finish") {
                console.log("Finished!");
                break;
            } else {
                const observation = "Observation: Unknown action. Possible actions are Search[], Calculate[] and Finish[].";
                conv += "\n" + observation;

                console.log(observation);
            }
        }
    }
})()
