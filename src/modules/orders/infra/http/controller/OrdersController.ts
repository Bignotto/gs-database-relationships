import { Request, Response } from 'express';

import { container, inject, injectable } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

@injectable()
export default class OrdersController {
  constructor(
    @inject('')
  )
  public async show(request: Request, response: Response): Promise<Response> {
    //TODO: OrdersControler show
    return response.json({ message: 'OK' }); // TODO
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { cusomer_id, }
    return response.json({ message: 'OK' }); // TODO
  }
}
