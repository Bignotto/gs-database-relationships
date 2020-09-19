import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    console.log('service running');
    //[] create order
    //[] get order id
    //[] create order_products

    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Must be a valid customer to place an order.');
    }

    const productsList = await this.productsRepository.findAllById(products);
    const qttAndPrc = productsList.map((prod, idx, prdArray) => {
      const qttIdx = products.findIndex(p => (p.id = prod.id));
      return {
        product_id: prod.id,
        price: prod.price,
        quantity: products[qttIdx].quantity,
      };
    });

    console.log(qttAndPrc);

    const order = this.ordersRepository.create({
      customer,
      products: qttAndPrc,
    });

    return order;
  }
}

export default CreateOrderService;
