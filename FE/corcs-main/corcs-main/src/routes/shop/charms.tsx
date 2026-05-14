import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "../shop/index";

export const Route = createFileRoute("/shop/charms")({ component: () => <ShopPage category="charm" /> });
