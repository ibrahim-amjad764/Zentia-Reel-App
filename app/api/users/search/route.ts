//app/api/users/search/route.ts

import { AppDataSource } from "../../../../src/db/data-source";
import { NextResponse } from "next/server";
import { User } from "../../../../src/entities/user";
import  sanitize  from "sanitize-html";


export async function GET(req: Request) {
    try {
        console.log(" Search API hit");

        const { searchParams } = new URL(req.url);
        const rawQuery = searchParams.get("q");

        console.log(" Raw Query:", rawQuery);

        if (!rawQuery) {
            return NextResponse.json({ users: [] });
        }
        
        // SECURITY: Sanitize user input to prevent XSS and injection attacks
        // Remove all HTML tags and special characters, keep only safe text
        const sanitizedQuery = sanitize(rawQuery.trim(), {
            allowedTags: [], //No HTML tags allowed
            allowedAttributes: {}, //No attribut allowed
            textFilter: (text) => text.replace(/[<>]/g, '') //Remove angle brackets
        });

        console.log(" Sanitized Query:", sanitizedQuery);

        //  IMPORTANT: Ensure DB initialized
        if (!AppDataSource!.isInitialized) {
            console.log(" Initializing DB...");
            await AppDataSource!.initialize();
        }

        const repo = AppDataSource!.getRepository(User);

        const users = await repo
            .createQueryBuilder("user")
            .where("LOWER(user.email) LIKE LOWER(:query)", {
                query: `%${sanitizedQuery}%`,
            })
            .limit(10)
            .getMany();

        console.log(" Found users:", users.length);

        return NextResponse.json({ users });

    } catch (error) {
        console.error(" API ERROR:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}