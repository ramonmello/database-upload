import { getRepository, getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (balance.total < value) {
        throw new AppError('Saldo insuficiente.');
      }
    }

    let checkExistsCategory = await categoriesRepository.findOne({
      title: category,
    });

    if (!checkExistsCategory) {
      checkExistsCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(checkExistsCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: checkExistsCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
