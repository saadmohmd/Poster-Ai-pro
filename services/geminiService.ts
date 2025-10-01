import { GoogleGenAI, GenerateContentResponse, Part, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getFirstImagePart = (response: GenerateContentResponse): Part | undefined => {
    return response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
}

export const removeBackground = async (imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: imageBase64, mimeType } },
                    { text: 'Remove the background from this image completely, leaving only the main subject against a transparent background. Do not add any extra elements, shadows, or reflections.' }
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = getFirstImagePart(response);
        if (imagePart?.inlineData?.data) {
            return imagePart.inlineData.data;
        } else {
            throw new Error("AI did not return an image. It might have failed to process the request.");
        }
    } catch (error) {
        console.error("Error in removeBackground:", error);
        throw new Error("Failed to communicate with AI for background removal.");
    }
};

interface GeneratePosterParams {
    productImagesBase64: string[];
    concept: string;
    aspectRatio: string;
    referenceImages: { mimeType: string; base64: string }[] | null;
    posterText?: string;
    fontStyle?: string;
    backgroundConcept?: string;
}

const generateSinglePoster = async ({
    productImagesBase64,
    concept,
    aspectRatio,
    referenceImages,
    vibe,
    posterText,
    fontStyle,
    backgroundConcept,
}: GeneratePosterParams & { vibe: string }): Promise<string> => {
    
    const parts: Part[] = [];

    productImagesBase64.forEach(base64 => {
        parts.push({ inlineData: { data: base64, mimeType: 'image/png' } });
    });

    let promptText = `Create a professional and visually appealing product poster with a strict ${aspectRatio} aspect ratio. It must incorporate ALL of the provided product images as the main subjects.`;
    promptText += ` The overall theme and concept is: "${concept}".`;
    promptText += ` The desired artistic vibe is: "${vibe}".`;

    if (backgroundConcept && backgroundConcept.trim() !== '') {
        promptText += ` For the background, you must strictly adhere to this description: "${backgroundConcept}".`;
    } else {
        promptText += ` The background and surrounding elements should be generated to complement the products and the overall theme.`;
    }

    if (posterText && posterText.trim() !== '') {
        promptText += ` The poster must prominently feature the text: "${posterText}".`;
        if (fontStyle) {
            promptText += ` The text should be rendered in ${fontStyle}.`;
        }
        promptText += ` Ensure the text is legible, well-integrated into the design, and complements the overall aesthetic.`;
    }

    promptText += ` The final output must be a single, complete poster image.`;
    
    parts.push({ text: promptText });

    if (referenceImages && referenceImages.length > 0) {
        referenceImages.forEach(refImg => {
            parts.push({ inlineData: { data: refImg.base64, mimeType: refImg.mimeType } });
        });
        parts.push({ text: "Use the additional image(s) provided as a strong stylistic and compositional reference for the new poster." });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    const imagePart = getFirstImagePart(response);
    if (imagePart?.inlineData?.data) {
        return imagePart.inlineData.data;
    } else {
        // Fallback or error
        throw new Error(`AI did not return a poster image for the '${vibe}' vibe.`);
    }
};

export const generatePoster = async (params: GeneratePosterParams): Promise<string[]> => {
    try {
        const vibes = [
            "Vibrant and energetic with dynamic lighting and bold colors.",
            "Minimalist and clean with a lot of negative space and simple, elegant typography.",
            "Luxurious and elegant with rich textures, sophisticated typography, and a premium look.",
            "A retro, vintage-inspired design using distressed textures and a muted color palette.",
            "A photorealistic style that blends the product seamlessly into a real-world scene with natural lighting.",
            "A bold, graphic style with strong lines, high-contrast colors, and impactful typography."
        ];

        const posterPromises = vibes.map(vibe => generateSinglePoster({ ...params, vibe }));

        const results = await Promise.all(posterPromises);
        return results;

    } catch (error) {
        console.error("Error in generatePoster:", error);
        throw new Error("Failed to communicate with AI for poster generation.");
    }
};


export const refinePoster = async (currentPosterBase64: string, refinementPrompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: currentPosterBase64, mimeType: 'image/png' } },
                    { text: `Refine the provided poster image based on this instruction: "${refinementPrompt}". Apply the change while maintaining the overall quality and composition. Output only the final, modified image.` }
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = getFirstImagePart(response);
        if (imagePart?.inlineData?.data) {
            return imagePart.inlineData.data;
        } else {
            throw new Error("AI did not return a refined image. Please try a different instruction.");
        }
    } catch (error) {
        console.error("Error in refinePoster:", error);
        throw new Error("Failed to communicate with AI for poster refinement.");
    }
};

export const getPosterConceptSuggestions = async (productImagesBase64: string[]): Promise<string> => {
    try {
        const parts: Part[] = [];

        productImagesBase64.forEach(base64 => {
            parts.push({ inlineData: { data: base64, mimeType: 'image/png' } });
        });

        parts.push({ text: 'You are a creative director. Based on the provided product image(s), generate a creative and compelling poster concept. The description should be around 100 words, focusing on the theme, mood, and potential taglines. The product is the main subject. Provide only the concept text, without any introductory phrases.' });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
        });

        return response.text;
    } catch (error) {
        console.error("Error in getPosterConceptSuggestions:", error);
        throw new Error("Failed to communicate with AI for concept suggestions.");
    }
};