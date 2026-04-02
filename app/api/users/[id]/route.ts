
//src/app/api/users/id/route
import { AppDataSource } from "../../../../src/db/data-source";
import { User } from "../../../../src/entities/user";
import { initDB } from "../../../../src/db/init-db";

// GET user by id
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();

    const { id } = await context.params; // keep id as string

    const repo = AppDataSource!.getRepository(User);
    const user = await repo.findOneBy({ id }); // no number conversion

    if (!user) {
      console.log(`[GET] User with id ${id} not found`);
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (err) {
    console.error("[GET USER ERROR]", err);
    return Response.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// PATCH user
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();

    const { id } = await context.params;

    const body = await req.json();
    delete body.id;

    const repo = AppDataSource!.getRepository(User);
    const user = await repo.findOneBy({ id });
    if (!user) return Response.json({ message: "User not found" }, { status: 404 });

    Object.assign(user, body);
    const saved = await repo.save(user);

    console.log("[PATCH] User updated:", saved.id);
    return Response.json(saved);
  } catch (err) {
    console.error("[PATCH ERROR]", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();

    const { id } = await context.params;

    const repo = AppDataSource!.getRepository(User);
    const user = await repo.findOneBy({ id });
    if (!user) return Response.json({ message: "User not found" }, { status: 404 });

    await repo.remove(user);
    console.log("[DELETE] User removed:", user.id);

    return Response.json({ success: true });
  } catch (err) {
    console.error("[DELETE ERROR]", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}