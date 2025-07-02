import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering for debugging
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API called');
    
    // Environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      timestamp: new Date().toISOString(),
      workingDirectory: process.cwd(),
    };

    console.log('🌍 Environment:', envInfo);

    // Check if cache file exists
    const cacheFilePath = path.join(process.cwd(), 'temp', 'metadata.json');
    
    let cacheInfo;
    try {
      const cacheExists = fs.existsSync(cacheFilePath);
      if (cacheExists) {
        const cacheStats = fs.statSync(cacheFilePath);
        cacheInfo = {
          exists: true,
          size: cacheStats.size,
          modified: cacheStats.mtime.toISOString(),
          path: cacheFilePath
        };
      } else {
        cacheInfo = {
          exists: false,
          path: cacheFilePath
        };
      }
    } catch (error: any) {
      cacheInfo = {
        error: error.message
      };
    }

    console.log('📁 Cache Info:', cacheInfo);

    // Check temp directory
    let tempDirInfo;
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      const tempExists = fs.existsSync(tempDir);
      if (tempExists) {
        const files = fs.readdirSync(tempDir);
        tempDirInfo = {
          exists: true,
          files: files.map((file: string) => {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            return {
              name: file,
              size: stats.size,
              modified: stats.mtime.toISOString()
            };
          })
        };
      } else {
        tempDirInfo = { exists: false };
      }
    } catch (error: any) {
      tempDirInfo = { error: error.message };
    }

    // Check entity imports
    let entityInfo;
    try {
      const { User, Todo, Session } = await import('@/src/entities');
      entityInfo = {
        status: '✅ Entities imported',
        entities: [
          { name: 'User', type: typeof User },
          { name: 'Todo', type: typeof Todo },
          { name: 'Session', type: typeof Session }
        ]
      };
    } catch (error: any) {
      entityInfo = {
        status: '❌ Entity import failed',
        error: error.message
      };
    }

    const debugData = {
      environment: envInfo,
      cache: cacheInfo,
      tempDirectory: tempDirInfo,
      entities: entityInfo,
      userAgent: request.headers.get('user-agent'),
      url: request.url,
    };

    console.log('📊 Debug Summary:', JSON.stringify(debugData, null, 2));

    return NextResponse.json(debugData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    console.error('💥 Debug API Error:', error);
    
    return NextResponse.json({
      error: 'Debug API failed',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
} 