import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (import.meta.env.VITE_GEMINI_API_KEY as string) });

export const extractPropertyDetails = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract ALL details from this real estate listing text. Respond ONLY with JSON.

Text: ${text}

Schema:
{
  "listing_title": "string or null",
  "listing_type": "For Sale | For Rent | For Lease",
  "property_category": "House | Land | Apartment | Building | Commercial | Villa | Farm Land | Hotel",
  "district": "string (Capitalized)",
  "city": "string or null",
  "price_lkr": number or null,
  "is_negotiable": boolean,
  "rooms": number or null,
  "bathrooms": number or null,
  "land_area": "string or null",
  "floor_area": "string or null",
  "property_description": "string or null",
  "additional_info": "string or null",
  "mobile": "string or null",
  "google_maps_link": "string or null",
  "confidence": number (0-100)
}

RULES:
- price_lkr = number only (e.g. 45000000)
- mobile starts with 07
- If location is mentioned as "Colombo 7", district is "Colombo" and city is "Colombo 7"
- Extract any google maps links found`,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse extraction", e);
    return null;
  }
};

export const translateDescription = async (text: string, targetLanguage: 'sinhala' | 'tamil') => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following property description into professional and accurate ${targetLanguage} for a real estate listing in Sri Lanka.
    
    Description:
    ${text}
    
    Return ONLY the translated text.`,
  });
  
  return response.text;
};

export const getSmartSearchFilters = async (query: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract search filters from this natural language real estate query: "${query}"
    
    Return ONLY JSON:
    {
      "category": "House | Land | Apartment | Building | Commercial | Villa | Farm Land | Hotel | null",
      "location": "string | null",
      "max_price": number | null,
      "min_price": number | null,
      "features": ["string"],
      "type": "For Sale | For Rent | null"
    }`,
    config: {
      responseMimeType: "application/json"
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

export const getChatbotResponse = async (userMessage: string, history: any[], propertyContext?: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a helpful assistant for LankaProperty.lk Sri Lanka's premier real estate website. 
      Help visitors find properties, answer questions about listings and the Sri Lankan property market.
      Keep responses concise and informative. 
      ${propertyContext ? `Currently, the user is looking at this property: ${propertyContext}` : ''}`,
    },
    // We can't easily pass history array here simplified for now or implement properly
  });
  
  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
};

export const getMarketAnalysis = async (data: {
  listing_type: string;
  property_category: string;
  district: string;
  city: string;
  price_lkr: string | number;
  rooms: string | number;
  bathrooms: string | number;
  land_area: string;
  floor_area: string;
}) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a Sri Lankan real estate expert. Analyze this property price vs market value:
        
        Listing Type: ${data.listing_type}
        Category: ${data.property_category}
        District: ${data.district}
        City: ${data.city}
        Price: Rs. ${data.price_lkr}
        Bedrooms: ${data.rooms}
        Bathrooms: ${data.bathrooms}
        Land Area: ${data.land_area}
        Floor Area: ${data.floor_area}
        
        Return ONLY this JSON:
        {
          "market_min": number,
          "market_max": number,
          "market_avg": number,
          "gauge_position": number,
          "rating": "too_low" | "low" | "fair" | "high" | "too_high",
          "price_per_perch": number | null,
          "verdict": "string",
          "advice": "string"
        }
        
        gauge_position:
        0-20 = Too Low
        20-40 = Low  
        40-60 = Fair
        60-80 = High
        80-100 = Too High`,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};
