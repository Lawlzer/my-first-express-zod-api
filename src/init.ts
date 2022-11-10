import { initDotenv, throwError } from '@lawlzer/helpers';
import betterModuleAlias from 'better-module-alias';
import mongoose from 'mongoose';
import path from 'path';

initDotenv();

mongoose.connect(`${process.env.MONGO_URI || throwError('No process.env.MONGO_URI')}/${process.env.MONGO_DATABASE || throwError('No process.env.MONGO_DATABASE')}`);

betterModuleAlias(path.resolve(__dirname, '../')); // This will be updated once better-module-alias is updated
