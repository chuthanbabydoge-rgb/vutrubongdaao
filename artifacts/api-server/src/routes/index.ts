import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import leaguesRouter from "./leagues";
import teamsRouter from "./teams";
import playersRouter from "./players";
import matchesRouter from "./matches";
import usersRouter from "./users";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(leaguesRouter);
router.use(teamsRouter);
router.use(playersRouter);
router.use(matchesRouter);
router.use(usersRouter);
router.use(statsRouter);

export default router;
