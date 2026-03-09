import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { TemplateExportSchema } from '../../../../lib/schema'; 

// Handle Export 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get('docId') || 'default-doc';

  const documentData = db.get(docId);
  if (!documentData) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Strictly validate before returning
  const validation = TemplateExportSchema.safeParse(documentData.schema);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid schema state', details: validation.error }, { status: 500 });
  }

  return NextResponse.json(validation.data);
}

// Handle Upload 
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const docId = body.docId || 'default-doc';
    
    
    db.set(docId, {
      buffer: body.pdfBuffer, 
      schema: body.schema    
    });

    return NextResponse.json({ success: true, message: 'Saved to memory' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}