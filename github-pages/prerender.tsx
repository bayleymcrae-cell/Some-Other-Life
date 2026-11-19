import { renderToString } from "react-dom/server";
import CollectionExperience from "../components/collection-experience";
import PrivacyRequest from "../app/privacy-request/page";
import Unsubscribe from "../app/unsubscribe/page";

export const pages = {
  "/": renderToString(<CollectionExperience />),
  "/privacy-request": renderToString(<PrivacyRequest />),
  "/unsubscribe": renderToString(<Unsubscribe />),
};
