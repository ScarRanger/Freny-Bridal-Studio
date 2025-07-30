import { NextResponse } from 'next/server';
import { updateGoogleSheets, deleteFromGoogleSheets } from '@/lib/googleSheets';

export async function POST(req) {
  try {
    const body = await req.json();
    const { rowIndex, customerData } = body;
    await updateGoogleSheets(rowIndex, customerData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { rowIndex } = body;
    await deleteFromGoogleSheets(rowIndex);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
