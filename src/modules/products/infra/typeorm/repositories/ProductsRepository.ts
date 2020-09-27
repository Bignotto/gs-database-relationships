import { getRepository, Repository, In, getConnection } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';
import AppError from '@shared/errors/AppError';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const foundProduct = await this.ormRepository.findOne({
      where: { name },
    });
    return foundProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsToFind = products.map(product => {
      return { id: product.id };
    });
    const foundProduct = await this.ormRepository.findByIds(productsToFind, {
      select: ['id', 'price', 'quantity', 'name'],
    });
    return foundProduct;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsToUpdate = products.map(product => product.id);
    const foundProducts = await this.ormRepository.findByIds(productsToUpdate);

    const updatedProducts = foundProducts.map((product, idx, _) => {
      const productToUpdateIndex = products.findIndex(p => p.id === product.id);

      product.quantity -= products[productToUpdateIndex].quantity;
      return product;
    });

    const savedUpdatedProducts = await this.ormRepository.save(updatedProducts);
    return savedUpdatedProducts;
  }
}

export default ProductsRepository;
