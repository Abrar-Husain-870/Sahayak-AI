import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/firebase";
import {
  doc,
  deleteDoc,
  getDoc, // <-- Add getDoc import
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      // Delete a single history item
      const docRef = doc(db, "history", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }

      if (docSnap.data().userId !== session.user.email) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await deleteDoc(docRef);
      return NextResponse.json({ message: "History item deleted" });
    } else {
      // Clear all history for the user
      const q = query(
        collection(db, "history"),
        where("userId", "==", session.user.email)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      return NextResponse.json({ message: "History cleared" });
    }
  } catch (error) {
    console.error("Error deleting history:", error);
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    );
  }
}
