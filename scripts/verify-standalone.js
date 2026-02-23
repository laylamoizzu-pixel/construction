const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GROQ_KEYS = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
    process.env.GROQ_API_KEY_6,
    process.env.GROQ_API_KEY_7,
    process.env.GROQ_API_KEY_8,
    process.env.GROQ_API_KEY_9,
    process.env.GROQ_API_KEY_10,
].filter(k => k && k.trim() !== "");

// De-duplicate
const uniqueKeys = Array.from(new Set(unique(GROQ_KEYS)));

function unique(arr) {
    return arr.map(k => k.trim());
}

async function verifyKeys() {
    console.log(`Found ${uniqueKeys.length} unique Groq keys.`);

    for (let i = 0; i < uniqueKeys.length; i++) {
        const key = uniqueKeys[i];
        const masked = key.substring(0, 8) + "..." + key.substring(key.length - 4);
        console.log(`\nTesting Key ${i + 1}: ${masked}`);

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 5
                }),
            });

            if (response.ok) {
                console.log(`✅ Key ${i + 1} is WORKING.`);
            } else {
                const err = await response.text();
                console.error(`❌ Key ${i + 1} FAILED: ${response.status} ${response.statusText}`);
                console.error(`   Error details: ${err}`);
            }
        } catch (error) {
            console.error(`❌ Key ${i + 1} encountered error:`, error.message);
        }
    }
}

// Logic verification (manual/code check simplified)
function verifyRotationLogic() {
    console.log("\n--- Rotation Logic Verification (Simulator) ---");

    const keys = uniqueKeys.map((k, i) => ({
        key: k,
        index: i,
        rateLimited: false,
        cooldownUntil: null
    }));

    let activeIndex = 0;

    function getActiveKey() {
        const now = Date.now();
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (!k.rateLimited && (!k.cooldownUntil || k.cooldownUntil <= now)) {
                return k;
            }
        }
        return null;
    }

    const k1 = getActiveKey();
    console.log(`Initial active key: Index ${k1.index}`);

    console.log(`Simulating rate limit on Index ${k1.index}...`);
    k1.rateLimited = true;

    const k2 = getActiveKey();
    if (k2 && k2.index !== k1.index) {
        console.log(`✅ Success: Switched to Index ${k2.index}`);
    } else {
        console.log(`❌ Failure: Did not switch or no keys left.`);
    }
}

verifyKeys().then(() => {
    verifyRotationLogic();
    console.log("\n--- Verification Complete ---");
}).catch(console.error);
