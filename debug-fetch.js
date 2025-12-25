

async function testFetch() {
    try {
        console.log("Testing POST to http://localhost:3000/api/generate...");
        const response = await fetch("http://localhost:3000/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": "Bearer test" // Auth will fail but connection should work
            },
            body: JSON.stringify({
                keyword: "test",
                generationType: "text"
            })
        });

        console.log("Status:", response.status);
        console.log("Status Text:", response.statusText);
        const text = await response.text();
        console.log("Body:", text.substring(0, 100));

    } catch (e) {
        console.error("Fetch failed:", e);
        if (e.cause) console.error("Cause:", e.cause);
    }
}

testFetch();
