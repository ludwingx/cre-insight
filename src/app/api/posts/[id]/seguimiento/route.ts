import { PrismaClient, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Helper to handle errors
function handleError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      error: 'Database error',
      code: error.code,
      meta: error.meta,
      message: error.message
    };
  }
  
  if (error instanceof Error) {
    return {
      error: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
  
  return { error: 'Unknown error occurred' };
}

// Helper function to handle BigInt serialization
const safeJson = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Wait for params to resolve
    const { id: postId } = await context.params;
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    
    if (typeof body.seguimiento !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'seguimiento must be a boolean',
          received: typeof body.seguimiento,
          value: body.seguimiento
        },
        { status: 400 }
      );
    }

    // Convert the string ID to a number for the database
    const postIdNumber = parseInt(postId);
    if (isNaN(postIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid post ID format', id: postId },
        { status: 400 }
      );
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postIdNumber },
      data: {
        seguimiento: body.seguimiento,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(safeJson(updatedPost));
    
  } catch (error) {
    const errorResponse = handleError(error);
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
    
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting Prisma client:', e);
    }
  }
}
