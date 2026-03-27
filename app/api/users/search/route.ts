//app/api/users/search/route.ts

import { NextResponse } from "next/server";
import { AppDataSource } from "../../../../src/db/data-source";
import { User } from "../../../../src/entities/user";

export async function GET(req: Request) {
    try {
        console.log(" Search API hit");

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        console.log(" Query:", query);

        if (!query) {
            return NextResponse.json({ users: [] });
        }

        //  IMPORTANT: Ensure DB initialized
        if (!AppDataSource!.isInitialized) {
            console.log(" Initializing DB...");
            await AppDataSource!.initialize();
        }

        const repo = AppDataSource!.getRepository(User);

        const users = await repo

            .createQueryBuilder("user")
            .where("LOWER(user.email) LIKE LOWER(:query)", {
                query: `%${query}%`,
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