import fs from "fs/promises"
import type { NextApiRequest, NextApiResponse } from 'next'

import { Configuration, OpenAIApi } from "openai";

const API_KEY = process.env.OPENAI_API_KEY;

type FilePath = {
    path: string,
    code: string
} | {
    error: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FilePath>
  ) {
    const features = req.body.feature;
    console.log(features);
    try {
        if (!API_KEY) {
            throw new Error('API_KEY is not defined');
        }
        
        const config = new Configuration({
            apiKey: API_KEY,
        });
        
        const openai = new OpenAIApi(config);
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            max_tokens: 2048,
            prompt: `以下の要件を満たすHTML/CSSを生成してください。CSSはインラインで入れてください。画像があればダミーの画像をsource.unsplash.comかapi.lorem.spaceを使って入れてください。\n\n${features}`,
        });
        console.log(completion);
        if (completion.data.choices.length === 0) {
            res.status(500).json({ error: 'Error!!' });
            return;
        }

        if (!completion.data.choices[0].text) {
            res.status(500).json({ error: 'Error!!' });
            return;
        }
        const now = Date.now();
        await fs.writeFile(`./public/${now}.html`, completion.data.choices[0].text);
        res.status(200).json({ path: `${now}.html`, code: completion.data.choices[0].text })
    } catch (e) {
        console.error(e);
    }
  }