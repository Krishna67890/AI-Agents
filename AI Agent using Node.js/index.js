import OpenAI from "openai";
import readlineSync from "readline-sync";

const OPENAI_API_KEY = "YOUR_API_KEY_HERE";

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// 🌤 Weather Function
function getWeatherDetails(city = ''){
    const name = city.toLowerCase();

    if(name === 'nashik') return '10°C';
    if(name === 'pune') return '14°C';
    if(name === 'mumbai') return '20°C';
    if(name === 'chalisgaon') return '9°C';
    if(name === 'jalgaon') return '12°C';

    return 'City not found';
}

// 🛠 Tools Object (fixed spelling)
const tools = {
    "getWeatherDetails": getWeatherDetails
};

const SYSTEM_PROMPT = `
You are an AI Assistant with START, PLAN, ACTION, OBSERVATION and OUTPUT State.

Wait for the user prompt.
First PLAN using available tools.
Then take ACTION.
Wait for OBSERVATION.
Finally give OUTPUT.

Strictly respond in JSON format.

Available Tools:
- function getWeatherDetails(city: string): string
`;

const messages = [
    { role:'system', content:SYSTEM_PROMPT }
];

const main = async () => {

    while (true){

        const query = readlineSync.question('>> ');

        const q = {
            type:'user',
            user: query,
        };

        messages.push({
            role: 'user',
            content: JSON.stringify(q)
        });

        while(true){

            const chat = await client.chat.completions.create({
                model:'gpt-4o',
                messages: messages,
                response_format: { type: "json_object" }
            });

            const result = chat.choices[0].message.content;

            messages.push({
                role:'assistant',
                content: result
            });

            console.log(`\n------------ START AI -----------`);
            console.log(result);
            console.log(`------------ END AI -----------\n`);

            const call = JSON.parse(result);

            if(call.type === "output"){
                console.log(`🤖 Final Answer: ${call.output}`);
                break;
            } 
            
            else if(call.type === "action"){
                const fn = tools[call.function];

                if(!fn){
                    console.log("❌ Tool not found");
                    break;
                }

                const observation = fn(call.input);

                const obs = {
                    type: "observation",
                    observation: observation
                };

                messages.push({
                    role:"developer",
                    content: JSON.stringify(obs)
                });
            }
        }
    }
};

main();
