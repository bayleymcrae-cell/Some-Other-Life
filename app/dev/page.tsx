import { requireChatGPTUser } from "../chatgpt-auth";
import { isStudioOwner } from "../../lib/studio-auth";
import DevClient from "./DevClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Supplier Studio | SOME OTHER LIFE",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function DevPage() {
  await requireChatGPTUser("/dev");
  if (!(await isStudioOwner())) {
    return <main className="studio-page"><p>SOME OTHER LIFE</p><h1>This area is private.</h1><a href="/">Back to Collection 01</a></main>;
  }
  return <DevClient />;
}
