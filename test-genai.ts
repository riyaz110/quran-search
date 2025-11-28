import { understandQuery } from './src/lib/genai';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

async function test() {
    console.log("Testing 'prayer times'...");
    const result = await understandQuery("prayer times");
    console.log(JSON.stringify(result, null, 2));
}

test();
