import { batch1Schema, batch2Schema, batch3Schema } from "./schemas";

const OLLAMA_API_ENDPOINT = "http://165.232.183.161/api/generate";

const promptSuffix = `generate travel data according to the schema and in json format,
                     do not return anything in your response outside of curly braces, 
                     generate response as per the function schema provided. Dates given,
                     activity preference and travelling with may influence like 50% while generating plan.
                     REMEMBER: TO give the response in JSON format and do not miss any field in the schema and meet the case of the attributes.`;

type OpenAIInputType = {
  userPrompt: string;
  activityPreferences?: string[] | undefined;
  fromDate?: number | undefined;
  toDate?: number | undefined;
  companion?: string | undefined;
};

const callOllamaApi = async (
  prompt: string,
  schema: any,
  description: string
): Promise<string> => {
  console.log({ prompt, schema });
  try {
    const response = await fetch(OLLAMA_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-pro:latest",
        prompt: `${description}\n\n${prompt}`,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const generatebatch1 = async (promptText: string): Promise<string> => {
  const prompt = `${promptText}, ${promptSuffix}`;
  const description = `Generate a description of information about a place or location according to the following schema:

  - About the Place:
    - A string containing information about the place, comprising at least 50 words.
  
  - Best Time to Visit:
    - A string specifying the best time to visit the place.
  
  Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.
  `;
  return await callOllamaApi(prompt, batch1Schema, description);
};

export const generatebatch2 = async (
  inputParams: OpenAIInputType
): Promise<string> => {
  const description = `Generate a description of recommendations for an adventurous trip according to the following schema:
  - Top Adventures Activities:
    - An array listing top adventure activities to do, including at least 5 activities.
    - Each activity should be specified along with its location.
  
  - Local Cuisine Recommendations:
    - An array providing recommendations for local cuisine to try during the trip.
  
  - Packing Checklist:
    - An array containing items that should be included in the packing checklist for the trip.
  
  Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;
  return await callOllamaApi(getPrompt(inputParams), batch2Schema, description);
};

export const generatebatch3 = async (
  inputParams: OpenAIInputType
): Promise<string> => {
  const description = `Generate a description of a travel itinerary and top places to visit according to the following schema:
  - Itinerary:
    - An array containing details of the itinerary for the specified number of days.
    - Each day's itinerary includes a title and activities for morning, afternoon, and evening.
    - Activities are described as follows:
      - Morning, Afternoon, Evening:
        - Each includes an array of itinerary items, where each item has a description and a brief description.
  
  - Top Places to Visit:
    - An array listing the top places to visit along with their coordinates.
    - Each place includes a name and coordinates (latitude and longitude).
  
  Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;
  return await callOllamaApi(getPrompt(inputParams), batch3Schema, description);
};

const getPrompt = ({
  userPrompt,
  activityPreferences,
  companion,
  fromDate,
  toDate,
}: OpenAIInputType): string => {
  let prompt = `${userPrompt}, from date-${fromDate} to date-${toDate}`;

  if (companion && companion.length > 0)
    prompt += `, travelling with-${companion}`;

  if (activityPreferences && activityPreferences.length > 0)
    prompt += `, activity preferences-${activityPreferences.join(",")}`;

  prompt = `${prompt}, ${promptSuffix}`;
  return prompt;
};
