import { hydrateRoot } from "react-dom/client";
import CollectionExperience from "../components/collection-experience";
import PrivacyRequest from "../app/privacy-request/page";
import Unsubscribe from "../app/unsubscribe/page";
import "../app/globals.css";

const path = window.location.pathname.replace(/\/$/, "");
const page = path === "/privacy-request" ? <PrivacyRequest />
  : path === "/unsubscribe" ? <Unsubscribe /> : <CollectionExperience />;
hydrateRoot(document.getElementById("root")!, page);
