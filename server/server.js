import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config(); // To use env variables from env file

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const PORT = 5000;

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors()); //Allows making the cross-origin requests and allow teh server to be called from the UI
app.use(express.json());

app.get('/', async (req,res) => {
    res.status(200).send({
        message: "Hello from Codex"
    })
});

app.post('/', async (req, res) =>{
    try {
        const prompt = req.body.prompt; //Extracting the text from the request

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0, //Higher value increases the risk, 0 => answer just from what it knows
            max_tokens: 3000, //Max number of tokens to genrate in a completion || 1 token = 4 chars(rough)
            /*The maximum number of tokens to generate in the completion. Most models have a context length of 2048 
            tokens (except for the newest models, which support 4096).*/ 
            top_p: 1, // alternative to sampling with temperature, called nucleus sampling
            frequency_penalty: 0.5, /* Not to repeat similar sentences often
            After AI's response when the users asks a similar question, it is less likely to say something similar*/
            presence_penalty: 0 /* Number between -2.0 and 2.0. Positive values penalize new tokens based on 
            whether they appear in the text so far, increasing the model's likelihood to talk about new topics.*/
        });

        res.status(200).send({
            bot: response.data.choices[0].text
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ error } || 'Something went wrong')
    }
})

app.listen(PORT, () => console.log(`Server is running on https://localhost:${PORT}`));