import { NextResponse } from 'next/server';

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST() {
  try {
    const response = await fetch('https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook/creinsights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'start_scraping',
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from webhook:', response.status, errorText);
      
      let errorMessage = `Error del servidor (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message?.includes('webhook is not registered')) {
          errorMessage = 'El webhook no está activo. Por favor, abre el flujo en n8n y haz clic en "Execute workflow".';
        } else {
          errorMessage = errorData.message || errorText;
        }
      } catch (e) {
        errorMessage = errorText;
      }
      
      return new NextResponse(JSON.stringify({ 
        error: errorMessage,
        details: 'El webhook de n8n no está activo o no está configurado correctamente.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const data = await response.json();
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error in scrape API route:', error);
    return new NextResponse(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to process request' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204, // 204 No Content
    headers: {
      ...corsHeaders,
      'Content-Length': '0',
    },
  });
}

export const dynamic = 'force-dynamic';
