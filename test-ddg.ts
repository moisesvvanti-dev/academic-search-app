import * as ddg from "duckduckgo-search";

(console as any).warning = console.warn;

async function test() {
    console.log("Running search...");
    try {
        const defaultExport = ddg as any;
        const searchApi = defaultExport.default || defaultExport;
        if (searchApi.text) {
            const results = await searchApi.text("gta 6 release date", {
                region: "pt-br",
            });
            console.log("Got async generator");
            const items = [];
            for await (const result of results) {
                items.push(result);
                if (items.length >= 3) break;
            }
            console.log("Results via text():", items);

            console.log("Testing images:");
            const imagesIter = await searchApi.images("gta 6", { region: "pt-br" });
            const imageItems = [];
            for await (const img of imagesIter) {
                imageItems.push(img);
                if (imageItems.length >= 2) break;
            }
            console.log("Images via images():", imageItems);

        } else {
            console.log("No text method found.");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
