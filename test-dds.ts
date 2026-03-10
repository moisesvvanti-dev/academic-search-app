import { search, searchNews, searchImages, SafeSearchType } from "duck-duck-scrape";

async function test() {
    console.log("Running search with duck-duck-scrape...");
    try {
        const results = await search("gta 6 release date", {
            safeSearch: SafeSearchType.MODERATE,
        });
        console.log("Web Results:");
        console.dir(results.results.slice(0, 2), { depth: null });

        const news = await searchNews("gta 6");
        console.log("News Results:");
        console.dir(news.results.slice(0, 2), { depth: null });

        const images = await searchImages("gta 6");
        console.log("Images Results:");
        console.dir(images.results.slice(0, 2), { depth: null });
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
