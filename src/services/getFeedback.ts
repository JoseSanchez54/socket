import fetch from "cross-fetch";

import getExamples from "./getExamples";
import { Feedback } from "../enums";
import Logger from "../logger";

interface CohereAPIResponse {
    id: string;
    classifications: {
        id: string;
        input: string;
        prediction: Feedback;
        confidence: number;
        confidences: {
            option: Feedback;
            confidence: number;
        }[];
        labels: {
            [Feedback.Positive]: { confidence: number };
            [Feedback.Negative]: { confidence: number };
            [Feedback.Neutral]: { confidence: number };
            [Feedback.Unknown]: { confidence: number };
        };
    }[];
}


let examples;
getExamples("v2.csv").then(data => {
    examples = data;
});

export default async function getFeedback(message: any): Promise<Feedback> {
    try {
        const req2 = await fetch(`https://classify-nu.vercel.app/classify?text=${message.message}&pa=Gestion_2020`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(res => console.log(`Añadido ${res.json()}`));
        
        const request = await fetch("https://api.cohere.ai/classify", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                /* Authorization: `Bearerd ${process.env.COHERE_API_KEY}` */
            },
            body: JSON.stringify({
                model: "multilingual-22-12",
                inputs: [message],
                examples,
            }),
        });
        const response: CohereAPIResponse = await request.json();
        if (request.status !== 200) {
            Logger.log(
                `Couldn't get feedback from message: '${message}'. ${JSON.stringify(response)}`,
                false
            );

            return Feedback.Unknown;
        }

        const feedback = response.classifications[0].prediction;
       
        console.log("añadido")
        return feedback;
    } catch (e) {


        return Feedback.Unknown;
    }
}
