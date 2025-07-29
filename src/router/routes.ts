import { Router, Request, Response } from 'express';

const routes = Router();

routes.get('/', async (req: Request, res: Response) => {
  res.send({ status: true, msg: 'Avaitor_2.0 Game Backend Testing is up and running!! 👍' });
});

export { routes };
