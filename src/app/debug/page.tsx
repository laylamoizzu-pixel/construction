import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
    try {
        const db = getAdminDb();
        const collections = await db.listCollections();
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold text-green-600">Firebase Admin Connection Successful</h1>
                <p>Collections found: {collections.length}</p>
                <ul>
                    {collections.map(c => <li key={c.id}>{c.id}</li>)}
                </ul>
            </div>
        );
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold text-red-600">Firebase Admin Connection Failed</h1>
                <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto">
                    {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
                </pre>
            </div>
        );
    }
}
