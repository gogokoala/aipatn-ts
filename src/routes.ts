import * as Router from "koa-router";
import { pingAction } from "./controller/ping";

/**
 * All application routes.
 */
export const router = new Router();

router.get('/ping', pingAction);

