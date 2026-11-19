import { getChatGPTUser } from "../app/chatgpt-auth";

// This comparison uses trusted, dispatch-owned identity headers on the server.
const OWNER_EMAIL = "bayleymcrae@gmail.com";
export async function isStudioOwner() {
  const user = await getChatGPTUser();
  return !!user && user.email.toLowerCase() === OWNER_EMAIL;
}
