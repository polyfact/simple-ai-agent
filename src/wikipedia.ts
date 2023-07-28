import { generate } from "polyfact";
import fetch from "node-fetch";

export async function pageSearch(query: string) {
    const escapedQuery = new URLSearchParams({
        action: "opensearch",
        format: "json",
        search: query,
        limit: "1",
        namespace: "0"
    }).toString();

    const res = await fetch(`https://en.wikipedia.org/w/api.php?${escapedQuery}`).then(res => res.json());
        
    if (res[1].length === 0) {
        throw new Error("No wikipedia article found.");
    }

    return res[1][0];
}

export async function getContent(title: string) {
    const escapedParams = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "revisions",
        rvprop: "content",
        rvsection: "0",
        titles: title,
        exintro: "1",
        explaintext: "1",
    }).toString();

    const res2 = await fetch(`https://en.wikipedia.org/w/api.php?${escapedParams}`).then(res => res.json());

    return (Object.values(res2.query.pages)[0] as any).revisions[0]['*']
}

export async function search(query: string) {
    const page = await generate("Here's a query for you to search: " + query + "\n\nOn which wikipedia page can you find the answer? Only answer with the title of the page and nothing else. Don't explain anything. Don't add any prefix. Only answer with the name of the article");

    const title = await pageSearch(page).catch(() => null);

    if (!title) {
        return "No wikipedia article found. The query inside Search[] should be the name of a valid wikipedia article. Try something more broader.";
    }

    const content = await getContent(title);

    const summary = await generate(`Explain the data below to answer to this query: "${query}":"\n\n${content}`);

    return summary;
}
