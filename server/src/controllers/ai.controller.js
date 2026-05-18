const axios = require('axios');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Extrae la URL directa del post o video del código embed de Facebook
 */
function extraerUrlDeEmbed(embed) {
  if (!embed) return '';
  const trimmed = embed.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  
  const match = trimmed.match(/href=([^&"'\s>]+)/i);
  if (match) {
    try {
      return decodeURIComponent(match[1].replace(/["']/g, ''));
    } catch (e) {
      return '';
    }
  }
  return '';
}

const generateMetadata = async (req, res, next) => {
  try {
    const { texto, embedUrl } = req.body;
    
    let contentToAnalyze = texto || '';
    let extractedFromFB = false;

    // Si nos pasaron un embed, intentamos extraer los datos mediante la API oEmbed oficial
    if (embedUrl && embedUrl.trim().length > 0) {
      const realUrl = extraerUrlDeEmbed(embedUrl);
      
      if (realUrl.includes('facebook.com') && process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_CLIENT_TOKEN) {
        try {
          const oembedApiUrl = `https://graph.facebook.com/v18.0/oembed_post?url=${encodeURIComponent(realUrl)}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_CLIENT_TOKEN}`;
          const response = await axios.get(oembedApiUrl);
          
          if (response.data && response.data.html) {
            // Extraer el texto dentro de <p> de la respuesta de oEmbed
            const pMatch = response.data.html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
            if (pMatch && pMatch[1]) {
              contentToAnalyze = pMatch[1].replace(/<[^>]*>/g, '').trim(); // Eliminar HTML residual
              extractedFromFB = true;
            }
          }
        } catch (apiErr) {
          console.error('Error llamando a la API de oEmbed de Facebook:', apiErr.message);
        }
      }
      
      // Fallback si no pudimos extraer por oEmbed: intentamos ver si el código pegado en sí contiene blockquote con texto
      if (!contentToAnalyze) {
        const blockquoteMatch = embedUrl.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        if (blockquoteMatch && blockquoteMatch[1]) {
          contentToAnalyze = blockquoteMatch[1].replace(/<[^>]*>/g, '').trim();
        }
      }
    }

    if (!contentToAnalyze || contentToAnalyze.trim().length < 10) {
      // Si no hay texto ni credenciales
      const needsFBConfig = embedUrl && embedUrl.includes('facebook.com') && (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_CLIENT_TOKEN);
      const message = needsFBConfig 
        ? 'Para extraer automáticamente desde el Iframe de Facebook, necesitas configurar las credenciales gratuitas de Facebook Developers (FACEBOOK_APP_ID y FACEBOOK_CLIENT_TOKEN) en tu archivo .env. Mientras tanto, puedes pegar el texto de la publicación directamente en el campo de "Contenido completo" y usar la IA.'
        : 'No pudimos extraer texto del código proporcionado. Por favor, asegúrate de que el código incluya texto o pega el contenido manualmente en "Contenido completo" para analizarlo.';
        
      return res.status(400).json({ success: false, message });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { 
          role: 'system', 
          content: 'Eres un periodista experto en salud pública y comunicación institucional. Tu tarea es analizar el texto proporcionado (que es el contenido real de una publicación de Facebook/Instagram) y generar un "titulo" formal y atractivo (máximo 120 caracteres) y un "extracto" a modo de resumen breve (máximo 180 caracteres). Responde ÚNICAMENTE con un objeto JSON válido con las claves "titulo" y "extracto", sin ningún formato markdown ni explicaciones.'
        },
        { 
          role: 'user', 
          content: `Texto de la publicación:\n\n${contentToAnalyze.substring(0, 5000)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    res.json({
      success: true,
      data: {
        titulo: result.titulo || '',
        extracto: result.extracto || '',
        contenidoGenerado: extractedFromFB ? contentToAnalyze : undefined // Si lo extrajimos, podemos rellenar el contenido también
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateMetadata
};
