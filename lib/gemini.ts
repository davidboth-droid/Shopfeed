'use client';

import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "./types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const getAI = () => {
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

const cleanHtml = (html: string) => {
  // Remove scripts, styles, svg, and comments to reduce token usage
  return html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
    .replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gim, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const discoverProductUrls = async (html: string, baseUrl: string) => {
  const ai = getAI();
  const cleaned = cleanHtml(html);
  const truncatedHtml = cleaned.length > 30000 ? cleaned.substring(0, 30000) : cleaned;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this cleaned HTML from the e-commerce site ${baseUrl} and identify absolute URLs that lead to individual product pages. 
    Exclude category pages, blog, cart, login, or contact pages. 
    Return a JSON array of literal strings.

    HTML:
    ${truncatedHtml}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const optimizeProductText = async (product: Partial<Product>) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Optimize this product for Google Shopping. 
    Improve the title to be descriptive (including brand, material, and key specs).
    Rewrite the description to be professional and highlight key selling points.
    
    Current Product:
    Title: ${product.title}
    Description: ${product.description}
    Brand: ${product.brand || 'Unknown'}

    Return JSON with "title" and "description".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['title', 'description']
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"title": "", "description": ""}');
  } catch (e) {
    return { 
      title: product.title, 
      description: product.description
    };
  }
};

export const extractProductData = async (html: string) => {
  const ai = getAI();
  const cleaned = cleanHtml(html);
  const truncatedHtml = cleaned.length > 40000 ? cleaned.substring(0, 40000) : cleaned;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as an expert e-commerce data extractor. Extract ALL product information from this cleaned HTML for a Google Shopping Feed. 
    Look for pricing, imagery, and detailed descriptions.
    If multiple products are found, return all of them.
    
    Fields to extract per product:
    - title: Clear product name
    - description: Full product details
    - price: Numerical value with currency (e.g., "$29.99")
    - imageLink: Absolute URL to the primary product image
    - link: Absolute URL to the product page
    - brand: Brand name if visible
    - availability: Map to ['in stock', 'out of stock', 'preorder', 'backorder']

    HTML snippet:
    ${truncatedHtml}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            link: { type: Type.STRING },
            imageLink: { type: Type.STRING },
            price: { type: Type.STRING },
            brand: { type: Type.STRING },
            gtin: { type: Type.STRING },
            mpn: { type: Type.STRING },
            condition: { 
              type: Type.STRING,
              enum: ['new', 'refurbished', 'used']
            },
            availability: {
              type: Type.STRING,
              enum: ['in stock', 'out of stock', 'preorder', 'backorder']
            }
          },
          required: ['title', 'link', 'imageLink', 'price']
        }
      }
    }
  });

  try {
    const products = JSON.parse(response.text || '[]');
    return products;
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return [];
  }
};
