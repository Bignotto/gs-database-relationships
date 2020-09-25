import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';

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
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError(
        'CreateOrderService: Must be a valid customer to place an order.',
      );
    }

    const productsList = await this.productsRepository.findAllById(products);
    if (productsList.length < products.length) {
      throw new AppError('CreateOrderService: Invalid products on your list!');
    }

    const qttAndPrc = productsList.map((product, idx, prdArray) => {
      let qttIdx = products.findIndex(p => p.id === product.id);

      if (product.quantity - products[qttIdx].quantity < 0) {
        throw new AppError(
          `Product quantity drops bellow zero: ${product.name}`,
        );
      }

      return {
        product_id: product.id,
        price: product.price,
        quantity: products[qttIdx].quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: qttAndPrc,
    });

    const updateProductQuantity = qttAndPrc.map(p => {
      return {
        id: p.product_id,
        quantity: p.quantity,
      };
    });

    await this.productsRepository.updateQuantity(updateProductQuantity);

    return order;
  }
}

export default CreateOrderService;
