import {NextRequest, NextResponse} from "next/server";
import crypto from 'crypto';

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
    try {
        // Parse Cloudinary credentials from CLOUDINARY_URL env var
        const cloudinaryUrl = process.env.CLOUDINARY_URL || '';
        const matches = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
        if (!matches) {
            return NextResponse.json({ message: 'Cloudinary not configured' }, { status: 500 });
        }
        const [, apiKey, apiSecret, cloudName] = matches;

        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400 })
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: 'Image file is required'}, { status: 400 })

        const tags = JSON.parse(formData.get('tags') as string);
        const agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary using the REST API directly (avoids SDK timeout issues)
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const paramsToSign = `folder=DevEvent&timestamp=${timestamp}`;
        const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

        const uploadForm = new FormData();
        uploadForm.append('file', new Blob([buffer], { type: file.type }), file.name);
        uploadForm.append('folder', 'DevEvent');
        uploadForm.append('timestamp', timestamp);
        uploadForm.append('api_key', apiKey);
        uploadForm.append('signature', signature);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: uploadForm,
        });

        if (!uploadRes.ok) {
            const errBody = await uploadRes.text();
            console.error('Cloudinary upload failed:', errBody);
            return NextResponse.json({ message: 'Image upload failed', error: errBody }, { status: 500 });
        }

        const uploadResult = await uploadRes.json();

        event.image = uploadResult.secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error('Event creation error:', e);
        const errorMessage = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: errorMessage }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}
