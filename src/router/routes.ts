import { Router, Request, Response } from 'express';

const routes = Router();

routes.get('/', async (req: Request, res: Response) => {
  res.send({ status: true, msg: 'Aviator_2.0 Backend Testing is up and running!! 👍' });
});

export { routes };
