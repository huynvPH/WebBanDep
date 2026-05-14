import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "../shop/index";

export const Route = createFileRoute("/shop/clogs")({ component: () => <ShopPage category="clog" /> });
